# Contributing to PARA Method Obsidian Agent

Thank you for your interest in contributing to PARA Method Obsidian Agent! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue list](https://github.com/shivam-g10/para-method-bot/issues) to see if the bug has already been reported. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Screenshots** (if applicable)
- **Environment details**:
  - Obsidian version
  - Plugin version
  - Operating system
  - Node.js version (if relevant)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub Discussions. When suggesting an enhancement:

- Use a **clear and descriptive title**
- Provide a **detailed description** of the enhancement
- Explain **why this enhancement would be useful**
- Consider **alternatives or workarounds** you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our development guidelines
3. **Add tests** for new features or bug fixes
4. **Ensure all tests pass** (`pnpm test`)
5. **Update documentation** as needed
6. **Submit a pull request** with a clear description

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)
- [Obsidian](https://obsidian.md/) (for testing)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivam-g10/para-method-bot.git
   cd para-method-bot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   cd plugin
   pnpm install
   ```

3. **Build the plugin**
   ```bash
   pnpm run build
   ```

4. **Link to your Obsidian vault** (for development)
   ```bash
   # Create a symlink from your vault's plugins folder to the plugin directory
   # Windows (PowerShell as Administrator):
   New-Item -ItemType SymbolicLink -Path "C:\path\to\vault\.obsidian\plugins\para-agent" -Target "$PWD\plugin"
   
   # macOS/Linux:
   ln -s "$PWD/plugin" "/path/to/vault/.obsidian/plugins/para-agent"
   ```

5. **Enable the plugin** in Obsidian Settings > Community Plugins

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test them in Obsidian

3. **Run tests**
   ```bash
   pnpm test
   ```

4. **Check code coverage**
   ```bash
   pnpm run test:coverage
   ```

5. **Build for production**
   ```bash
   pnpm run build
   ```

## Development Guidelines

### TypeScript Best Practices

- Use **TypeScript 5.0+** features
- Provide **type annotations** for function parameters and return types
- Use **interfaces** for object shapes
- Avoid `any` types - use `unknown` or proper types instead
- Enable strict mode in TypeScript configuration

### Code Style

- Follow **existing code style** and patterns
- Use **meaningful variable and function names**
- Add **JSDoc comments** for public APIs
- Keep functions **focused and single-purpose**
- Maintain **consistent indentation** (tabs, 4 spaces)

### Testing

- Write **unit tests** for new features
- Write **integration tests** for complex workflows
- Maintain **80%+ code coverage**
- Test **edge cases** and error conditions
- Use **descriptive test names**

### File Organization

- Place new files in **appropriate directories**:
  - `src/core/` - Core PARA functionality
  - `src/services/` - Business logic services
  - `src/integrations/` - AI provider integrations
  - `src/mcp/` - MCP server components
  - `src/ui/` - UI components
  - `src/utils/` - Utility functions
- Follow **existing naming conventions**

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add project archiving feature
fix: Resolve issue with tag management
docs: Update installation instructions
test: Add tests for FileService
refactor: Simplify PARA folder structure logic
```

Prefix types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `refactor:` - Code refactoring
- `style:` - Code style changes (formatting)
- `chore:` - Maintenance tasks

## Project Structure

```
para-method-bot/
├── plugin/              # Obsidian plugin source
│   ├── src/
│   │   ├── core/        # Core PARA functionality
│   │   ├── services/    # Business logic services
│   │   ├── integrations/# AI provider integrations
│   │   ├── mcp/         # MCP server components
│   │   ├── ui/          # UI components
│   │   ├── utils/       # Utility functions
│   │   └── main.ts      # Plugin entry point
│   ├── tests/           # Test files
│   └── package.json     # Plugin dependencies
├── CONTRIBUTING.md      # This file
├── CODE_OF_CONDUCT.md   # Code of conduct
└── README.md            # Project README
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm run test:unit

# Run integration tests only
pnpm run test:integration

# Run with coverage
pnpm run test:coverage
```

### Writing Tests

- Use **Jest** as the testing framework
- Place tests in `tests/` directory mirroring `src/` structure
- Use **descriptive test names** that explain what is being tested
- Mock Obsidian API using mocks in `tests/mocks/`

Example:
```typescript
describe('FileService', () => {
  it('should create a project file with correct PARA tags', () => {
    // Test implementation
  });
});
```

## Documentation

- Update **README.md** for user-facing changes
- Add **JSDoc comments** for new public APIs
- Update **inline code comments** for complex logic
- Keep **CHANGELOG.md** updated (if applicable)

## Review Process

1. All pull requests require **review and approval**
2. Maintainers will review code, tests, and documentation
3. Address feedback and make requested changes
4. Once approved, a maintainer will merge your PR

## Questions?

- Open a [GitHub Discussion](https://github.com/shivam-g10/para-method-bot/discussions) for questions
- Check existing [Issues](https://github.com/shivam-g10/para-method-bot/issues) and [Discussions](https://github.com/shivam-g10/para-method-bot/discussions)

Thank you for contributing to PARA Method Obsidian Agent! 🎉

