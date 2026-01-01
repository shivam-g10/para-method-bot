import { App, TFile } from 'obsidian';
import { PARAType, ProjectStatus, AreaStatus } from '../core/PARA';
import { OrganizationMode } from './FileService';
import { ISearchService } from '../interfaces/ISearchService';
import { IFileService } from '../interfaces/IFileService';
import { IPropertiesService } from '../interfaces/IPropertiesService';
import { ITagService } from '../interfaces/ITagService';

export interface SearchFilters {
	paraType?: PARAType;
	status?: ProjectStatus | AreaStatus;
	tags?: string[];
	query?: string;
}

export class SearchService implements ISearchService {
	private app: App;
	private fileService: IFileService;
	private propertiesService: IPropertiesService;
	private tagService: ITagService;

	constructor(
		app: App,
		fileService: IFileService,
		propertiesService: IPropertiesService,
		tagService: ITagService
	) {
		this.app = app;
		this.fileService = fileService;
		this.propertiesService = propertiesService;
		this.tagService = tagService;
	}

	/**
	 * Search files with PARA context
	 */
	async search(filters: SearchFilters, mode: OrganizationMode): Promise<TFile[]> {
		let files: TFile[] = [];

		// Filter by PARA type
		if (filters.paraType) {
			files = await this.fileService.getFilesByPARAType(filters.paraType, mode);
		} else {
			// Get all markdown files
			files = this.app.vault.getMarkdownFiles();
		}

		// Apply filters
		if (filters.status) {
			files = await this.filterByStatus(files, filters.status);
		}

		if (filters.tags && filters.tags.length > 0) {
			files = await this.filterByTags(files, filters.tags);
		}

		if (filters.query) {
			files = await this.filterByQuery(files, filters.query);
		}

		return files;
	}

	/**
	 * Search by PARA type
	 */
	async searchByPARAType(type: PARAType, mode: OrganizationMode): Promise<TFile[]> {
		return await this.fileService.getFilesByPARAType(type, mode);
	}

	/**
	 * Search by status
	 */
	async searchByStatus(status: ProjectStatus | AreaStatus, mode: OrganizationMode): Promise<TFile[]> {
		const allFiles = this.app.vault.getMarkdownFiles();
		return await this.filterByStatus(allFiles, status);
	}

	/**
	 * Search by tags
	 */
	async searchByTags(tags: string[], mode: OrganizationMode): Promise<TFile[]> {
		const allFiles = this.app.vault.getMarkdownFiles();
		return await this.filterByTags(allFiles, tags);
	}

	/**
	 * Full-text search with query
	 */
	async fullTextSearch(query: string, mode: OrganizationMode): Promise<TFile[]> {
		const allFiles = this.app.vault.getMarkdownFiles();
		return await this.filterByQuery(allFiles, query);
	}

	/**
	 * Filter files by status
	 */
	private async filterByStatus(
		files: TFile[],
		status: ProjectStatus | AreaStatus
	): Promise<TFile[]> {
		const filtered: TFile[] = [];

		for (const file of files) {
			const fileStatus = await this.propertiesService.getStatus(file);
			if (fileStatus === status) {
				filtered.push(file);
			}
		}

		return filtered;
	}

	/**
	 * Filter files by tags
	 */
	async filterByTags(files: TFile[], tags: string[]): Promise<TFile[]> {
		const filtered: TFile[] = [];

		for (const file of files) {
			const fileTags = this.tagService.getTags(file);
			const hasAllTags = tags.every(tag => {
				const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
				return fileTags.includes(normalizedTag);
			});

			if (hasAllTags) {
				filtered.push(file);
			}
		}

		return filtered;
	}

	/**
	 * Filter files by query (simple text search)
	 */
	private async filterByQuery(files: TFile[], query: string): Promise<TFile[]> {
		const filtered: TFile[] = [];
		const lowerQuery = query.toLowerCase();

		for (const file of files) {
			const content = await this.fileService.readFile(file);
			const lowerContent = content.toLowerCase();

			// Check if query matches filename or content
			if (
				file.basename.toLowerCase().includes(lowerQuery) ||
				lowerContent.includes(lowerQuery)
			) {
				filtered.push(file);
			}
		}

		return filtered;
	}

	/**
	 * Filter by PARA category
	 */
	async filterByPARA(files: TFile[], type: PARAType): Promise<TFile[]> {
		const filtered: TFile[] = [];
		for (const file of files) {
			const fileType = await this.propertiesService.getPARAType(file);
			if (fileType === type) {
				filtered.push(file);
			}
		}
		return filtered;
	}

	/**
	 * Get saved search queries (for future implementation)
	 */
	getSavedSearches(): string[] {
		// TODO: Implement saved searches in Phase 6
		return [];
	}

	/**
	 * Save a search query (for future implementation)
	 */
	async saveSearch(name: string, filters: SearchFilters): Promise<void> {
		// TODO: Implement saved searches in Phase 6
	}
}

