import { App, TFile } from 'obsidian';
import { PARA, PARAType, ProjectStatus } from '../core/PARA';
import { OrganizationMode } from './FileService';
import { IProjectService } from '../interfaces/IProjectService';
import { IFileService } from '../interfaces/IFileService';
import { IPropertiesService } from '../interfaces/IPropertiesService';
import { ITagService } from '../interfaces/ITagService';
import { ITemplateService } from '../interfaces/ITemplateService';
import { formatDate, parseDate } from '../utils/helpers';
import { Result, ok, err } from '../utils/Result';
import { ProjectLimitError, ValidationError } from '../utils/errors';
import { required, minLength, combine } from '../utils/validators';

export interface ProjectMetadata {
	name: string;
	status: ProjectStatus;
	deadline?: Date;
	priority?: number;
	areaOfImprovement?: string;
	why?: string[];
	how?: string[];
	what?: string[];
	scope?: string;
	complete?: string;
	tasks?: string[];
}

export class ProjectService implements IProjectService {
	private app: App;
	private para: PARA;
	private fileService: IFileService;
	private propertiesService: IPropertiesService;
	private tagService: ITagService;
	private templateService: ITemplateService;
	private maxActiveProjects: number;

	constructor(
		app: App,
		para: PARA,
		fileService: IFileService,
		propertiesService: IPropertiesService,
		tagService: ITagService,
		templateService: ITemplateService,
		maxActiveProjects: number = 3
	) {
		this.app = app;
		this.para = para;
		this.fileService = fileService;
		this.propertiesService = propertiesService;
		this.tagService = tagService;
		this.templateService = templateService;
		this.maxActiveProjects = maxActiveProjects;
	}

	/**
	 * Get all active projects
	 */
	async getActiveProjects(mode: OrganizationMode): Promise<TFile[]> {
		const projects = await this.fileService.getFilesByPARAType('project', mode);
		const activeProjects: TFile[] = [];

		for (const project of projects) {
			const status = await this.propertiesService.getStatus(project);
			if (status === 'active') {
				activeProjects.push(project);
			}
		}

		return activeProjects;
	}

	/**
	 * Check if project limit is reached
	 */
	async isProjectLimitReached(mode: OrganizationMode): Promise<boolean> {
		const activeProjects = await this.getActiveProjects(mode);
		return activeProjects.length >= this.maxActiveProjects;
	}

