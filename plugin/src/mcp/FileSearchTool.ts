import { TFile } from 'obsidian';
import { MCPServer } from './MCPServer';
import { MCPTool } from './MCPServer';
import { PARAType } from '../core/PARA';

export class FileSearchTool implements MCPTool {
	name = 'search_files';
	description = 'Search files in the Obsidian vault by query, PARA type, or tags';
	
	parameters = {
		type: 'object' as const,
		properties: {
			query: {
				type: 'string',
				description: 'Search query text',
			},
			paraType: {
				type: 'string',
				enum: ['project', 'area', 'resource', 'archive'],
				description: 'Filter by PARA type',
			},
			tags: {
				type: 'array',
				items: { type: 'string' },
				description: 'Filter by tags',
			},
		},
	};

	private server: MCPServer;

	constructor(server: MCPServer) {
		this.server = server;
	}

	async execute(params: any): Promise<{
		files: Array<{
			path: string;
			name: string;
			basename: string;
			paraType?: string;
		}>;
	}> {
		const { query, paraType, tags } = params;
		const mode = this.server.getOrganizationMode();

		// Build search filters
		const filters: any = {};
		if (paraType) {
			filters.paraType = paraType as PARAType;
		}
		if (tags && tags.length > 0) {
			filters.tags = tags;
		}
		if (query) {
			filters.query = query;
		}

		// Perform search
		const files = await this.server.getSearchService().search(filters, mode);

		// Format results
		const { PropertiesService } = await import('../services/PropertiesService');
		const results = await Promise.all(
			files.map(async (file: TFile) => {
				const propertiesService = new PropertiesService(this.server.getApp());
				const paraType = await propertiesService.getPARAType(file);

				return {
					path: file.path,
					name: file.name,
					basename: file.basename,
					paraType: paraType || undefined,
				};
			})
		);

		return { files: results };
	}
}

// Helper to get organization mode
function getOrganizationMode(server: MCPServer): any {
	return server.getOrganizationMode();
}

