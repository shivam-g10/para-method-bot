import { App } from 'obsidian';
import { ServiceContainer } from './ServiceContainer';
import { PARA } from './PARA';
import { PluginSettings } from './PluginManager';

// Service implementations
import { FileService } from '../services/FileService';
import { PropertiesService } from '../services/PropertiesService';
import { TagService } from '../services/TagService';
import { LinkService } from '../services/LinkService';
import { SearchService } from '../services/SearchService';
import { TemplateService } from '../services/TemplateService';
import { ProjectService } from '../services/ProjectService';
import { AreasService } from '../services/AreasService';
import { AIService } from '../services/AIService';
import { IntegrationManager } from '../integrations/IntegrationManager';
import { AIProviderManager } from '../integrations/AIProviderManager';
import { PromptService } from '../integrations/PromptService';
import { SecretsManager } from '../integrations/SecretsManager';
import { MCPServer } from '../mcp/MCPServer';

/**
 * Register all services in the DI container
 */
export function registerServices(
	container: ServiceContainer,
	app: App,
	para: PARA,
	settings: PluginSettings
): void {
	// Register core dependencies
	container.register('App', {
		factory: () => app,
		lifecycle: 'singleton',
	});

	container.register('PARA', {
		factory: () => para,
		lifecycle: 'singleton',
	});

	// Register services in dependency order
	// PropertiesService - no dependencies
	container.register('IPropertiesService', {
		implementation: PropertiesService,
		lifecycle: 'singleton',
		dependencies: ['App'],
	});

	// TagService - no dependencies
	container.register('ITagService', {
		implementation: TagService,
		lifecycle: 'singleton',
		dependencies: ['App'],
	});

	// FileService - depends on PARA, IPropertiesService, ITagService
	container.register('IFileService', {
		implementation: FileService,
		lifecycle: 'singleton',
		dependencies: ['App', 'PARA', 'IPropertiesService', 'ITagService'],
	});

	// LinkService - depends on IFileService
	container.register('ILinkService', {
		implementation: LinkService,
		lifecycle: 'singleton',
		dependencies: ['App', 'IFileService'],
	});

	// SearchService - depends on IFileService, IPropertiesService, ITagService
	container.register('ISearchService', {
		implementation: SearchService,
		lifecycle: 'singleton',
		dependencies: ['App', 'IFileService', 'IPropertiesService', 'ITagService'],
	});

	// TemplateService - no dependencies
	container.register('ITemplateService', {
		implementation: TemplateService,
		lifecycle: 'singleton',
		dependencies: ['App'],
	});

	// ProjectService - depends on PARA, IFileService, IPropertiesService, ITagService, ITemplateService
	container.register('IProjectService', {
		implementation: ProjectService,
		lifecycle: 'singleton',
		dependencies: ['App', 'PARA', 'IFileService', 'IPropertiesService', 'ITagService', 'ITemplateService'],
		factory: (app: App, para: PARA, fileService, propertiesService, tagService, templateService) => {
			return new ProjectService(app, para, fileService, propertiesService, tagService, templateService, settings.maxActiveProjects);
		},
	});

	// AreasService - depends on PARA, IFileService, IPropertiesService, ITagService, ITemplateService, IProjectService
	container.register('IAreasService', {
		implementation: AreasService,
		lifecycle: 'singleton',
		dependencies: ['App', 'PARA', 'IFileService', 'IPropertiesService', 'ITagService', 'ITemplateService', 'IProjectService'],
	});

	// Integration services
	container.register('SecretsManager', {
		implementation: SecretsManager,
		lifecycle: 'singleton',
		dependencies: ['App'],
	});

	container.register('IntegrationManager', {
		implementation: IntegrationManager,
		lifecycle: 'singleton',
	});

	container.register('AIProviderManager', {
		implementation: AIProviderManager,
		lifecycle: 'singleton',
		dependencies: ['App', 'IntegrationManager', 'SecretsManager'],
	});

	container.register('PromptService', {
		implementation: PromptService,
		lifecycle: 'singleton',
		dependencies: ['App', 'IFileService'],
	});

	// AIService - depends on AIProviderManager, PromptService, IFileService, IProjectService, ISearchService
	container.register('IAIService', {
		implementation: AIService,
		lifecycle: 'singleton',
		dependencies: ['App', 'AIProviderManager', 'PromptService', 'IFileService', 'IProjectService', 'ISearchService'],
	});

	// MCP Server
	container.register('MCPServer', {
		implementation: MCPServer,
		lifecycle: 'singleton',
		dependencies: ['App', 'ISearchService', 'IFileService'],
		factory: (app: App, searchService: any, fileService: any) => {
			const server = new MCPServer(app, searchService, fileService);
			server.setOrganizationMode(settings.organizationMode);
			return server;
		},
	});
}

