import { TFile } from 'obsidian';
import { PARAType, ProjectStatus, AreaStatus } from '../core/PARA';
import { PARAProperties } from '../services/PropertiesService';
import { Option } from '../utils/Option';

/**
 * Interface for property management abstraction.
 * Allows swapping different property storage backends.
 * 
 * @interface IPropertiesService
 */
export interface IPropertiesService {
	/**
	 * Get frontmatter properties from file
	 * @param file - File to read properties from
	 * @returns Promise resolving to PARA properties object
	 */
	getProperties(file: TFile): Promise<PARAProperties>;

	/**
	 * Set frontmatter properties on file
	 * @param file - File to set properties on
	 * @param properties - Properties to set
	 * @returns Promise that resolves when properties are set
	 */
	setProperties(file: TFile, properties: PARAProperties): Promise<void>;

	/**
	 * Update a single property
	 * @param file - File to update
	 * @param key - Property key to update
	 * @param value - New value for the property
	 * @returns Promise that resolves when property is updated
	 */
	updateProperty(
		file: TFile,
		key: keyof PARAProperties,
		value: any
	): Promise<void>;

	/**
	 * Get PARA type from properties
	 * @param file - File to read PARA type from
	 * @returns Promise resolving to PARA type or null
	 */
	getPARAType(file: TFile): Promise<PARAType | null>;

	/**
	 * Get PARA type from properties (Option pattern)
	 * @param file - File to read PARA type from
	 * @returns Promise resolving to Option of PARA type
	 */
	getPARATypeSafe(file: TFile): Promise<Option<PARAType>>;

	/**
	 * Set PARA type in properties
	 * @param file - File to set PARA type on
	 * @param type - PARA type to set
	 * @returns Promise that resolves when PARA type is set
	 */
	setPARAType(file: TFile, type: PARAType): Promise<void>;

	/**
	 * Get status from properties
	 * @param file - File to read status from
	 * @returns Promise resolving to status or null
	 */
	getStatus(file: TFile): Promise<ProjectStatus | AreaStatus | null>;

	/**
	 * Set status in properties
	 * @param file - File to set status on
	 * @param status - Status to set
	 * @returns Promise that resolves when status is set
	 */
	setStatus(file: TFile, status: ProjectStatus | AreaStatus): Promise<void>;
}

