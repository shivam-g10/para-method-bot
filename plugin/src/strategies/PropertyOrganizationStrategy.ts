import { App, TFile } from 'obsidian';
import { PARAType } from '../core/PARA';
import { IOrganizationStrategy } from './IOrganizationStrategy';
import { IPropertiesService } from '../interfaces/IPropertiesService';

/**
 * Property-based organization strategy.
 * Organizes files by setting frontmatter properties.
 */
export class PropertyOrganizationStrategy implements IOrganizationStrategy {
	private app: App;
	private propertiesService: IPropertiesService;

	constructor(app: App, propertiesService: IPropertiesService) {
		this.app = app;
		this.propertiesService = propertiesService;
	}

	/**
	 * Organize file to PARA category using properties
	 */
	async organize(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<void> {
		await this.propertiesService.setPARAType(file, type);
	}

	/**
	 * Get location/path for file (returns current path for property-based)
	 */
	async getLocation(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<string> {
		// For property-based, location is just the current path
		return file.path;
	}

	/**
	 * Detect PARA type from file properties
	 */
	async detectType(
		file: TFile,
		customFolders?: Record<PARAType, string>
	): Promise<PARAType | null> {
		return await this.propertiesService.getPARAType(file);
	}

	/**
	 * Get files by PARA type from properties
	 */
	async getFilesByType(
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<TFile[]> {
		const allFiles = this.app.vault.getMarkdownFiles();
		const files: TFile[] = [];

		for (const file of allFiles) {
			const fileType = await this.propertiesService.getPARAType(file);
			if (fileType === type) {
				files.push(file);
			}
		}

		return files;
	}
}

