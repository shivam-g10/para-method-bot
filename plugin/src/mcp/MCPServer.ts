import { App } from 'obsidian';
import { FileSearchTool } from './FileSearchTool';
import { VaultContextTool } from './VaultContextTool';
import { GetFileContentTool } from './GetFileContentTool';
import { OrganizationMode } from '../services/FileService';
import { ISearchService } from '../interfaces/ISearchService';
import { IFileService } from '../interfaces/IFileService';

export interface MCPTool {
	name: string;
	description: string;
	parameters: {
		type: 'object';
		properties: Record<string, any>;
		required?: string[];
	};
	execute: (params: any) => Promise<any>;
}

/**
 * MCP Server implementation for PARA Agent
 * Enables AI assistants to interact with the Obsidian vault
 */
export class MCPServer {
	private app: App;
	private tools: Map<string, MCPTool> = new Map();
	private searchService: ISearchService;
	private fileService: IFileService;
	private mode: OrganizationMode = 'hybrid';

	constructor(app: App, searchService: ISearchService, fileService: IFileService) {
		this.app = app;
		this.searchService = searchService;
		this.fileService = fileService;

		// Register tools
		this.registerTool(new FileSearchTool(this));
		this.registerTool(new VaultContextTool(this));
		this.registerTool(new GetFileContentTool(this));
	}

	/**
	 * Register an MCP tool
	 */
	private registerTool(tool: MCPTool): void {
		this.tools.set(tool.name, tool);
	}

	/**
	 * Get all available tools
	 */
	getTools(): MCPTool[] {
		return Array.from(this.tools.values());
	}

	/**
	 * Get tool by name
	 */
	getTool(name: string): MCPTool | undefined {
		return this.tools.get(name);
	}

	/**
	 * Execute a tool
	 */
	async executeTool(name: string, params: any): Promise<any> {
		const tool = this.getTool(name);
		if (!tool) {
			throw new Error(`Tool ${name} not found`);
		}

		// Validate parameters
		this.validateParameters(tool, params);

		// Execute tool
		return await tool.execute(params);
	}

	/**
	 * Validate tool parameters
	 */
	private validateParameters(tool: MCPTool, params: any): void {
		const required = tool.parameters.required || [];
		
		for (const field of required) {
			if (!(field in params)) {
				throw new Error(`Missing required parameter: ${field}`);
			}
		}

		// Validate parameter types (simplified)
		for (const [key, value] of Object.entries(params)) {
			const property = tool.parameters.properties[key];
			if (property && value !== undefined) {
				// Basic type checking could be added here
			}
		}
	}

	/**
	 * Get server capabilities
	 */
	getCapabilities(): {
		tools: string[];
	} {
		return {
			tools: Array.from(this.tools.keys()),
		};
	}

	/**
	 * Set organization mode
	 */
	setOrganizationMode(mode: OrganizationMode): void {
		this.mode = mode;
	}

	/**
	 * Get organization mode
	 */
	getOrganizationMode(): OrganizationMode {
		return this.mode;
	}

	/**
	 * Get search service
	 */
	getSearchService(): ISearchService {
		return this.searchService;
	}

	/**
	 * Get file service
	 */
	getFileService(): IFileService {
		return this.fileService;
	}

	/**
	 * Get app instance
	 */
	getApp(): App {
		return this.app;
	}
}

