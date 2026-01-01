import { Plugin, PluginSettingTab, Setting, App } from 'obsidian';
import { PluginManager } from './core/PluginManager';
import { PARA } from './core/PARA';

export default class PARAAgentPlugin extends Plugin {
	private pluginManager: PluginManager | null = null;
	private para: PARA | null = null;

	async onload() {
		console.log('Loading PARA Agent plugin');

		// Initialize PARA core
		this.para = new PARA(this.app);

		// Initialize plugin manager
		this.pluginManager = new PluginManager(this, this.para);

		// Load settings
		await this.pluginManager.loadSettings();

		// Register commands
		this.pluginManager.registerCommands();

		// Add ribbon icon
		this.addRibbonIcon('brain', 'PARA Agent', () => {
			// Open sidebar or show quick actions
			this.pluginManager?.showQuickActions();
		});

		// Add settings tab
		this.addSettingTab(new PARAAgentSettingTab(this.app, this));

		// Register sidebar view
		this.registerView('para-agent-sidebar', (leaf) => {
			return this.pluginManager?.createSidebarView(leaf) || null;
		});

		// Activate sidebar view
		this.app.workspace.onLayoutReady(() => {
			this.activateView();
		});
	}

	async onunload() {
		console.log('Unloading PARA Agent plugin');
		await this.pluginManager?.cleanup();
	}

	private async activateView() {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType('para-agent-sidebar')[0];
		if (!leaf) {
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({
				type: 'para-agent-sidebar',
				active: true,
			});
		}
		workspace.revealLeaf(leaf);
	}

	getPluginManager(): PluginManager | null {
		return this.pluginManager;
	}

	getPARA(): PARA | null {
		return this.para;
	}
}

class PARAAgentSettingTab extends PluginSettingTab {
	plugin: PARAAgentPlugin;

	constructor(app: App, plugin: PARAAgentPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'PARA Agent Settings' });

		new Setting(containerEl)
			.setName('Organization Mode')
			.setDesc('Choose how to organize PARA items')
			.addDropdown((dropdown) => {
				dropdown
					.addOption('folder', 'Folder-based')
					.addOption('property', 'Property-based')
					.addOption('hybrid', 'Hybrid (Folder + Property)')
					.setValue(this.plugin.pluginManager?.settings?.organizationMode || 'hybrid')
					.onChange(async (value) => {
						if (this.plugin.pluginManager) {
							this.plugin.pluginManager.settings.organizationMode = value as 'folder' | 'property' | 'hybrid';
							await this.plugin.pluginManager.saveSettings();
						}
					});
			});

		new Setting(containerEl)
			.setName('Max Active Projects')
			.setDesc('Maximum number of active projects (default: 3)')
			.addText((text) => {
				text
					.setPlaceholder('3')
					.setValue(String(this.plugin.pluginManager?.settings?.maxActiveProjects || 3))
					.onChange(async (value) => {
						if (this.plugin.pluginManager) {
							this.plugin.pluginManager.settings.maxActiveProjects = parseInt(value) || 3;
							await this.plugin.pluginManager.saveSettings();
						}
					});
			});
	}
}

