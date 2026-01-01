import { TFile } from 'obsidian';
import { PARAType } from '../core/PARA';

/**
 * Interface for organization strategy abstraction.
 * Allows swapping organization modes (folder, property, hybrid).
 * 
 * @interface IOrganizationStrategy
 */
export interface IOrganizationStrategy {
	/**
	 * Organize file to PARA category
	 * @param file - File to organize
	 * @param type - PARA type to organize to
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise that resolves when organization is complete
	 */
	organize(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<void>;

	/**
	 * Get location/path for file based on PARA type
	 * @param file - File to get location for
	 * @param type - PARA type
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise resolving to file path/location
	 */
	getLocation(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<string>;

	/**
	 * Detect PARA type from file
	 * @param file - File to detect type from
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise resolving to detected PARA type or null
	 */
	detectType(
		file: TFile,
		customFolders?: Record<PARAType, string>
	): Promise<PARAType | null>;

	/**
	 * Get files by PARA type
	 * @param type - PARA type to filter by
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise resolving to array of files of the specified type
	 */
	getFilesByType(
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<TFile[]>;
}

