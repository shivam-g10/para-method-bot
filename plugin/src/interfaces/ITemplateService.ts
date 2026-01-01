import { TFile } from 'obsidian';
import { TemplateVariables } from '../services/TemplateService';

/**
 * Interface for template operations abstraction.
 * Allows swapping template storage (files, database, etc.).
 * 
 * @interface ITemplateService
 */
export interface ITemplateService {
	/**
	 * Get Project Plan template
	 * @returns Template string for project plan
	 */
	getProjectPlanTemplate(): string;

	/**
	 * Get Plan of Action template (for Areas of Improvement)
	 * @returns Template string for plan of action
	 */
	getPlanOfActionTemplate(): string;

	/**
	 * Get basic PARA note template
	 * @param type - PARA type (project, area, resource, archive)
	 * @returns Template string for the specified type
	 */
	getBasicTemplate(type: 'project' | 'area' | 'resource' | 'archive'): string;

	/**
	 * Replace template variables
	 * @param template - Template string with variables
	 * @param variables - Variables to replace
	 * @returns Template with variables replaced
	 */
	replaceVariables(template: string, variables: TemplateVariables): string;

	/**
	 * Create note from template
	 * @param path - Path where note should be created
	 * @param template - Template string to use
	 * @param variables - Variables to replace in template
	 * @returns Promise resolving to created file
	 */
	createNoteFromTemplate(
		path: string,
		template: string,
		variables?: TemplateVariables
	): Promise<TFile>;

	/**
	 * Get default variables for templates
	 * @returns Object with default template variables
	 */
	getDefaultVariables(): TemplateVariables;

	/**
	 * Get template by name
	 * @param name - Name of template to retrieve
	 * @returns Template string or null if not found
	 */
	getTemplate(name: string): string | null;

	/**
	 * Render template with variables
	 * @param template - Template string
	 * @param variables - Variables to use
	 * @returns Rendered template string
	 */
	renderTemplate(template: string, variables: TemplateVariables): string;

	/**
	 * List all available templates
	 * @returns Array of template names
	 */
	listTemplates(): string[];
}

