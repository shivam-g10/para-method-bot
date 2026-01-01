import { TFile } from 'obsidian';
import { IFileService } from '../../src/interfaces/IFileService';
import { PARAType } from '../../src/core/PARA';
import { OrganizationMode } from '../../src/services/FileService';

/**
 * Mock implementation of IFileService for testing
 */
export class MockFileService implements IFileService {
	private files: Map<string, string> = new Map();
	private fileObjects: Map<string, TFile> = new Map();

	async readFile(file: TFile): Promise<string> {
		return this.files.get(file.path) || '';
	}

	async writeFile(file: TFile, content: string): Promise<void> {
		this.files.set(file.path, content);
	}

	async createFile(path: string, content: string): Promise<TFile> {
		this.files.set(path, content);
		const mockFile = {
			path,
			name: path.split('/').pop() || path,
			basename: path.split('/').pop()?.replace('.md', '') || path,
			extension: 'md',
		} as TFile;
		this.fileObjects.set(path, mockFile);
		return mockFile;
	}

	async moveToPARAFolder(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<void> {
		// Mock implementation - just update path
		const content = this.files.get(file.path) || '';
		const newPath = `${type}/${file.name}`;
		this.files.delete(file.path);
		this.files.set(newPath, content);
	}

	async ensureFolderExists(folderPath: string): Promise<void> {
		// Mock implementation - no-op
	}

	getFilesInPARAFolder(
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): TFile[] {
		const folderName = customFolders?.[type] || type;
		return Array.from(this.fileObjects.values()).filter(f => f.path.startsWith(folderName));
	}

	async deleteFile(file: TFile): Promise<void> {
		this.files.delete(file.path);
		this.fileObjects.delete(file.path);
	}

	fileExists(path: string): boolean {
		return this.files.has(path);
	}

	async detectPARAType(
		file: TFile,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<PARAType | null> {
		// Mock implementation - detect from path
		if (file.path.includes('project')) return 'project';
		if (file.path.includes('area')) return 'area';
		if (file.path.includes('resource')) return 'resource';
		if (file.path.includes('archive')) return 'archive';
		return null;
	}

	async organizeToPARA(
		file: TFile,
		type: PARAType,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<void> {
		await this.moveToPARAFolder(file, type, customFolders);
	}

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

	async getFilesByPARAType(
		type: PARAType,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<TFile[]> {
		return this.getFilesInPARAFolder(type, customFolders);
	}

	// Helper methods for testing
	setFileContent(path: string, content: string): void {
		this.files.set(path, content);
	}

	getFileContent(path: string): string | undefined {
		return this.files.get(path);
	}

	clear(): void {
		this.files.clear();
		this.fileObjects.clear();
	}
}

