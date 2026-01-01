import { App } from 'obsidian';
import { IOrganizationStrategy } from './IOrganizationStrategy';
import { FolderOrganizationStrategy } from './FolderOrganizationStrategy';
import { PropertyOrganizationStrategy } from './PropertyOrganizationStrategy';
import { HybridOrganizationStrategy } from './HybridOrganizationStrategy';
import { OrganizationMode } from '../services/FileService';
import { IPropertiesService } from '../interfaces/IPropertiesService';

/**
 * Factory for creating organization strategies based on mode.
 */
export class OrganizationStrategyFactory {
	/**
	 * Create organization strategy based on mode
	 * @param app - Obsidian App instance
	 * @param mode - Organization mode (folder, property, hybrid)
	 * @param propertiesService - Properties service (required for property and hybrid modes)
	 * @returns Organization strategy instance
	 */
	static create(
		app: App,
		mode: OrganizationMode,
		propertiesService?: IPropertiesService
	): IOrganizationStrategy {
		switch (mode) {
			case 'folder':
				return new FolderOrganizationStrategy(app);
			case 'property':
				if (!propertiesService) {
					throw new Error('PropertiesService is required for property organization mode');
				}
				return new PropertyOrganizationStrategy(app, propertiesService);
			case 'hybrid':
				if (!propertiesService) {
					throw new Error('PropertiesService is required for hybrid organization mode');
				}
				return new HybridOrganizationStrategy(app, propertiesService);
			default:
				throw new Error(`Unknown organization mode: ${mode}`);
		}
	}
}

