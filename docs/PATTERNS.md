# Production Patterns Guide

This document describes the production patterns implemented in the PARA Agent plugin to improve maintainability, error handling, and code quality.

## Table of Contents

1. [Result Pattern](#result-pattern)
2. [Option Pattern](#option-pattern)
3. [Error Handling](#error-handling)
4. [Validation](#validation)
5. [Builder Pattern](#builder-pattern)

## Result Pattern

The Result pattern provides type-safe error handling without exceptions. It's similar to Rust's `Result<T, E>` or functional programming's `Either` type.

### Basic Usage

```typescript
import { Result, ok, err, isOk, isErr } from '../utils/Result';

// Create a success result
const success: Result<string> = ok("Hello");

// Create an error result
const failure: Result<string> = err(new Error("Something went wrong"));

// Check result
if (isOk(result)) {
  console.log(result.value); // TypeScript knows this is Ok<string>
} else {
  console.error(result.error); // TypeScript knows this is Err
}
```

### Chaining Operations

```typescript
// Map over success value
const result = ok(5)
  .map(x => x * 2) // Result<number> = ok(10)
  .map(x => `Number: ${x}`); // Result<string> = ok("Number: 10")

// Chain operations (flatMap)
const chained = ok(5)
  .andThen(x => x > 0 ? ok(x * 2) : err(new Error("Negative")))
  .andThen(x => ok(x.toString()));

// Async operations
const asyncResult = await ok(file)
  .mapAsync(async (f) => await readFile(f))
  .andThenAsync(async (content) => await processContent(content));
```

### Converting Promises

```typescript
import { toResult } from '../utils/Result';

// Convert a promise to Result
const result = await toResult(
  someAsyncOperation()
);

if (result.success) {
  // Handle success
} else {
  // Handle error
}
```

### Example: File Operations

```typescript
// Traditional (throws exceptions)
try {
  const content = await fileService.readFile(file);
  console.log(content);
} catch (error) {
  console.error("Failed to read:", error);
}

// With Result pattern
const result = await fileService.readFileSafe(file);
if (result.success) {
  console.log(result.value);
} else {
  console.error("Failed to read:", result.error);
}

// Or with unwrapOr
const content = result.unwrapOr("Default content");
```

## Option Pattern

The Option pattern represents nullable values explicitly, similar to Rust's `Option<T>` or functional programming's `Maybe` type.

### Basic Usage

```typescript
import { Option, some, none, fromNullable, isSome, isNone } from '../utils/Option';

// Create Some
const value: Option<string> = some("Hello");

// Create None
const empty: Option<string> = none;

// From nullable value
const fromNull = fromNullable(null); // none
const fromValue = fromNullable("Hello"); // some("Hello")

// Check option
if (isSome(option)) {
  console.log(option.value); // TypeScript knows this is Some<string>
} else {
  // TypeScript knows this is None
}
```

### Chaining Operations

```typescript
// Map over value
const result = some(5)
  .map(x => x * 2) // Option<number> = some(10)
  .map(x => `Number: ${x}`); // Option<string> = some("Number: 10")

// Chain operations (flatMap)
const chained = some(5)
  .andThen(x => x > 0 ? some(x * 2) : none)
  .andThen(x => some(x.toString()));

// Async operations
const asyncOption = await some(file)
  .mapAsync(async (f) => await readFile(f))
  .andThenAsync(async (content) => await processContent(content));
```

### Unwrapping Values

```typescript
// Unwrap or throw
const value = option.unwrap(); // Throws if None

// Unwrap or default
const value = option.unwrapOr("Default");

// Unwrap or compute default
const value = option.unwrapOrElse(() => computeDefault());
```

### Example: PARA Type Detection

```typescript
// Traditional (returns null)
const type = await fileService.detectPARAType(file, mode);
if (type) {
  console.log("Type:", type);
}

// With Option pattern
const typeOption = await fileService.detectPARATypeSafe(file, mode);
if (typeOption.isSome()) {
  console.log("Type:", typeOption.value);
} else {
  console.log("No PARA type detected");
}

// Or with unwrapOr
const type = typeOption.unwrapOr('resource');
```

## Error Handling

Custom error types provide structured error handling with context.

### Error Types

```typescript
import {
  PARAError,
  ServiceError,
  ValidationError,
  ConfigurationError,
  IntegrationError,
  FileOperationError,
  ProjectLimitError
} from '../utils/errors';

// Base error
throw new PARAError("Something went wrong", "ERROR_CODE", { context: "value" });

// Service error
throw new ServiceError("File operation failed", "FILE", { path: "/path/to/file" });

// Validation error
throw new ValidationError("Invalid input", "fieldName", { value: "invalid" });

// Project limit error
throw new ProjectLimitError(currentCount, maxCount);
```

### Error Context

All errors include:
- `message`: Human-readable error message
- `code`: Machine-readable error code
- `context`: Additional context (optional)

```typescript
try {
  await projectService.createProject("My Project", mode);
} catch (error) {
  if (error instanceof ProjectLimitError) {
    console.error(`Error code: ${error.code}`);
    console.error(`Current: ${error.context?.currentCount}`);
    console.error(`Max: ${error.context?.maxCount}`);
  }
}
```

## Validation

The validation system provides composable validators for input validation.

### Basic Validators

```typescript
import {
  required,
  minLength,
  maxLength,
  inRange,
  matches,
  combine,
  validateObject
} from '../utils/validators';

// Required field
const validator = required("Name is required");
const result = validator(value); // Result<void, ValidationError>

// Length validation
const lengthValidator = combine(
  minLength(3, "Must be at least 3 characters"),
  maxLength(50, "Must be at most 50 characters")
);

// Range validation
const rangeValidator = inRange(1, 100, "Must be between 1 and 100");

// Pattern matching
const patternValidator = matches(/^[a-z]+$/, "Must be lowercase letters only");
```

### Combining Validators

```typescript
// Combine multiple validators
const nameValidator = combine(
  required("Name is required"),
  minLength(1, "Name cannot be empty"),
  maxLength(100, "Name too long")
);

const result = nameValidator(projectName);
if (!result.success) {
  console.error(result.error.message);
  console.error(result.error.context);
}
```

### Object Validation

```typescript
const schema = {
  name: [required("Name required"), minLength(1)],
  age: [required("Age required"), inRange(0, 120)],
  email: [required("Email required"), matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]
};

const result = validateObject(userInput, schema);
if (result.success) {
  // userInput is validated
} else {
  // result.error contains validation error
}
```

### Example: Project Creation

```typescript
// Validate project name
const nameValidator = combine(
  required("Project name is required"),
  minLength(1, "Project name cannot be empty")
);

const validation = nameValidator(name);
if (!validation.success) {
  return err(validation.error);
}
```

## Builder Pattern

The builder pattern helps construct complex objects step by step.

### Basic Builder

```typescript
import { FluentBuilder } from '../utils/builders';

class ProjectBuilder extends FluentBuilder<ProjectMetadata> {
  setName(name: string): this {
    return this.set('name', name);
  }

  setStatus(status: ProjectStatus): this {
    return this.set('status', status);
  }

  setDeadline(deadline: Date): this {
    return this.set('deadline', deadline.toISOString());
  }
}

// Usage
const project = new ProjectBuilder()
  .setName("My Project")
  .setStatus("active")
  .setDeadline(new Date())
  .build();
```

### Fluent Interface

```typescript
// Chain multiple operations
const builder = new ProjectBuilder()
  .setName("Project")
  .merge({ priority: 5, why: ["Reason 1"] })
  .setStatus("active")
  .build();
```

## Best Practices

### When to Use Result Pattern

- ✅ Operations that can fail (file I/O, network requests)
- ✅ When you want explicit error handling without exceptions
- ✅ When errors are part of the normal flow
- ✅ When you need to chain operations with error handling

### When to Use Option Pattern

- ✅ When a value might not exist (nullable returns)
- ✅ When you want to avoid null/undefined checks
- ✅ When you need to chain operations on potentially missing values
- ✅ When you want explicit handling of missing values

### When to Use Exceptions

- ❌ Don't use for normal control flow
- ✅ Use for truly exceptional circumstances
- ✅ Use for programming errors (bugs)
- ✅ Use when you want stack traces

### Error Handling Strategy

1. **Use Result pattern** for operations that can fail (file operations, API calls)
2. **Use Option pattern** for nullable values (search results, optional properties)
3. **Use custom errors** for structured error information
4. **Use validators** for input validation
5. **Use builders** for complex object construction

### Example: Complete Flow

```typescript
async function createProjectSafely(
  name: string,
  mode: OrganizationMode
): Promise<Result<TFile, ProjectLimitError | ValidationError>> {
  // Validate input
  const validation = combine(
    required("Name required"),
    minLength(1)
  )(name);
  
  if (!validation.success) {
    return err(validation.error);
  }

  // Check limits
  const limitCheck = await projectService.enforceProjectLimitSafe(mode);
  if (!limitCheck.success) {
    return limitCheck;
  }

  // Create project
  return await projectService.createProjectSafe(name, mode);
}

// Usage
const result = await createProjectSafely("My Project", "hybrid");
if (result.success) {
  console.log("Created:", result.value.path);
} else {
  console.error("Failed:", result.error.message);
}
```

## Migration Guide

### Migrating from Exceptions to Result

**Before:**
```typescript
try {
  const file = await fileService.createFile(path, content);
  return file;
} catch (error) {
  console.error(error);
  throw error;
}
```

**After:**
```typescript
const result = await fileService.createFileSafe(path, content);
if (result.success) {
  return result.value;
} else {
  console.error(result.error);
  return null; // or handle error
}
```

### Migrating from Null to Option

**Before:**
```typescript
const type = await propertiesService.getPARAType(file);
if (type !== null) {
  console.log(type);
}
```

**After:**
```typescript
const typeOption = await propertiesService.getPARATypeSafe(file);
if (typeOption.isSome()) {
  console.log(typeOption.value);
}
```

## Summary

These patterns provide:

1. **Type Safety**: Compile-time guarantees about error handling
2. **Explicit Error Handling**: No hidden exceptions
3. **Composability**: Chain operations easily
4. **Maintainability**: Clear error paths and validation
5. **Testability**: Easy to test error cases

For more examples, see the service implementations in `plugin/src/services/`.

