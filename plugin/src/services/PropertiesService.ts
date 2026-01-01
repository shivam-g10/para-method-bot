import { App, TFile } from 'obsidian';
import { PARAType, ProjectStatus, AreaStatus } from '../core/PARA';

export interface PARAProperties {
	'para-type'?: PARAType;
	'status'?: ProjectStatus | AreaStatus;
	'deadline'?: string;
	'priority'?: number;
	'area-of-improvement'?: string;
}

export class PropertiesService {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Get frontmatter properties from file
	 */
	async getProperties(file: TFile): Promise<PARAProperties> {
		const content = await this.app.vault.read(file);
		const frontmatter = this.extractFrontmatter(content);
		
		if (!frontmatter) {
			return {};
		}

		try {
			const parsed = this.parseYaml(frontmatter);
			return parsed || {};
		} catch (error) {
			console.error('Error parsing frontmatter:', error);
			return {};
		}
	}

	/**
	 * Set frontmatter properties on file
	 */
	async setProperties(file: TFile, properties: PARAProperties): Promise<void> {
		const content = await this.app.vault.read(file);
		const { body, frontmatter } = this.splitFrontmatter(content);

		// Merge with existing properties
		const existing = frontmatter ? this.parseYaml(frontmatter) : {};
		const merged = { ...existing, ...properties };

		// Create new content with updated frontmatter
		const newFrontmatter = this.stringifyYaml(merged);
		const newContent = `---\n${newFrontmatter}---\n${body}`;

		await this.app.vault.modify(file, newContent);
	}

	/**
	 * Update a single property
	 */
	async updateProperty(
		file: TFile,
		key: keyof PARAProperties,
		value: any
	): Promise<void> {
		const properties = await this.getProperties(file);
		properties[key] = value;
		await this.setProperties(file, properties);
	}

	/**
	 * Get PARA type from properties
	 */
	async getPARAType(file: TFile): Promise<PARAType | null> {
		const properties = await this.getProperties(file);
		return properties['para-type'] || null;
	}

	/**
	 * Set PARA type in properties
	 */
	async setPARAType(file: TFile, type: PARAType): Promise<void> {
		await this.updateProperty(file, 'para-type', type);
	}

	/**
	 * Get status from properties
	 */
	async getStatus(file: TFile): Promise<ProjectStatus | AreaStatus | null> {
		const properties = await this.getProperties(file);
		return properties.status || null;
	}

	/**
	 * Set status in properties
	 */
	async setStatus(file: TFile, status: ProjectStatus | AreaStatus): Promise<void> {
		await this.updateProperty(file, 'status', status);
	}

	/**
	 * Extract frontmatter from content
	 */
	private extractFrontmatter(content: string): string | null {
		const match = content.match(/^---\n([\s\S]*?)\n---/);
		return match ? match[1] : null;
	}

	/**
	 * Split content into frontmatter and body
	 */
	private splitFrontmatter(content: string): { frontmatter: string | null; body: string } {
		const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
		if (match) {
			return {
				frontmatter: match[1],
				body: match[2],
			};
		}
		return {
			frontmatter: null,
			body: content,
		};
	}

	/**
	 * Simple YAML parser for basic key-value pairs
	 */
	private parseYaml(yamlStr: string): Record<string, any> {
		const result: Record<string, any> = {};
		const lines = yamlStr.split('\n');

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;

			const colonIndex = trimmed.indexOf(':');
			if (colonIndex === -1) continue;

			const key = trimmed.substring(0, colonIndex).trim();
			let value = trimmed.substring(colonIndex + 1).trim();

			// Remove quotes if present
			if ((value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}

			result[key] = value;
		}

		return result;
	}

	/**
	 * Simple YAML stringifier for basic key-value pairs
	 */
	private stringifyYaml(obj: Record<string, any>): string {
		const lines: string[] = [];
		for (const [key, value] of Object.entries(obj)) {
			if (value === undefined || value === null) continue;
			const stringValue = typeof value === 'string' ? `"${value}"` : String(value);
			lines.push(`${key}: ${stringValue}`);
		}
		return lines.join('\n') + (lines.length > 0 ? '\n' : '');
	}
}

