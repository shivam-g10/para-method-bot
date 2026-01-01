# API Documentation

## Service Interfaces

### IFileService

File operations abstraction.

#### Methods

- `readFile(file: TFile): Promise<string>` - Read file content
- `writeFile(file: TFile, content: string): Promise<void>` - Write content to file
- `createFile(path: string, content: string): Promise<TFile>` - Create a new file
- `moveToPARAFolder(file: TFile, type: PARAType, customFolders?: Record<PARAType, string>): Promise<void>` - Move file to PARA folder
- `organizeToPARA(file: TFile, type: PARAType, mode: OrganizationMode, customFolders?: Record<PARAType, string>): Promise<void>` - Organize file to PARA category

### IPropertiesService

Property management abstraction.

#### Methods

- `getProperties(file: TFile): Promise<PARAProperties>` - Get frontmatter properties
- `setProperties(file: TFile, properties: PARAProperties): Promise<void>` - Set frontmatter properties
- `getPARAType(file: TFile): Promise<PARAType | null>` - Get PARA type from properties
- `setPARAType(file: TFile, type: PARAType): Promise<void>` - Set PARA type in properties

### ITagService

Tag operations abstraction.

#### Methods

- `getTags(file: TFile): string[]` - Get all tags from file
- `addTag(file: TFile, tag: string): Promise<void>` - Add tag to file
- `removeTag(file: TFile, tag: string): Promise<void>` - Remove tag from file
- `suggestTags(file: TFile): Promise<string[]>` - Suggest tags based on content

### ILinkService

Link management abstraction.

#### Methods

- `createLink(sourceFile: TFile, targetFile: TFile, bidirectional?: boolean): Promise<void>` - Create link between files
- `removeLink(sourceFile: TFile, targetFile: TFile, bidirectional?: boolean): Promise<void>` - Remove link between files
- `getLinksFromFile(file: TFile): string[]` - Get all links from file
- `suggestLinks(file: TFile): Promise<LinkInfo[]>` - Suggest links based on content

### ISearchService

Search operations abstraction.

#### Methods

- `search(filters: SearchFilters, mode: OrganizationMode): Promise<TFile[]>` - Search files with PARA context
- `searchByPARAType(type: PARAType, mode: OrganizationMode): Promise<TFile[]>` - Search by PARA type
- `fullTextSearch(query: string, mode: OrganizationMode): Promise<TFile[]>` - Full-text search

### ITemplateService

Template operations abstraction.

#### Methods

- `getTemplate(name: string): string | null` - Get template by name
- `renderTemplate(template: string, variables: TemplateVariables): string` - Render template with variables
- `createNoteFromTemplate(path: string, template: string, variables?: TemplateVariables): Promise<TFile>` - Create note from template
- `listTemplates(): string[]` - List all available templates

### IProjectService

Project management abstraction.

#### Methods

- `createProject(name: string, mode: OrganizationMode, customFolders?: Record<PARAType, string>): Promise<TFile>` - Create a new project
- `archiveProject(file: TFile, mode: OrganizationMode, customFolders?: Record<PARAType, string>): Promise<void>` - Archive a project
- `getActiveProjects(mode: OrganizationMode): Promise<TFile[]>` - Get all active projects
- `enforceProjectLimit(mode: OrganizationMode): Promise<void>` - Enforce project limit

### IAreasService

Areas management abstraction.

#### Methods

- `createArea(name: string, mode: OrganizationMode, customFolders?: Record<PARAType, string>): Promise<TFile>` - Create a new area
- `getAreas(mode: OrganizationMode): Promise<TFile[]>` - Get all areas
- `linkProjectToArea(projectFile: TFile, areaFile: TFile): Promise<void>` - Link project to area

### IAIService

AI operations abstraction.

#### Methods

- `extractFromProject(projectFile: TFile, mode: OrganizationMode): Promise<ExtractionResult>` - Extract information from project
- `archiveProjectWithAI(projectFile: TFile, mode: OrganizationMode): Promise<ArchiveResult>` - Archive project with AI assistance
- `generateInsights(files: TFile[], focusArea?: string, mode?: OrganizationMode): Promise<Insight[]>` - Generate insights

### IAIProvider

AI provider abstraction.

#### Methods

- `generate(request: AIRequest): Promise<AIResponse>` - Generate AI response
- `stream(request: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse>` - Stream AI response
- `healthCheck(): Promise<boolean>` - Health check

## Dependency Injection API

### ServiceContainer

#### Methods

- `register<T>(key: string, registration: ServiceRegistration<T>): void` - Register a service
- `resolve<T>(key: string): T` - Resolve a service
- `has(key: string): boolean` - Check if service is registered
- `clear(): void` - Clear all services

### ServiceFactory

#### Methods

- `createService<T>(key: string): T` - Create a service
- `getApp(): App` - Get Obsidian App instance
- `getSettings(): PluginSettings` - Get plugin settings

## Strategy Interfaces

### IOrganizationStrategy

#### Methods

- `organize(file: TFile, type: PARAType, customFolders?: Record<PARAType, string>): Promise<void>` - Organize file
- `getLocation(file: TFile, type: PARAType, customFolders?: Record<PARAType, string>): Promise<string>` - Get file location
- `detectType(file: TFile, customFolders?: Record<PARAType, string>): Promise<PARAType | null>` - Detect PARA type
- `getFilesByType(type: PARAType, customFolders?: Record<PARAType, string>): Promise<TFile[]>` - Get files by type

## Type Definitions

### OrganizationMode

```typescript
type OrganizationMode = 'folder' | 'property' | 'hybrid';
```

### PARAType

```typescript
type PARAType = 'project' | 'area' | 'resource' | 'archive';
```

### ServiceLifecycle

```typescript
type ServiceLifecycle = 'singleton' | 'transient' | 'scoped';
```

## Usage Examples

### Resolving a Service

```typescript
const fileService = container.resolve<IFileService>('IFileService');
```

### Registering a Custom Service

```typescript
container.register('IFileService', {
  implementation: CustomFileService,
  lifecycle: 'singleton',
  dependencies: ['App', 'PARA'],
});
```

### Using Organization Strategy

```typescript
const strategy = OrganizationStrategyFactory.create(app, 'hybrid');
await strategy.organize(file, 'project');
```

