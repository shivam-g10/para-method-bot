# PARA Method Obsidian Agent

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-green.svg)](https://obsidian.md/)
[![GitHub stars](https://img.shields.io/github/stars/shivam-g10/para-method-bot.svg?style=social&label=Star)](https://github.com/shivam-g10/para-method-bot)
[![GitHub forks](https://img.shields.io/github/forks/shivam-g10/para-method-bot.svg?style=social&label=Fork)](https://github.com/shivam-g10/para-method-bot/fork)
[![GitHub issues](https://img.shields.io/github/issues/shivam-g10/para-method-bot.svg)](https://github.com/shivam-g10/para-method-bot/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/shivam-g10/para-method-bot.svg)](https://github.com/shivam-g10/para-method-bot/pulls)
[![GitHub release](https://img.shields.io/github/v/release/shivam-g10/para-method-bot.svg)](https://github.com/shivam-g10/para-method-bot/releases)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/shivam-g10/para-method-bot/graphs/commit-activity)

An intelligent Obsidian plugin that automates and manages your PARA method-based second brain personal knowledge base system with AI-powered features, secure secrets management, and multiple integration support.

## 🌟 Features

### Core PARA Method Automation
- **File Organization**: Automatically organize files into PARA folders (Projects, Areas, Resources, Archives)
- **Tag Management**: Apply and manage PARA tags with AI-powered suggestions
- **Project Tracking**: Track project status, metadata, and auto-archive completed projects
- **Link Management**: Auto-create links between related PARA items with bidirectional linking
- **Template Service**: Quick note creation from PARA-specific templates
- **Search & Filter**: Advanced search with PARA context and saved queries

### AI-Powered Features
- **Project Extraction**: Use AI to extract information from projects and distribute to resources
- **Archive Assistant**: AI-assisted project archiving with information preservation
- **Areas of Improvement**: Track and manage improvement areas with AI suggestions
- **Insight Generation**: Generate insights from your second brain content only (no external data)

### Security & Privacy
- **Encrypted Secrets Management**: Secure storage for API keys using Electron's safeStorage API
  - macOS Keychain
  - Windows Credential Store
  - Linux keyring
- **Ollama Auto-Detection**: Automatically detect and integrate with local Ollama instances
- **Privacy-First**: Support for local LLMs with no data leaving your machine

### Integrations
- **Multiple AI Providers**: Support for OpenAI, Anthropic, and local LLMs (Ollama, LM Studio)
- **MCP Integration**: Model Context Protocol support for AI assistant access to your vault
- **Extensible Architecture**: Plugin-based integration system for custom integrations

### User Interface
- **Click-Based UI**: Ribbon commands, command palette, sidebar panel, and modal dialogs
- **PARA Dashboard**: Visual overview of projects, areas, resources, and quick actions
- **Intuitive Workflows**: Streamlined interfaces for common PARA operations

## 📋 Requirements

- [Obsidian](https://obsidian.md/) (latest version)
- Node.js 18+ (for development)
- TypeScript 5.0+ (for development)

## 🚀 Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "PARA Method Obsidian Agent"
4. Click Install

### Manual Installation

1. Download the latest release from [Releases](https://github.com/shivam-g10/para-method-bot/releases)
2. Extract the plugin folder to your vault's `.obsidian/plugins/` directory
3. Reload Obsidian
4. Enable the plugin in Settings > Community Plugins

## ⚙️ Configuration

### Initial Setup

1. Open Obsidian Settings
2. Navigate to PARA Agent settings
3. Configure your PARA folder structure (or use defaults)
4. Set up AI provider credentials (encrypted storage)

### AI Provider Setup

#### OpenAI
1. Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. Enter it in Settings > PARA Agent > AI Providers
3. Key is encrypted and stored securely

#### Anthropic
1. Get your API key from [Anthropic](https://console.anthropic.com/)
2. Enter it in Settings > PARA Agent > AI Providers
3. Key is encrypted and stored securely

#### Ollama (Local)
1. Install [Ollama](https://ollama.ai/)
2. Start Ollama service
3. Plugin will auto-detect running instance
4. Select models from available list

### PARA Organization

Choose your organization method:
- **Folder-based**: Traditional PARA folder structure
- **Property-based**: Use frontmatter properties (works with Obsidian Bases)
- **Hybrid**: Combine both approaches

## 📖 Usage

### Quick Actions

- **Ribbon Commands**: Click icons in Obsidian ribbon for quick actions
- **Command Palette**: Press `Cmd/Ctrl+P` and search for PARA commands
- **Sidebar Panel**: Access PARA dashboard and quick actions

### Common Workflows

#### Archive a Project
1. Open the project note
2. Click "Archive Current Project" in ribbon or command palette
3. Review AI-extracted information
4. Confirm archiving

#### Extract Information to Resources
1. Select a project note
2. Click "Extract to Resources" 
3. Review AI-suggested resource destinations
4. Confirm distribution

#### Create Project Note
1. Use command palette: "PARA: Create Project Note"
2. Fill in project details
3. Note is created with proper tags and location

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/shivam-g10/para-method-bot.git
cd para-method-bot

# Install dependencies
pnpm install

# Build the plugin
cd plugin
pnpm run build

# Run tests
pnpm test
```

### Project Structure

```
second-brain-agent/
├── plugin/          # Obsidian plugin source
├── docs/            # Documentation
└── README.md        # This file
```

### Testing

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm run test:unit

# Run integration tests
pnpm run test:integration

# Run E2E tests
pnpm run test:e2e

# Check coverage
pnpm run test:coverage
```

### Building

```bash
# Development build
pnpm run build

# Production build
pnpm run build:prod

# Watch mode
pnpm run dev
```

## 🔒 Security

- All API keys are encrypted using OS-level secure storage
- Secrets are stored separately from plugin data
- No credentials are logged or stored in plain text
- Local LLM support for complete privacy

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Maintain 80%+ code coverage
- Follow the existing code style
- Update documentation

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PARA Method](https://fortelabs.co/blog/para/) by Tiago Forte
- [Obsidian](https://obsidian.md/) for the amazing platform
- All contributors and users of this plugin

## 🏗️ Architecture

The plugin uses an **abstraction layer architecture** with dependency injection, enabling:

- **Swappable Implementations**: Easy to swap services (e.g., different file storage, AI providers)
- **Testability**: Mock interfaces for isolated testing
- **Flexibility**: Add new implementations without changing business logic
- **Extensibility**: Plugin-style architecture for custom implementations

### Key Components

- **Service Interfaces**: All services abstracted behind interfaces
- **Dependency Injection**: ServiceContainer manages service lifecycle
- **Strategy Pattern**: Organization modes (folder, property, hybrid) as swappable strategies
- **Integration System**: Extensible integration framework for AI providers and external services

See [Architecture Documentation](docs/ARCHITECTURE.md) for detailed information.

## 📚 Documentation

- [Overall Plan](Overall_plan.md) - Complete project plan and architecture
- [Architecture Documentation](docs/ARCHITECTURE.md) - System architecture and design patterns
- [API Documentation](docs/API.md) - Complete API reference
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Guide for extending and customizing
- [Migration Guide](docs/MIGRATION_GUIDE.md) - Guide for migrating to new architecture
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/shivam-g10/para-method-bot/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/shivam-g10/para-method-bot/discussions)
- **Questions**: [GitHub Discussions Q&A](https://github.com/shivam-g10/para-method-bot/discussions/categories/q-a)

## 🗺️ Roadmap

- [ ] Core PARA method automation
- [ ] AI-powered features
- [ ] Secrets management
- [ ] Ollama auto-detection
- [ ] MCP integration
- [ ] Multiple integration support
- [ ] Comprehensive testing
- [ ] Documentation

See [Overall Plan](Overall_plan.md) for detailed roadmap.

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=shivam-g10/para-method-bot&type=Date)](https://star-history.com/#shivam-g10/para-method-bot&Date)

---

**Note**: This project is in active development. Features and APIs may change.

Made with ❤️ for the Obsidian and PARA method communities.

