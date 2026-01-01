import { App, TFile } from 'obsidian';
import { PARAType } from '../core/PARA';

export class TagService {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Get all tags from file
	 */
	getTags(file: TFile): string[] {
		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache || !cache.tags) {
			return [];
		}

		return cache.tags.map(tag => tag.tag);
	}

	/**
	 * Check if file has tag
	 */
	hasTag(file: TFile, tag: string): boolean {
		const tags = this.getTags(file);
		const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
		return tags.some(t => t === normalizedTag || t === tag);
	}

	/**
	 * Add tag to file
	 */
	async addTag(file: TFile, tag: string): Promise<void> {
		const content = await this.app.vault.read(file);
		const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;

		// Check if tag already exists
		if (this.hasTag(file, normalizedTag)) {
			return;
		}

		// Add tag to content (simple implementation - add at end)
		const newContent = `${content}\n${normalizedTag}`;
		await this.app.vault.modify(file, newContent);
	}

	/**
	 * Remove tag from file
	 */
	async removeTag(file: TFile, tag: string): Promise<void> {
		const content = await this.app.vault.read(file);
		const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;

		// Remove tag from content
		const lines = content.split('\n');
		const filtered = lines.filter(line => {
			const trimmed = line.trim();
			return trimmed !== normalizedTag && !trimmed.includes(normalizedTag);
		});

		await this.app.vault.modify(file, filtered.join('\n'));
	}

	/**
	 * Add PARA tag based on type
	 */
	async addPARATag(file: TFile, type: PARAType): Promise<void> {
		const tagMap: Record<PARAType, string> = {
			project: '#project',
			area: '#area',
			resource: '#resource',
			archive: '#archive',
		};

		await this.addTag(file, tagMap[type]);
	}

	/**
	 * Remove all PARA tags
	 */
	async removeAllPARATags(file: TFile): Promise<void> {
		const paraTags = ['#project', '#area', '#resource', '#archive'];
		for (const tag of paraTags) {
			await this.removeTag(file, tag);
		}
	}

	/**
	 * Add status tag
	 */
	async addStatusTag(file: TFile, status: string): Promise<void> {
		const statusTag = `#${status}`;
		await this.addTag(file, statusTag);
	}

	/**
	 * Get files with tag
	 */
	getFilesWithTag(tag: string): TFile[] {
		const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
		const files = this.app.vault.getMarkdownFiles();
		
		return files.filter(file => {
			const cache = this.app.metadataCache.getFileCache(file);
			if (!cache || !cache.tags) {
				return false;
			}
			return cache.tags.some(t => t.tag === normalizedTag);
		});
	}
}

