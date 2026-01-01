import { TFile } from 'obsidian';
import { PARAType } from '../core/PARA';

/**
 * Interface for tag operations abstraction.
 * Allows swapping tag storage strategies.
 * 
 * @interface ITagService
 */
export interface ITagService {
	/**
	 * Get all tags from file
	 * @param file - File to read tags from
	 * @returns Array of tag strings
	 */
	getTags(file: TFile): string[];

	/**
	 * Check if file has tag
	 * @param file - File to check
	 * @param tag - Tag to check for
	 * @returns True if file has the tag, false otherwise
	 */
	hasTag(file: TFile, tag: string): boolean;

	/**
	 * Add tag to file
	 * @param file - File to add tag to
	 * @param tag - Tag to add
	 * @returns Promise that resolves when tag is added
	 */
	addTag(file: TFile, tag: string): Promise<void>;

	/**
	 * Remove tag from file
	 * @param file - File to remove tag from
	 * @param tag - Tag to remove
	 * @returns Promise that resolves when tag is removed
	 */
	removeTag(file: TFile, tag: string): Promise<void>;

	/**
	 * Add PARA tag based on type
	 * @param file - File to add PARA tag to
	 * @param type - PARA type
	 * @returns Promise that resolves when PARA tag is added
	 */
	addPARATag(file: TFile, type: PARAType): Promise<void>;

	/**
	 * Remove all PARA tags
	 * @param file - File to remove PARA tags from
	 * @returns Promise that resolves when PARA tags are removed
	 */
	removeAllPARATags(file: TFile): Promise<void>;

	/**
	 * Add status tag
	 * @param file - File to add status tag to
	 * @param status - Status string
	 * @returns Promise that resolves when status tag is added
	 */
	addStatusTag(file: TFile, status: string): Promise<void>;

	/**
	 * Get files with tag
	 * @param tag - Tag to search for
	 * @returns Array of files that have the tag
	 */
	getFilesWithTag(tag: string): TFile[];

	/**
	 * Suggest tags based on content (AI-powered)
	 * @param file - File to suggest tags for
	 * @returns Promise resolving to array of suggested tag strings
	 */
	suggestTags(file: TFile): Promise<string[]>;
}

