import { TFile } from 'obsidian';
import { ITagService } from '../../src/interfaces/ITagService';
import { PARAType } from '../../src/core/PARA';

/**
 * Mock implementation of ITagService for testing
 */
export class MockTagService implements ITagService {
	private fileTags: Map<string, Set<string>> = new Map();

	getTags(file: TFile): string[] {
		const tags = this.fileTags.get(file.path);
		return tags ? Array.from(tags) : [];
	}

	hasTag(file: TFile, tag: string): boolean {
		const tags = this.fileTags.get(file.path);
		if (!tags) return false;
		const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
		return tags.has(normalizedTag) || tags.has(tag);
	}

	async addTag(file: TFile, tag: string): Promise<void> {
		const tags = this.fileTags.get(file.path) || new Set();
		const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
		tags.add(normalizedTag);
		this.fileTags.set(file.path, tags);
	}

	async removeTag(file: TFile, tag: string): Promise<void> {
		const tags = this.fileTags.get(file.path);
		if (!tags) return;
		const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
		tags.delete(normalizedTag);
		tags.delete(tag);
	}

	async addPARATag(file: TFile, type: PARAType): Promise<void> {
		const tagMap: Record<PARAType, string> = {
			project: '#project',
			area: '#area',
			resource: '#resource',
			archive: '#archive',
		};
		await this.addTag(file, tagMap[type]);
	}

	async removeAllPARATags(file: TFile): Promise<void> {
		const paraTags = ['#project', '#area', '#resource', '#archive'];
		for (const tag of paraTags) {
			await this.removeTag(file, tag);
		}
	}

	async addStatusTag(file: TFile, status: string): Promise<void> {
		await this.addTag(file, `#${status}`);
	}

	getFilesWithTag(tag: string): TFile[] {
		const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
		const files: TFile[] = [];
		for (const [path, tags] of this.fileTags.entries()) {
			if (tags.has(normalizedTag)) {
				files.push({ path } as TFile);
			}
		}
		return files;
	}

	async suggestTags(file: TFile): Promise<string[]> {
		// Mock implementation - return empty array
		return [];
	}

	// Helper methods for testing
	clear(): void {
		this.fileTags.clear();
	}
}

