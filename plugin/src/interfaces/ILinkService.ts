import { TFile } from 'obsidian';
import { PARAType } from '../core/PARA';
import { OrganizationMode } from '../services/FileService';
import { LinkInfo } from '../services/LinkService';

/**
 * Interface for link management abstraction.
 * Allows swapping link storage backends.
 * 
 * @interface ILinkService
 */
export interface ILinkService {
	/**
	 * Create a link between two files
	 * @param sourceFile - Source file
	 * @param targetFile - Target file
	 * @param bidirectional - Whether to create bidirectional link
	 * @returns Promise that resolves when link is created
	 */
	createLink(sourceFile: TFile, targetFile: TFile, bidirectional?: boolean): Promise<void>;

	/**
	 * Remove link between two files
	 * @param sourceFile - Source file
	 * @param targetFile - Target file
	 * @param bidirectional - Whether to remove bidirectional link
	 * @returns Promise that resolves when link is removed
	 */
	removeLink(sourceFile: TFile, targetFile: TFile, bidirectional?: boolean): Promise<void>;

	/**
	 * Get all links from a file
	 * @param file - File to get links from
	 * @returns Array of link strings
	 */
	getLinksFromFile(file: TFile): string[];

	/**
	 * Get all files linked from a file
	 * @param file - File to get linked files from
	 * @returns Array of linked files
	 */
	getLinkedFiles(file: TFile): TFile[];

	/**
	 * Get all files that link to a file (backlinks)
	 * @param file - File to get backlinks for
	 * @returns Array of files that link to this file
	 */
	getBacklinks(file: TFile): TFile[];

	/**
	 * Check for broken links
	 * @param file - File to check for broken links
	 * @returns Array of broken link strings
	 */
	findBrokenLinks(file: TFile): string[];

	/**
	 * Auto-create links between related PARA items
	 * @param file - File to auto-link
	 * @param paraType - PARA type of the file
	 * @param mode - Organization mode
	 * @returns Promise that resolves when auto-linking is complete
	 */
	autoLinkRelated(
		file: TFile,
		paraType: PARAType,
		mode: OrganizationMode
	): Promise<void>;

	/**
	 * Suggest links based on content
	 * @param file - File to suggest links for
	 * @returns Promise resolving to array of suggested link info
	 */
	suggestLinks(file: TFile): Promise<LinkInfo[]>;
}

