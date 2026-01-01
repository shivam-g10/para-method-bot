import { TFile } from 'obsidian';
import { MCPServer } from './MCPServer';
import { MCPTool } from './MCPServer';

export class GetFileContentTool implements MCPTool {
	name = 'get_file_content';
	description = 'Retrieve the content of a file from the vault';
	
	parameters = {
		type: 'object' as const,
		properties: {
			path: {
				type: 'string',
				description: 'Path to the file',
			},
		},
		required: ['path'],
	};

	private server: MCPServer;

	constructor(server: MCPServer) {
		this.server = server;
	}

	async execute(params: any): Promise<{
		path: string;
		content: string;
		exists: boolean;
	}> {
		const { path } = params;
		const app = this.server.getApp();
		const fileService = this.server.getFileService();

		// Get file
		const file = app.vault.getAbstractFileByPath(path) as TFile;

		if (!file || !(file instanceof TFile)) {
			return {
				path,
				content: '',
				exists: false,
			};
		}

		// Read content
		const content = await fileService.readFile(file);

		return {
			path: file.path,
			content,
			exists: true,
		};
	}
}

