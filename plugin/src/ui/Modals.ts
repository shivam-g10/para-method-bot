import { App, Modal, Setting } from 'obsidian';
import { PluginManager } from '../core/PluginManager';

export class CreateProjectModal extends Modal {
	private pluginManager: PluginManager;
	private projectName: string = '';
	private onSubmit: (name: string) => void;

	constructor(app: App, pluginManager: PluginManager, onSubmit: (name: string) => void) {
		super(app);
		this.pluginManager = pluginManager;
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Create Project Note' });

		new Setting(contentEl)
			.setName('Project Name')
			.addText((text) => {
				text
					.setPlaceholder('Enter project name')
					.onChange((value) => {
						this.projectName = value;
					});
			});

		new Setting(contentEl)
			.addButton((button) => {
				button
					.setButtonText('Create')
					.setCta()
					.onClick(() => {
						if (this.projectName.trim()) {
							this.onSubmit(this.projectName.trim());
							this.close();
						}
					});
			})
			.addButton((button) => {
				button
					.setButtonText('Cancel')
					.onClick(() => {
						this.close();
					});
			});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class MoveToPARAModal extends Modal {
	private pluginManager: PluginManager;
	private paraType: 'project' | 'area' | 'resource' | 'archive';
	private onSubmit: (type: string) => void;

	constructor(
		app: App,
		pluginManager: PluginManager,
		paraType: 'project' | 'area' | 'resource' | 'archive',
		onSubmit: (type: string) => void
	) {
		super(app);
		this.pluginManager = pluginManager;
		this.paraType = paraType;
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		const typeLabels: Record<string, string> = {
			project: 'Project',
			area: 'Area',
			resource: 'Resource',
			archive: 'Archive',
		};

		contentEl.createEl('h2', { text: `Move to ${typeLabels[this.paraType]}` });

		contentEl.createEl('p', {
			text: `Are you sure you want to move the current file to ${typeLabels[this.paraType]}?`,
		});

		new Setting(contentEl)
			.addButton((button) => {
				button
					.setButtonText('Move')
					.setCta()
					.onClick(() => {
						this.onSubmit(this.paraType);
						this.close();
					});
			})
			.addButton((button) => {
				button
					.setButtonText('Cancel')
					.onClick(() => {
						this.close();
					});
			});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

