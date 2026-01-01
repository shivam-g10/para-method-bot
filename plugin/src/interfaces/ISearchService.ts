import { TFile } from 'obsidian';
import { PARAType, ProjectStatus, AreaStatus } from '../core/PARA';
import { OrganizationMode } from '../services/FileService';
import { SearchFilters } from '../services/SearchService';

/**
 * Interface for search operations abstraction.
 * Allows swapping search engines (Obsidian native, custom indexer, etc.).
 * 
 * @interface ISearchService
 */
export interface ISearchService {
	/**
	 * Search files with PARA context
	 * @param filters - Search filters (PARA type, status, tags, query)
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of matching files
	 */
	search(filters: SearchFilters, mode: OrganizationMode): Promise<TFile[]>;

	/**
	 * Search by PARA type
	 * @param type - PARA type to search for
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of files of the specified type
	 */
	searchByPARAType(type: PARAType, mode: OrganizationMode): Promise<TFile[]>;

	/**
	 * Search by status
	 * @param status - Status to search for
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of files with the status
	 */
	searchByStatus(status: ProjectStatus | AreaStatus, mode: OrganizationMode): Promise<TFile[]>;

	/**
	 * Search by tags
	 * @param tags - Tags to search for
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of files with the tags
	 */
	searchByTags(tags: string[], mode: OrganizationMode): Promise<TFile[]>;

	/**
	 * Full-text search with query
	 * @param query - Search query string
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of files matching the query
	 */
	fullTextSearch(query: string, mode: OrganizationMode): Promise<TFile[]>;

	/**
	 * Filter by PARA category
	 * @param files - Files to filter
	 * @param type - PARA type to filter by
	 * @returns Promise resolving to filtered files
	 */
	filterByPARA(files: TFile[], type: PARAType): Promise<TFile[]>;

	/**
	 * Filter by status/tags
	 * @param files - Files to filter
	 * @param filters - Filter criteria
	 * @returns Promise resolving to filtered files
	 */
	filterByTags(files: TFile[], tags: string[]): Promise<TFile[]>;

	/**
	 * Get saved search queries
	 * @returns Array of saved search query names
	 */
	getSavedSearches(): string[];

	/**
	 * Save a search query
	 * @param name - Name for the saved search
	 * @param filters - Search filters to save
	 * @returns Promise that resolves when search is saved
	 */
	saveSearch(name: string, filters: SearchFilters): Promise<void>;
}

