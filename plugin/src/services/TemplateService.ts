import { App, TFile } from 'obsidian';
import { ITemplateService } from '../interfaces/ITemplateService';

export interface TemplateVariables {
	[name: string]: string | number | Date;
}

export class TemplateService implements ITemplateService {
	private app: App;
	private templates: Map<string, string> = new Map();

	constructor(app: App) {
		this.app = app;
		// Initialize default templates
		this.templates.set('project-plan', this.getProjectPlanTemplate());
		this.templates.set('plan-of-action', this.getPlanOfActionTemplate());
	}

	/**
	 * Get Project Plan template
	 */
	getProjectPlanTemplate(): string {
		return `## Project Plan

### Why am I doing this?
- 

### How will I do this?
- 

### What am I doing?
- 

### Scope
- 

### What does complete look like?
- 

### Tasks
- [ ] 

### Deadline
- `;
	}

	/**
	 * Get Plan of Action template (for Areas of Improvement)
	 */
	getPlanOfActionTemplate(): string {
		return `## Plan of Action

### Why am I doing this?
- 

### How will I do this?
- 

### What am I doing?
- 

### Initiatives
- 

### Projects
- `;
	}

	/**
	 * Get basic PARA note template
	 */
	getBasicTemplate(type: 'project' | 'area' | 'resource' | 'archive'): string {
		const templates: Record<string, string> = {
			project: this.getProjectPlanTemplate(),
			area: this.getPlanOfActionTemplate(),
			resource: `# {{name}}

## Notes


## Related
- `,
			archive: `# {{name}}

## Summary


## Archived Date
{{date}}
`,
		};

		return templates[type] || '';
	}

	/**
	 * Replace template variables
	 */
	replaceVariables(template: string, variables: TemplateVariables): string {
		let result = template;

		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
			const stringValue = value instanceof Date 
				? value.toLocaleDateString() 
				: String(value);
			result = result.replace(regex, stringValue);
		}

		return result;
	}

	/**
	 * Create note from template
	 */
	async createNoteFromTemplate(
		path: string,
		template: string,
		variables: TemplateVariables = {}
	): Promise<TFile> {
		const content = this.replaceVariables(template, {
			date: new Date(),
			name: path.split('/').pop()?.replace('.md', '') || 'Untitled',
			...variables,
		});

		return await this.app.vault.create(path, content);
	}

	/**
	 * Get default variables for templates
	 */
	getDefaultVariables(): TemplateVariables {
		return {
			date: new Date(),
			year: new Date().getFullYear(),
			month: new Date().getMonth() + 1,
			day: new Date().getDate(),
		};
	}

	/**
	 * Get template by name
	 */
	getTemplate(name: string): string | null {
		return this.templates.get(name) || null;
	}

	/**
	 * Render template with variables
	 */
	renderTemplate(template: string, variables: TemplateVariables): string {
		return this.replaceVariables(template, variables);
	}

	/**
	 * List all available templates
	 */
	listTemplates(): string[] {
		return Array.from(this.templates.keys());
	}
}

