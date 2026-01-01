import { App } from 'obsidian';

export type PARAType = 'project' | 'area' | 'resource' | 'archive';
export type ProjectStatus = 'active' | 'on-hold' | 'completed';
export type AreaStatus = 'active' | 'inactive';

export interface PARAItem {
	type: PARAType;
	status?: ProjectStatus | AreaStatus;
	name: string;
	path: string;
}

export class PARA {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Get all PARA types
	 */
	getTypes(): PARAType[] {
		return ['project', 'area', 'resource', 'archive'];
	}

	/**
	 * Get folder name for PARA type
	 */
	getFolderName(type: PARAType, customFolders?: Record<PARAType, string>): string {
		if (customFolders) {
			return customFolders[type];
		}

		const folderMap: Record<PARAType, string> = {
			project: '1-Projects',
			area: '2-Areas',
			resource: '3-Resources',
			archive: '4-Archives',
		};

		return folderMap[type];
	}

	/**
	 * Get tag for PARA type
	 */
	getTag(type: PARAType): string {
		const tagMap: Record<PARAType, string> = {
			project: '#project',
			area: '#area',
			resource: '#resource',
			archive: '#archive',
		};

		return tagMap[type];
	}

	/**
	 * Detect PARA type from file path
	 */
	detectTypeFromPath(path: string, customFolders?: Record<PARAType, string>): PARAType | null {
		for (const type of this.getTypes()) {
			const folderName = this.getFolderName(type, customFolders);
			if (path.includes(folderName)) {
				return type;
			}
		}
		return null;
	}

	/**
	 * Check if item is a project
	 */
	isProject(item: PARAItem): boolean {
		return item.type === 'project';
	}

	/**
	 * Check if item is an area (Area of Improvement)
	 */
	isArea(item: PARAItem): boolean {
		return item.type === 'area';
	}

	/**
	 * Check if item is a resource
	 */
	isResource(item: PARAItem): boolean {
		return item.type === 'resource';
	}

	/**
	 * Check if item is archived
	 */
	isArchived(item: PARAItem): boolean {
		return item.type === 'archive';
	}

	/**
	 * Check if project is active
	 */
	isProjectActive(item: PARAItem): boolean {
		return this.isProject(item) && item.status === 'active';
	}

	/**
	 * Validate PARA structure
	 */
	validateStructure(): boolean {
		// TODO: Implement validation in Phase 2
		return true;
	}
}

