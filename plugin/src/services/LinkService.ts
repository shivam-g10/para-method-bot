import { App, TFile } from 'obsidian';
import { PARAType } from '../core/PARA';
import { OrganizationMode } from './FileService';
import { ILinkService } from '../interfaces/ILinkService';
import { IFileService } from '../interfaces/IFileService';

export interface LinkInfo {
	source: TFile;
	target: TFile;
	type: 'bidirectional' | 'unidirectional';
}

export class LinkService implements ILinkService {
	private app: App;
	private fileService: IFileService;

	constructor(app: App, fileService: IFileService) {
		this.app = app;
		this.fileService = fileService;
	}

	/**
	 * Create a link between two files
	 */
	async createLink(sourceFile: TFile, targetFile: TFile, bidirectional: boolean = true): Promise<void> {
		const sourceContent = await this.fileService.readFile(sourceFile);
		const targetLink = `[[${targetFile.basename}]]`;

		// Add link to source file if not already present
		if (!sourceContent.includes(targetLink)) {
			const newSourceContent = `${sourceContent}\n${targetLink}`;
			await this.fileService.writeFile(sourceFile, newSourceContent);
		}

		// Add bidirectional link if requested
		if (bidirectional) {
			const targetContent = await this.fileService.readFile(targetFile);
			const sourceLink = `[[${sourceFile.basename}]]`;

			if (!targetContent.includes(sourceLink)) {
				const newTargetContent = `${targetContent}\n${sourceLink}`;
				await this.fileService.writeFile(targetFile, newTargetContent);
			}
		}
	}

	/**
	 * Remove link between two files
	 */
	async removeLink(sourceFile: TFile, targetFile: TFile, bidirectional: boolean = true): Promise<void> {
		const sourceContent = await this.fileService.readFile(sourceFile);
		const targetLink = `[[${targetFile.basename}]]`;
		const newSourceContent = sourceContent.replace(new RegExp(`\\[\\[${targetFile.basename}\\]\\]`, 'g'), '').trim();
		await this.fileService.writeFile(sourceFile, newSourceContent);

		if (bidirectional) {
			const targetContent = await this.fileService.readFile(targetFile);
			const sourceLink = `[[${sourceFile.basename}]]`;
			const newTargetContent = targetContent.replace(new RegExp(`\\[\\[${sourceFile.basename}\\]\\]`, 'g'), '').trim();
			await this.fileService.writeFile(targetFile, newTargetContent);
		}
	}

	/**
	 * Get all links from a file
	 */
	getLinksFromFile(file: TFile): string[] {
		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache || !cache.links) {
			return [];
		}

		return cache.links.map(link => link.link);
	}

	/**
	 * Get all files linked from a file
	 */
	getLinkedFiles(file: TFile): TFile[] {
		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache || !cache.links) {
			return [];
		}

		const linkedFiles: TFile[] = [];
		for (const link of cache.links) {
			const targetFile = this.app.metadataCache.getFirstLinkpathDest(link.link, file.path);
			if (targetFile) {
				linkedFiles.push(targetFile);
			}
		}

		return linkedFiles;
	}

	/**
	 * Get all files that link to a file (backlinks)
	 */
	getBacklinks(file: TFile): TFile[] {
		const allFiles = this.app.vault.getMarkdownFiles();
		const backlinks: TFile[] = [];

		for (const otherFile of allFiles) {
			if (otherFile.path === file.path) continue;

			const linkedFiles = this.getLinkedFiles(otherFile);
			if (linkedFiles.some(f => f.path === file.path)) {
				backlinks.push(otherFile);
			}
		}

		return backlinks;
	}

	/**
	 * Check for broken links
	 */
	findBrokenLinks(file: TFile): string[] {
		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache || !cache.links) {
			return [];
		}

		const brokenLinks: string[] = [];
		for (const link of cache.links) {
			const targetFile = this.app.metadataCache.getFirstLinkpathDest(link.link, file.path);
			if (!targetFile) {
				brokenLinks.push(link.link);
			}
		}

		return brokenLinks;
	}

	/**
	 * Suggest links based on content
	 */
	async suggestLinks(file: TFile): Promise<LinkInfo[]> {
		// TODO: Implement link suggestion logic
		// For now, return empty array
		return [];
	}

	/**
	 * Auto-create links between related PARA items
	 */
	async autoLinkRelated(
		file: TFile,
		paraType: PARAType,
		mode: OrganizationMode
	): Promise<void> {
		// Get related files based on PARA type
		const relatedFiles = await this.fileService.getFilesByPARAType(paraType, mode);

		// Find files with similar content (simple keyword matching for MVP)
		const content = await this.fileService.readFile(file);
		const keywords = this.extractKeywords(content);

		for (const relatedFile of relatedFiles) {
			if (relatedFile.path === file.path) continue;

			const relatedContent = await this.fileService.readFile(relatedFile);
			const relatedKeywords = this.extractKeywords(relatedContent);

			// If there's significant keyword overlap, create a link
			const overlap = this.calculateOverlap(keywords, relatedKeywords);
			if (overlap > 0.3) { // 30% overlap threshold
				await this.createLink(file, relatedFile, true);
			}
		}
	}

	/**
	 * Extract keywords from content (simple implementation)
	 */
	private extractKeywords(content: string): Set<string> {
		const words = content
			.toLowerCase()
			.replace(/[^\w\s]/g, ' ')
			.split(/\s+/)
			.filter(word => word.length > 4); // Only words longer than 4 characters

		return new Set(words);
	}

	/**
	 * Calculate keyword overlap between two sets
	 */
	private calculateOverlap(set1: Set<string>, set2: Set<string>): number {
		const intersection = new Set([...set1].filter(x => set2.has(x)));
		const union = new Set([...set1, ...set2]);
		return union.size > 0 ? intersection.size / union.size : 0;
	}
}