	/**
	 * Create a new project note
	 */
	async createProject(
		name: string,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<TFile> {
		// Check project limit
		if (await this.isProjectLimitReached(mode)) {
			const activeProjects = await this.getActiveProjects(mode);
			throw new ProjectLimitError(activeProjects.length, this.maxActiveProjects);
		}

		// Validate project name
		const nameValidator = combine(
			required('Project name is required'),
			minLength(1, 'Project name cannot be empty')
		);
		const validation = nameValidator(name);
		if (!validation.success) {
			throw validation.error;
		}

		// Get template
		const template = this.templateService.getProjectPlanTemplate();

		// Create file path
		const folderName = this.para.getFolderName('project', customFolders);
		const sanitizedName = name.replace(/[<>:"/\\|?*]/g, '').trim();
		const path = mode === 'property' 
			? `${sanitizedName}.md`
			: `${folderName}/${sanitizedName}.md`;

		// Ensure folder exists if using folder mode
		if (mode === 'folder' || mode === 'hybrid') {
			await this.fileService.ensureFolderExists(folderName);
		}

		// Create file with template
		const file = await this.templateService.createNoteFromTemplate(path, template, {
			name: sanitizedName,
		});

		// Set properties
		await this.propertiesService.setProperties(file, {
			'para-type': 'project',
			status: 'active',
		});

		// Add tags
		await this.tagService.addPARATag(file, 'project');
		await this.tagService.addStatusTag(file, 'active');

		// Move to folder if needed
		if (mode === 'folder' || mode === 'hybrid') {
			await this.fileService.moveToPARAFolder(file, 'project', customFolders);
		}

		return file;
	}

	/**
	 * Get project metadata
	 */
	async getProjectMetadata(file: TFile): Promise<ProjectMetadata> {
		const properties = await this.propertiesService.getProperties(file);
		const content = await this.fileService.readFile(file);

		// Parse content for Golden Circle and other fields
		const why = this.extractSection(content, 'Why am I doing this?');
		const how = this.extractSection(content, 'How will I do this?');
		const what = this.extractSection(content, 'What am I doing?');
		const scope = this.extractSection(content, 'Scope', true);
		const complete = this.extractSection(content, 'What does complete look like?', true);
		const tasks = this.extractTasks(content);
		const deadline = properties.deadline ? parseDate(properties.deadline) : undefined;

		return {
			name: file.basename,
			status: (properties.status as ProjectStatus) || 'active',
			deadline,
			priority: properties.priority,
			areaOfImprovement: properties['area-of-improvement'],
			why,
			how,
			what,
			scope,
			complete,
			tasks,
		};
	}

	/**
	 * Update project status
	 */
	async updateProjectStatus(file: TFile, status: ProjectStatus): Promise<void> {
		await this.propertiesService.setStatus(file, status);

		// Update tags
		await this.tagService.removeTag(file, '#active');
		await this.tagService.removeTag(file, '#on-hold');
		await this.tagService.removeTag(file, '#completed');
		await this.tagService.addStatusTag(file, status);
	}

	/**
	 * Set project deadline
	 */
	async setProjectDeadline(file: TFile, deadline: Date): Promise<void> {
		await this.propertiesService.updateProperty(file, 'deadline', formatDate(deadline));
	}

	/**
	 * Archive a project
	 */
	async archiveProject(
		file: TFile,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<void> {
		// Update status
		await this.updateProjectStatus(file, 'completed');

		// Update PARA type to archive
		await this.propertiesService.setPARAType(file, 'archive');

		// Update tags
		await this.tagService.removeAllPARATags(file);
		await this.tagService.addPARATag(file, 'archive');

		// Move to archive folder if using folder mode
		if (mode === 'folder' || mode === 'hybrid') {
			await this.fileService.moveToPARAFolder(file, 'archive', customFolders);
		}
	}

	/**
	 * Extract section from content
	 */
	private extractSection(content: string, sectionTitle: string, singleLine: boolean = false): string[] {
		const regex = new RegExp(`###+\\s*${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?###`, 'i');
		const match = content.match(regex);
		
		if (!match) {
			return [];
		}

		const sectionContent = match[0];
		const lines = sectionContent.split('\n').slice(1, -1); // Remove header and next section header

		if (singleLine) {
			const text = lines.join(' ').trim();
			return text ? [text] : [];
		}

		return lines
			.map(line => line.replace(/^[-*]\s*/, '').trim())
			.filter(line => line.length > 0);
	}

	/**
	 * Extract tasks from content
	 */
	private extractTasks(content: string): string[] {
		const tasks: string[] = [];
		const taskRegex = /- \[([ x])\] (.+)/g;
		let match;

		while ((match = taskRegex.exec(content)) !== null) {
			tasks.push(match[2]);
		}

		return tasks;
	}

	/**
	 * Get projects by area of improvement
	 */
	async getProjectsByArea(areaName: string, mode: OrganizationMode): Promise<TFile[]> {
		const projects = await this.fileService.getFilesByPARAType('project', mode);
		const filtered: TFile[] = [];

		for (const project of projects) {
			const properties = await this.propertiesService.getProperties(project);
			if (properties['area-of-improvement'] === areaName) {
				filtered.push(project);
			}
		}

		return filtered;
	}

	/**
	 * Enforce project limit when creating new projects
	 */
	async enforceProjectLimit(mode: OrganizationMode): Promise<void> {
		if (await this.isProjectLimitReached(mode)) {
			const activeProjects = await this.getActiveProjects(mode);
			throw new ProjectLimitError(activeProjects.length, this.maxActiveProjects);
		}
	}

	/**
	 * Enforce project limit (Result pattern)
	 */
	async enforceProjectLimitSafe(mode: OrganizationMode): Promise<Result<void, ProjectLimitError>> {
		if (await this.isProjectLimitReached(mode)) {
			const activeProjects = await this.getActiveProjects(mode);
			return err(new ProjectLimitError(activeProjects.length, this.maxActiveProjects));
		}
		return ok(undefined);
	}

	/**
	 * Create a new project note (Result pattern)
	 */
	async createProjectSafe(
		name: string,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<Result<TFile, ProjectLimitError | ValidationError>> {
		// Validate project name
		const nameValidator = combine(
			required('Project name is required'),
			minLength(1, 'Project name cannot be empty')
		);
		const validation = nameValidator(name);
		if (!validation.success) {
			return err(validation.error);
		}

		// Check project limit
		const limitCheck = await this.enforceProjectLimitSafe(mode);
		if (!limitCheck.success) {
			return limitCheck;
		}

		try {
			const file = await this.createProject(name, mode, customFolders);
			return ok(file);
		} catch (error) {
			if (error instanceof ProjectLimitError) {
				return err(error);
			}
			if (error instanceof ValidationError) {
				return err(error);
			}
			// Wrap unexpected errors
			return err(new ValidationError(
				error instanceof Error ? error.message : 'Failed to create project',
				'name'
			));
		}
	}
}

