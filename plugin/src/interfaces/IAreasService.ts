import { TFile } from 'obsidian';
import { PARAType, AreaStatus } from '../core/PARA';
import { OrganizationMode } from '../services/FileService';
import { AreaMetadata } from '../services/AreasService';

/**
 * Interface for areas management abstraction.
 * Allows swapping area storage backends.
 * 
 * @interface IAreasService
 */
export interface IAreasService {
	/**
	 * Get all active areas
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of active area files
	 */
	getActiveAreas(mode: OrganizationMode): Promise<TFile[]>;

	/**
	 * Create a new Area of Improvement
	 * @param name - Name of the area
	 * @param mode - Organization mode
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise resolving to created area file
	 */
	createArea(
		name: string,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<TFile>;

	/**
	 * Get area metadata
	 * @param file - Area file
	 * @returns Promise resolving to area metadata
	 */
	getAreaMetadata(file: TFile): Promise<AreaMetadata>;

	/**
	 * Update area status
	 * @param file - Area file
	 * @param status - New status
	 * @returns Promise that resolves when status is updated
	 */
	updateAreaStatus(file: TFile, status: AreaStatus): Promise<void>;

	/**
	 * Link project to area
	 * @param projectFile - Project file
	 * @param areaFile - Area file
	 * @returns Promise that resolves when link is created
	 */
	linkProjectToArea(projectFile: TFile, areaFile: TFile): Promise<void>;

	/**
	 * Get projects linked to area
	 * @param areaFile - Area file
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of linked project files
	 */
	getLinkedProjects(areaFile: TFile, mode: OrganizationMode): Promise<TFile[]>;

	/**
	 * Get all areas
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of all area files
	 */
	getAreas(mode: OrganizationMode): Promise<TFile[]>;
}

