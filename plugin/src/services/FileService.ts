import { App, TFile, TFolder } from 'obsidian';
import { PARA, PARAType } from '../core/PARA';
import { IFileService } from '../interfaces/IFileService';
import { IPropertiesService } from '../interfaces/IPropertiesService';
import { ITagService } from '../interfaces/ITagService';
import { Result, ok, err, toResult } from '../utils/Result';
import { Option, some, none, fromNullable } from '../utils/Option';
import { FileOperationError } from '../utils/errors';

export type OrganizationMode = 'folder' | 'property' | 'hybrid';

export class FileService implements IFileService {
	private app: App;
	private para: PARA;
	private propertiesService: IPropertiesService;
	private tagService: ITagService;

	constructor(
		app: App,
		para: PARA,
		propertiesService: IPropertiesService,
		tagService: ITagService
	) {
		this.app = app;
		this.para = para;
		this.propertiesService = propertiesService;
		this.tagService = tagService;
	}

	/**
	 * Read file content
	 */
	async readFile(file: TFile): Promise<string> {
		return await this.app.vault.read(file);
	}

	/**
	 * Read file content (Result pattern)
	 */
	async readFileSafe(file: TFile): Promise<Result<string, FileOperationError>> {
		return toResult(
			this.app.vault.read(file).catch(error => {
				throw new FileOperationError(
					`Failed to read file: ${file.path}`,
					'read',
					file.path,
					{ error: error instanceof Error ? error.message : String(error) }
				);
			})
		);
	}

	/**
	 * Write content to file
	 */
	async writeFile(file: TFile, content: string): Promise<void> {
		await this.app.vault.modify(file, content);
	}

	/**
	 * Write content to file (Result pattern)
	 */
	async writeFileSafe(file: TFile, content: string): Promise<Result<void, FileOperationError>> {
		return toResult(
			this.app.vault.modify(file, content).catch(error => {
				throw new FileOperationError(
					`Failed to write file: ${file.path}`,
					'write',
					file.path,
					{ error: error instanceof Error ? error.message : String(error) }
				);
			})
		);
	}

	/**
	 * Create a new file
	 */
	async createFile(path: string, content: string): Promise<TFile> {
		return await this.app.vault.create(path, content);
	}

	/**
	 * Create a new file (Result pattern)
	 */
	async createFileSafe(path: string, content: string): Promise<Result<TFile, FileOperationError>> {
		return toResult(
			this.app.vault.create(path, content).catch(error => {
				throw new FileOperationError(
					`Failed to create file: ${path}`,
					'create',
					path,
					{ error: error instanceof Error ? error.message : String(error) }
				);
			})
		);
	}

	/**
	 * Move file to PARA folder
	 */
	async moveToPARAFolder(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<void> {
		const folderName = this.para.getFolderName(type, customFolders);
		const newPath = `${folderName}/${file.name}`;

		// Ensure folder exists
		await this.ensureFolderExists(folderName);

		// Move file
		await this.app.fileManager.renameFile(file, newPath);
	}

	/**
	 * Ensure folder exists, create if it doesn't
	 */
	async ensureFolderExists(folderPath: string): Promise<void> {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}
	}

	/**
	 * Get all files in PARA folder
	 */
	getFilesInPARAFolder(type: PARAType, customFolders?: Record<PARAType, string>): TFile[] {
		const folderName = this.para.getFolderName(type, customFolders);
		const folder = this.app.vault.getAbstractFileByPath(folderName) as TFolder;
		
		if (!folder) {
			return [];
		}

		const files: TFile[] = [];
		this.collectMarkdownFiles(folder, files);
		return files;
	}

	/**
	 * Recursively collect markdown files from folder
	 */
	private collectMarkdownFiles(folder: TFolder, files: TFile[]): void {
		for (const child of folder.children) {
			if (child instanceof TFile && child.extension === 'md') {
				files.push(child);
			} else if (child instanceof TFolder) {
				this.collectMarkdownFiles(child, files);
			}
		}
	}

	/**
	 * Delete file
	 */
	async deleteFile(file: TFile): Promise<void> {
		await this.app.vault.delete(file);
	}

	/**
	 * Check if file exists
	 */
	fileExists(path: string): boolean {
		return this.app.vault.getAbstractFileByPath(path) !== null;
	}

	/**
	 * Auto-detect PARA category from file
	 */
	async detectPARAType(
		file: TFile,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<PARAType | null> {
		if (mode === 'folder' || mode === 'hybrid') {
			const folderType = this.para.detectTypeFromPath(file.path, customFolders);
			if (folderType) {
				return folderType;
			}
		}

		if (mode === 'property' || mode === 'hybrid') {
			const propertyType = await this.propertiesService.getPARAType(file);
			if (propertyType) {
				return propertyType;
			}
		}

		return null;
	}

	/**
	 * Auto-detect PARA category from file (Option pattern)
	 */
	async detectPARATypeSafe(
		file: TFile,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<Option<PARAType>> {
		const result = await this.detectPARAType(file, mode, customFolders);
		return fromNullable(result);
	}

	/**
	 * Organize file to PARA category based on mode
	 */
	async organizeToPARA(
		file: TFile,
		type: PARAType,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<void> {
		// Folder-based organization
		if (mode === 'folder' || mode === 'hybrid') {
			await this.moveToPARAFolder(file, type, customFolders);
		}

		// Property-based organization
		if (mode === 'property' || mode === 'hybrid') {
			await this.propertiesService.setPARAType(file, type);
		}

		// Also update tags
		await this.tagService.addPARATag(file, type);
	}

	/**
	 * Batch organize multiple files
	 */
	async batchOrganize(
		files: TFile[],
		type: PARAType,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<void> {
		for (const file of files) {
			await this.organizeToPARA(file, type, mode, customFolders);
		}
	}

	/**
	 * Get files by PARA type based on organization mode
	 */
	async getFilesByPARAType(
		type: PARAType,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<TFile[]> {
		const files: TFile[] = [];

		if (mode === 'folder' || mode === 'hybrid') {
			const folderFiles = this.getFilesInPARAFolder(type, customFolders);
			files.push(...folderFiles);
		}

		if (mode === 'property' || mode === 'hybrid') {
			const allFiles = this.app.vault.getMarkdownFiles();
			for (const file of allFiles) {
				const fileType = await this.propertiesService.getPARAType(file);
				if (fileType === type) {
					// Avoid duplicates in hybrid mode
					if (mode === 'hybrid' && files.some(f => f.path === file.path)) {
						continue;
					}
					files.push(file);
				}
			}
		}

		return files;
	}
}

