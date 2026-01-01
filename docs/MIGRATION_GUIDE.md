# Migration Guide

## Overview

This guide helps migrate existing code to use the abstraction layer with dependency injection.

## Migration Strategy

### Phase 1: Create Interfaces (Non-Breaking)

Interfaces are created alongside existing services. No breaking changes.

### Phase 2: Implement Interfaces

Services are updated to implement interfaces while maintaining backward compatibility.

### Phase 3: Introduce DI Container

DI container is introduced, services registered, but old instantiation still works.

### Phase 4: Refactor Services

Services are refactored to use dependency injection.

### Phase 5: Update PluginManager

PluginManager is updated to use DI container.

### Phase 6: Remove Old Code

Direct instantiation is removed.

## Breaking Changes

### Service Constructors

**Before:**
```typescript
constructor(app: App) {
  this.app = app;
  this.para = new PARA(app);
  this.propertiesService = new PropertiesService(app);
}
```

**After:**
```typescript
constructor(
  app: App,
  para: PARA,
  propertiesService: IPropertiesService
) {
  this.app = app;
  this.para = para;
  this.propertiesService = propertiesService;
}
```

### Service Access

**Before:**
```typescript
const fileService = new FileService(app);
```

**After:**
```typescript
const fileService = container.resolve<IFileService>('IFileService');
```

## Code Examples

### Before: Direct Instantiation

```typescript
export class ProjectService {
  private fileService: FileService;
  
  constructor(app: App) {
    this.fileService = new FileService(app);
  }
}
```

### After: Dependency Injection

```typescript
export class ProjectService implements IProjectService {
  private fileService: IFileService;
  
  constructor(
    app: App,
    fileService: IFileService
  ) {
    this.fileService = fileService;
  }
}
```

## Testing Migration

1. Run existing tests
2. Update tests to use mocks
3. Verify all tests pass
4. Check for regressions

## Rollback Plan

If migration causes issues:

1. Revert PluginManager changes
2. Services still work with direct instantiation
3. Interfaces remain for future migration
4. No data loss

## Common Issues

### Service Resolution Errors

**Issue**: Service not found
**Solution**: Ensure service is registered before resolving

### Circular Dependencies

**Issue**: Circular dependency detected
**Solution**: Refactor to remove circular dependencies

### Interface Mismatch

**Issue**: Method signature mismatch
**Solution**: Update implementation to match interface

