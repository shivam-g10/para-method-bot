import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { PARA } from './PARA';
import { FileService } from '../services/FileService';
import { PropertiesService } from '../services/PropertiesService';
import { TagService } from '../services/TagService';
import { TemplateService } from '../services/TemplateService';
import { ProjectService } from '../services/ProjectService';
import { AreasService } from '../services/AreasService';
import { SearchService } from '../services/SearchService';
import { IntegrationManager } from '../integrations/IntegrationManager';
import { AIProviderManager } from '../integrations/AIProviderManager';
import { PromptService } from '../integrations/PromptService';
import { AIService } from '../services/AIService';
import { SecretsManager } from '../integrations/SecretsManager';
import { MCPServer } from '../mcp/MCPServer';
import { SidebarView } from '../ui/SidebarView';
import { CreateProjectModal, MoveToPARAModal } from '../ui/Modals';

export interface PluginSettings {
	organizationMode: 'folder' | 'property' | 'hybrid';
	maxActiveProjects: number;
	paraFolders: {
		projects: string;
		areas: string;
		resources: string;
		archives: string;
	};
}

export class PluginManager {
	plugin: Plugin;
	para: PARA;
	settings: PluginSettings;

	// Services
	fileService: FileService;
	propertiesService: PropertiesService;
	tagService: TagService;
	templateService: TemplateService;
	projectService: ProjectService;
	areasService: AreasService;
	searchService: SearchService;

	// Integrations
	integrationManager: IntegrationManager;
	secretsManager: SecretsManager;
	aiProviderManager: AIProviderManager;
	promptService: PromptService;
	aiService: AIService;
	mcpServer: MCPServer;

	constructor(plugin: Plugin, para: PARA) {
		this.plugin = plugin;
		this.para = para;
		this.settings = this.getDefaultSettings();

		// Initialize core services
		this.fileService = new FileService(plugin.app);
		this.propertiesService = new PropertiesService(plugin.app);
		this.tagService = new TagService(plugin.app);
		this.templateService = new TemplateService(plugin.app);
		this.projectService = new ProjectService(plugin.app, this.settings.maxActiveProjects);
		this.areasService = new AreasService(plugin.app, this.settings.maxActiveProjects);
		this.searchService = new SearchService(plugin.app);

		// Initialize integrations
		this.secretsManager = new SecretsManager(plugin.app);
		this.integrationManager = new IntegrationManager();
		this.aiProviderManager = new AIProviderManager(plugin.app, this.integrationManager, this.secretsManager);
		this.promptService = new PromptService(plugin.app);
		this.aiService = new AIService(plugin.app, this.aiProviderManager, this.promptService);

		// Initialize MCP server
		this.mcpServer = new MCPServer(plugin.app);
		this.mcpServer.setOrganizationMode(this.settings.organizationMode);
	}

	private getDefaultSettings(): PluginSettings {
		return {
			organizationMode: 'hybrid',
			maxActiveProjects: 3,
			paraFolders: {
				projects: '1-Projects',
				areas: '2-Areas',
				resources: '3-Resources',
				archives: '4-Archives',
			},
		};
	}

	async loadSettings(): Promise<void> {
		const loadedData = await this.plugin.loadData();
		this.settings = { ...this.getDefaultSettings(), ...loadedData };
		
		// Update services with new settings
		this.projectService = new ProjectService(this.plugin.app, this.settings.maxActiveProjects);
		this.areasService = new AreasService(this.plugin.app, this.settings.maxActiveProjects);
		this.mcpServer.setOrganizationMode(this.settings.organizationMode);
		
		// Initialize AI providers
		await this.aiProviderManager.initialize();
	}

	async saveSettings(): Promise<void> {
		await this.plugin.saveData(this.settings);
	}

	registerCommands(): void {
		// Register command palette commands
		this.plugin.addCommand({
			id: 'create-project-note',
			name: 'Create Project Note',
			callback: () => {
				this.createProjectNote();
			},
		});

		this.plugin.addCommand({
			id: 'move-to-project',
			name: 'Move to Project',
			callback: () => {
				this.moveToProject();
			},
		});

		this.plugin.addCommand({
			id: 'move-to-archive',
			name: 'Move to Archive',
			callback: () => {
				this.moveToArchive();
			},
		});

		this.plugin.addCommand({
			id: 'archive-current-project',
			name: 'Archive Current Project',
			callback: () => {
				this.archiveCurrentProject();
			},
		});
	}

	createSidebarView(leaf: WorkspaceLeaf): SidebarView {
		return new SidebarView(leaf, this);
	}

	showQuickActions(): void {
		// Show quick actions modal or sidebar
		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (activeFile) {
			// Show quick actions for current file
			console.log('Quick actions for:', activeFile.path);
		}
	}

	private async createProjectNote(): Promise<void> {
		new CreateProjectModal(this.plugin.app, this, async (name: string) => {
			try {
				const file = await this.projectService.createProject(
					name,
					this.settings.organizationMode,
					this.settings.paraFolders
				);
				await this.plugin.app.workspace.openLinkText(file.path, '', true);
			} catch (error: any) {
				new (await import('obsidian')).Notice(error.message || 'Failed to create project');
			}
		}).open();
	}

	private async moveToProject(): Promise<void> {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (!activeFile) {
			new (await import('obsidian')).Notice('No active file');
			return;
		}

		new MoveToPARAModal(this.plugin.app, this, 'project', async () => {
			try {
				await this.fileService.organizeToPARA(
					activeFile,
					'project',
					this.settings.organizationMode,
					this.settings.paraFolders
				);
				new (await import('obsidian')).Notice('File moved to Projects');
			} catch (error: any) {
				new (await import('obsidian')).Notice(error.message || 'Failed to move file');
			}
		}).open();
	}

	private async moveToArchive(): Promise<void> {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (!activeFile) {
			new (await import('obsidian')).Notice('No active file');
			return;
		}

		new MoveToPARAModal(this.plugin.app, this, 'archive', async () => {
			try {
				await this.fileService.organizeToPARA(
					activeFile,
					'archive',
					this.settings.organizationMode,
					this.settings.paraFolders
				);
				new (await import('obsidian')).Notice('File moved to Archives');
			} catch (error: any) {
				new (await import('obsidian')).Notice(error.message || 'Failed to move file');
			}
		}).open();
	}

	private async archiveCurrentProject(): Promise<void> {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (!activeFile) {
			new (await import('obsidian')).Notice('No active file');
			return;
		}

		// Check if it's a project
		const paraType = await this.propertiesService.getPARAType(activeFile);
		if (paraType !== 'project') {
			new (await import('obsidian')).Notice('Current file is not a project');
			return;
		}

		try {
			const result = await this.aiService.archiveProjectWithAI(activeFile, this.settings.organizationMode);
			new (await import('obsidian')).Notice('Project archived successfully');
			
			// Show archive summary (could open in a modal)
			console.log('Archive summary:', result.summary);
		} catch (error: any) {
			new (await import('obsidian')).Notice(error.message || 'Failed to archive project');
		}
	}

	async cleanup(): Promise<void> {
		await this.integrationManager.cleanupAll();
	}
}

