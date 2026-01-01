import { App, TFile } from 'obsidian';
import { PARAType } from '../core/PARA';
import { IOrganizationStrategy } from './IOrganizationStrategy';
import { FolderOrganizationStrategy } from './FolderOrganizationStrategy';
import { PropertyOrganizationStrategy } from './PropertyOrganizationStrategy';
import { IPropertiesService } from '../interfaces/IPropertiesService';

/**
 * Hybrid organization strategy.
 * Combines folder-based and property-based organization.
 */
export class HybridOrganizationStrategy implements IOrganizationStrategy {
	private app: App;
	private folderStrategy: FolderOrganizationStrategy;
	private propertyStrategy: PropertyOrganizationStrategy;

	constructor(app: App, propertiesService: IPropertiesService) {
		this.app = app;
		this.folderStrategy = new FolderOrganizationStrategy(app);
		this.propertyStrategy = new PropertyOrganizationStrategy(app, propertiesService);
	}

	/**
	 * Organize file to PARA category using both folder and property
	 */
	async organize(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<void> {
		// Apply both strategies
		await Promise.all([
			this.folderStrategy.organize(file, type, customFolders),
			this.propertyStrategy.organize(file, type, customFolders),
		]);
	}

	/**
	 * Get location/path for file based on PARA type
	 */
	async getLocation(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<string> {
		// Use folder strategy for location
		return await this.folderStrategy.getLocation(file, type, customFolders);
	}

	/**
	 * Detect PARA type from file (check both folder and property)
	 */
	async detectType(
		file: TFile,
		customFolders?: Record<PARAType, string>
	): Promise<PARAType | null> {
		// Try folder first
		const folderType = await this.folderStrategy.detectType(file, customFolders);
		if (folderType) {
			return folderType;
		}

		// Fall back to property
		return await this.propertyStrategy.detectType(file, customFolders);
	}

	/**
	 * Get files by PARA type (combine results from both strategies, avoiding duplicates)
	 */
	async getFilesByType(
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<TFile[]> {
		const [folderFiles, propertyFiles] = await Promise.all([
			this.folderStrategy.getFilesByType(type, customFolders),
			this.propertyStrategy.getFilesByType(type, customFolders),
		]);

		// Combine and deduplicate
		const fileMap = new Map<string, TFile>();
		[...folderFiles, ...propertyFiles].forEach(file => {
			fileMap.set(file.path, file);
		});

		return Array.from(fileMap.values());
	}
}

