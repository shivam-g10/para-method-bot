import { ItemView, WorkspaceLeaf } from 'obsidian';
import { PluginManager } from '../core/PluginManager';

export class SidebarView extends ItemView {
	private pluginManager: PluginManager;

	constructor(leaf: WorkspaceLeaf, pluginManager: PluginManager) {
		super(leaf);
		this.pluginManager = pluginManager;
	}

	getViewType(): string {
		return 'para-agent-sidebar';
	}

	getDisplayText(): string {
		return 'PARA Agent';
	}

	getIcon(): string {
		return 'brain';
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('para-agent-sidebar');

		// Create dashboard
		const dashboard = container.createDiv('para-agent-dashboard');

		// Title
		dashboard.createEl('h2', { text: 'PARA Agent Dashboard' });

		// Stats section
		const statsSection = dashboard.createDiv('para-agent-section');
		statsSection.createEl('div', { text: 'Statistics', cls: 'para-agent-section-title' });

		const stats = statsSection.createDiv('para-agent-stats');
		
		// Project count
		const projectStat = stats.createDiv('para-agent-stat');
		const projectValue = projectStat.createDiv('para-agent-stat-value', { text: '...' });
		projectStat.createDiv('para-agent-stat-label', { text: 'Projects' });

		// Area count
		const areaStat = stats.createDiv('para-agent-stat');
		const areaValue = areaStat.createDiv('para-agent-stat-value', { text: '...' });
		areaStat.createDiv('para-agent-stat-label', { text: 'Areas' });

		// Resource count
		const resourceStat = stats.createDiv('para-agent-stat');
		const resourceValue = resourceStat.createDiv('para-agent-stat-value', { text: '...' });
		resourceStat.createDiv('para-agent-stat-label', { text: 'Resources' });

		// Quick actions section
		const actionsSection = dashboard.createDiv('para-agent-section');
		actionsSection.createEl('div', { text: 'Quick Actions', cls: 'para-agent-section-title' });

		const actions = actionsSection.createDiv('para-agent-quick-actions');

		// Create Project Note button
		const createProjectBtn = actions.createEl('button', {
			text: 'Create Project Note',
			cls: 'para-agent-button',
		});
		createProjectBtn.onclick = () => {
			this.pluginManager.plugin.app.commands.executeCommandById('para-agent:create-project-note');
		};

		// Move to Project button
		const moveToProjectBtn = actions.createEl('button', {
			text: 'Move to Project',
			cls: 'para-agent-button',
		});
		moveToProjectBtn.onclick = () => {
			this.pluginManager.plugin.app.commands.executeCommandById('para-agent:move-to-project');
		};

		// Move to Archive button
		const moveToArchiveBtn = actions.createEl('button', {
			text: 'Move to Archive',
			cls: 'para-agent-button',
		});
		moveToArchiveBtn.onclick = () => {
			this.pluginManager.plugin.app.commands.executeCommandById('para-agent:move-to-archive');
		};

		// Archive Current Project button
		const archiveProjectBtn = actions.createEl('button', {
			text: 'Archive Current Project',
			cls: 'para-agent-button',
		});
		archiveProjectBtn.onclick = () => {
			this.pluginManager.plugin.app.commands.executeCommandById('para-agent:archive-current-project');
		};

		// Update stats
		await this.updateStats(projectValue, areaValue, resourceValue);
	}

	async onClose(): Promise<void> {
		// Cleanup if needed
	}

	private async updateStats(
		projectValue: HTMLElement,
		areaValue: HTMLElement,
		resourceValue: HTMLElement
	): Promise<void> {
		const mode = this.pluginManager.settings.organizationMode;
		
		try {
			// Get active projects
			const activeProjects = await this.pluginManager.projectService.getActiveProjects(mode);
			projectValue.textContent = String(activeProjects.length);

			// Get active areas
			const activeAreas = await this.pluginManager.areasService.getActiveAreas(mode);
			areaValue.textContent = String(activeAreas.length);

			// Get resources count
			const resources = await this.pluginManager.fileService.getFilesByPARAType('resource', mode);
			resourceValue.textContent = String(resources.length);
		} catch (error) {
			console.error('Error updating stats:', error);
			projectValue.textContent = '0';
			areaValue.textContent = '0';
			resourceValue.textContent = '0';
		}
	}
}

