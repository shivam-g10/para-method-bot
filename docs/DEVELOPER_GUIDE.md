# Developer Guide

## Getting Started

### Prerequisites

- Node.js 18+
- TypeScript 5.0+
- Obsidian (for testing)

### Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build the plugin: `pnpm run build`
4. Link to your Obsidian vault for development

## Understanding the Architecture

The plugin uses an abstraction layer with dependency injection:

- **Interfaces**: Define service contracts
- **Implementations**: Concrete service classes
- **DI Container**: Manages service lifecycle
- **Strategy Pattern**: For organization modes

## Creating Custom Services

### Step 1: Define Interface (if new service)

```typescript
export interface ICustomService {
  doSomething(): Promise<void>;
}
```

### Step 2: Implement Interface

```typescript
export class CustomService implements ICustomService {
  constructor(private app: App) {}

  async doSomething(): Promise<void> {
    // Implementation
  }
}
```

### Step 3: Register in DI Container

```typescript
container.register('ICustomService', {
  implementation: CustomService,
  lifecycle: 'singleton',
  dependencies: ['App'],
});
```

### Step 4: Use in PluginManager

```typescript
this.customService = container.resolve<ICustomService>('ICustomService');
```

## Swapping Implementations

### Example: Swapping FileService

```typescript
// Register alternative implementation
container.register('IFileService', {
  implementation: CloudFileService,
  lifecycle: 'singleton',
  dependencies: ['App', 'PARA'],
});

// Services using IFileService automatically get new implementation
```

## Adding New Integrations

### Creating AI Provider Integration

```typescript
export class CustomAIIntegration extends BaseIntegration implements IAIProvider {
  async generate(request: AIRequest): Promise<AIResponse> {
    // Implementation
  }

  async stream(request: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse> {
    // Implementation
  }

  async healthCheck(): Promise<boolean> {
    // Implementation
  }
}
```

### Registering Integration

```typescript
const integration = new CustomAIIntegration('custom-ai', config);
await aiProviderManager.registerProvider(integration);
```

## Creating Organization Strategies

### Implementing Strategy

```typescript
export class TagBasedOrganizationStrategy implements IOrganizationStrategy {
  async organize(file: TFile, type: PARAType): Promise<void> {
    // Implementation using tags
  }

  async detectType(file: TFile): Promise<PARAType | null> {
    // Detect from tags
  }
}
```

### Registering Strategy

```typescript
// Add to OrganizationStrategyFactory
static create(app: App, mode: OrganizationMode): IOrganizationStrategy {
  if (mode === 'tag') {
    return new TagBasedOrganizationStrategy(app);
  }
  // ... existing strategies
}
```

## Testing with Mocks

### Creating Mock Service

```typescript
export class MockFileService implements IFileService {
  async readFile(file: TFile): Promise<string> {
    return 'mock content';
  }
  // ... implement other methods
}
```

### Using Mocks in Tests

```typescript
const container = new ServiceContainer();
container.register('IFileService', {
  implementation: MockFileService,
  lifecycle: 'singleton',
});

const fileService = container.resolve<IFileService>('IFileService');
```

## Extending Templates

### Adding Custom Template

```typescript
templateService.templates.set('custom-template', `
# Custom Template
{{name}}
{{date}}
`);
```

### Using Custom Template

```typescript
const template = templateService.getTemplate('custom-template');
const rendered = templateService.renderTemplate(template, { name: 'Test', date: new Date() });
```

## Plugin Development Workflow

1. Create feature branch
2. Implement changes following architecture patterns
3. Write tests with mocks
4. Update documentation
5. Submit pull request

## Troubleshooting

### Service Resolution Errors

- Check service is registered before resolving
- Verify dependencies are registered
- Check lifecycle matches usage pattern

### Circular Dependencies

- Refactor to remove circular dependencies
- Use factory functions for complex dependencies
- Consider service composition

