import { App } from 'obsidian';
import { FileSearchTool } from './FileSearchTool';
import { VaultContextTool } from './VaultContextTool';
import { GetFileContentTool } from './GetFileContentTool';
import { SearchService } from '../services/SearchService';
import { FileService, OrganizationMode } from '../services/FileService';

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
	private searchService: SearchService;
	private fileService: FileService;
	private mode: OrganizationMode = 'hybrid';

	constructor(app: App) {
		this.app = app;
		this.searchService = new SearchService(app);
		this.fileService = new FileService(app);

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
	getSearchService(): SearchService {
		return this.searchService;
	}

	/**
	 * Get file service
	 */
	getFileService(): FileService {
		return this.fileService;
	}

	/**
	 * Get app instance
	 */
	getApp(): App {
		return this.app;
	}
}

