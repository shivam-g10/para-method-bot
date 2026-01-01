import { App, TFile, TFolder } from 'obsidian';
import { PARA, PARAType } from '../core/PARA';
import { PropertiesService } from './PropertiesService';
import { TagService } from './TagService';

export type OrganizationMode = 'folder' | 'property' | 'hybrid';

export class FileService {
	private app: App;
	private para: PARA;
	private propertiesService: PropertiesService;

	constructor(app: App) {
		this.app = app;
		this.para = new PARA(app);
		this.propertiesService = new PropertiesService(app);
	}

	/**
	 * Read file content
	 */
	async readFile(file: TFile): Promise<string> {
		return await this.app.vault.read(file);
	}

	/**
	 * Write content to file
	 */
	async writeFile(file: TFile, content: string): Promise<void> {
		await this.app.vault.modify(file, content);
	}

	/**
	 * Create a new file
	 */
	async createFile(path: string, content: string): Promise<TFile> {
		return await this.app.vault.create(path, content);
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
		const tagService = new TagService(this.app);
		await tagService.addPARATag(file, type);
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

