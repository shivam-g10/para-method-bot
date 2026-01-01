import { App, TFile } from 'obsidian';
import { PARA, PARAType } from '../core/PARA';
import { IOrganizationStrategy } from './IOrganizationStrategy';

/**
 * Folder-based organization strategy.
 * Organizes files by moving them to PARA folders.
 */
export class FolderOrganizationStrategy implements IOrganizationStrategy {
	private app: App;
	private para: PARA;

	constructor(app: App) {
		this.app = app;
		this.para = new PARA(app);
	}

	/**
	 * Organize file to PARA category using folder structure
	 */
	async organize(
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
	 * Get location/path for file based on PARA type
	 */
	async getLocation(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<string> {
		const folderName = this.para.getFolderName(type, customFolders);
		return `${folderName}/${file.name}`;
	}

	/**
	 * Detect PARA type from file path
	 */
	async detectType(
		file: TFile,
		customFolders?: Record<PARAType, string>
	): Promise<PARAType | null> {
		return this.para.detectTypeFromPath(file.path, customFolders);
	}

	/**
	 * Get files by PARA type from folder structure
	 */
	async getFilesByType(
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<TFile[]> {
		const folderName = this.para.getFolderName(type, customFolders);
		const folder = this.app.vault.getAbstractFileByPath(folderName);
		
		if (!folder || !(folder instanceof import('obsidian').TFolder)) {
			return [];
		}

		const files: TFile[] = [];
		this.collectMarkdownFiles(folder, files);
		return files;
	}

	/**
	 * Ensure folder exists, create if it doesn't
	 */
	private async ensureFolderExists(folderPath: string): Promise<void> {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}
	}

	/**
	 * Recursively collect markdown files from folder
	 */
	private collectMarkdownFiles(
		folder: import('obsidian').TFolder,
		files: TFile[]
	): void {
		for (const child of folder.children) {
			if (child instanceof TFile && child.extension === 'md') {
				files.push(child);
			} else if (child instanceof import('obsidian').TFolder) {
				this.collectMarkdownFiles(child, files);
			}
		}
	}
}

