import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { PARA } from './PARA';
import { ServiceContainer } from './ServiceContainer';
import { ServiceFactory } from './ServiceFactory';
import { registerServices } from './ServiceRegistration';
import { SidebarView } from '../ui/SidebarView';
import { CreateProjectModal, MoveToPARAModal } from '../ui/Modals';

// Service interfaces
import { IFileService } from '../interfaces/IFileService';
import { IPropertiesService } from '../interfaces/IPropertiesService';
import { ITagService } from '../interfaces/ITagService';
import { ITemplateService } from '../interfaces/ITemplateService';
import { IProjectService } from '../interfaces/IProjectService';
import { IAreasService } from '../interfaces/IAreasService';
import { ISearchService } from '../interfaces/ISearchService';
import { IAIService } from '../interfaces/IAIService';
import { IntegrationManager } from '../integrations/IntegrationManager';
import { AIProviderManager } from '../integrations/AIProviderManager';
import { PromptService } from '../integrations/PromptService';
import { SecretsManager } from '../integrations/SecretsManager';
import { MCPServer } from '../mcp/MCPServer';

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
	private container: ServiceContainer;
	private factory: ServiceFactory;

	// Services (accessed via interfaces)
	fileService: IFileService;
	propertiesService: IPropertiesService;
	tagService: ITagService;
	templateService: ITemplateService;
	projectService: IProjectService;
	areasService: IAreasService;
	searchService: ISearchService;

	// Integrations
	integrationManager: IntegrationManager;
	secretsManager: SecretsManager;
	aiProviderManager: AIProviderManager;
	promptService: PromptService;
	aiService: IAIService;
	mcpServer: MCPServer;

	constructor(plugin: Plugin, para: PARA) {
		this.plugin = plugin;
		this.para = para;
		this.settings = this.getDefaultSettings();

		// Create DI container and factory
		this.container = new ServiceContainer();
		this.factory = new ServiceFactory(this.container, plugin.app, this.settings);

		// Register all services
		registerServices(this.container, plugin.app, para, this.settings);

		// Resolve services from container
		this.propertiesService = this.container.resolve<IPropertiesService>('IPropertiesService');
		this.tagService = this.container.resolve<ITagService>('ITagService');
		this.fileService = this.container.resolve<IFileService>('IFileService');
		this.templateService = this.container.resolve<ITemplateService>('ITemplateService');
		this.searchService = this.container.resolve<ISearchService>('ISearchService');
		this.projectService = this.container.resolve<IProjectService>('IProjectService');
		this.areasService = this.container.resolve<IAreasService>('IAreasService');

		// Resolve integrations
		this.secretsManager = this.container.resolve<SecretsManager>('SecretsManager');
		this.integrationManager = this.container.resolve<IntegrationManager>('IntegrationManager');
		this.aiProviderManager = this.container.resolve<AIProviderManager>('AIProviderManager');
		this.promptService = this.container.resolve<PromptService>('PromptService');
		this.aiService = this.container.resolve<IAIService>('IAIService');
		this.mcpServer = this.container.resolve<MCPServer>('MCPServer');
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
		
		// Update factory with new settings
		this.factory.updateSettings(this.settings);
		
		// Re-register services that depend on settings
		this.container.clear();
		registerServices(this.container, this.plugin.app, this.para, this.settings);
		
		// Re-resolve services that may have changed
		this.projectService = this.container.resolve<IProjectService>('IProjectService');
		this.areasService = this.container.resolve<IAreasService>('IAreasService');
		this.mcpServer = this.container.resolve<MCPServer>('MCPServer');
		
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

