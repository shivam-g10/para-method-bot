import { MCPServer } from './MCPServer';
import { MCPTool } from './MCPServer';
import { PARAType } from '../core/PARA';

export class VaultContextTool implements MCPTool {
	name = 'get_vault_context';
	description = 'Get vault structure and PARA organization information';
	
	parameters = {
		type: 'object' as const,
		properties: {
			includeStats: {
				type: 'boolean',
				description: 'Include statistics about PARA items',
				default: true,
			},
		},
	};

	private server: MCPServer;

	constructor(server: MCPServer) {
		this.server = server;
	}

	async execute(params: any): Promise<{
		vault: {
			name: string;
			path: string;
			organizationMode: string;
		};
		para: {
			types: PARAType[];
			folders: Record<PARAType, string>;
		};
		stats?: Record<PARAType, number>;
	}> {
		const { includeStats = true } = params;
		const app = this.server.getApp();
		const mode = this.server.getOrganizationMode();

		// Get vault info
		const vaultName = app.vault.getName();
		const vaultPath = (app.vault.adapter as any).basePath || '';

		// Get PARA structure
		const { PARA } = await import('../core/PARA');
		const para = new PARA(app);
		const types = para.getTypes();
		const folders: Record<PARAType, string> = {
			project: para.getFolderName('project'),
			area: para.getFolderName('area'),
			resource: para.getFolderName('resource'),
			archive: para.getFolderName('archive'),
		};

		const result: any = {
			vault: {
				name: vaultName,
				path: vaultPath,
				organizationMode: mode,
			},
			para: {
				types,
				folders,
			},
		};

		// Include stats if requested
		if (includeStats) {
			const stats: Record<PARAType, number> = {
				project: 0,
				area: 0,
				resource: 0,
				archive: 0,
			};

			for (const type of types) {
				const files = await this.server.getFileService().getFilesByPARAType(type, mode);
				stats[type] = files.length;
			}

			result.stats = stats;
		}

		return result;
	}
}

