import { TFile } from 'obsidian';
import { PARAType, ProjectStatus } from '../core/PARA';
import { OrganizationMode } from '../services/FileService';
import { ProjectMetadata } from '../services/ProjectService';
import { Result } from '../utils/Result';
import { ProjectLimitError, ValidationError } from '../utils/errors';

/**
 * Interface for project management abstraction.
 * Allows swapping project storage strategies.
 * 
 * @interface IProjectService
 */
export interface IProjectService {
	/**
	 * Get all active projects
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of active project files
	 */
	getActiveProjects(mode: OrganizationMode): Promise<TFile[]>;

	/**
	 * Check if project limit is reached
	 * @param mode - Organization mode
	 * @returns Promise resolving to true if limit is reached
	 */
	isProjectLimitReached(mode: OrganizationMode): Promise<boolean>;

	/**
	 * Create a new project note
	 * @param name - Name of the project
	 * @param mode - Organization mode
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise resolving to created project file
	 * @throws Error if project limit is reached
	 */
	createProject(
		name: string,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<TFile>;

	/**
	 * Create a new project note (Result pattern)
	 * @param name - Name of the project
	 * @param mode - Organization mode
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise resolving to Result with created project file or error
	 */
	createProjectSafe(
		name: string,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<Result<TFile, ProjectLimitError | ValidationError>>;

	/**
	 * Get project metadata
	 * @param file - Project file
	 * @returns Promise resolving to project metadata
	 */
	getProjectMetadata(file: TFile): Promise<ProjectMetadata>;

	/**
	 * Update project status
	 * @param file - Project file
	 * @param status - New status
	 * @returns Promise that resolves when status is updated
	 */
	updateProjectStatus(file: TFile, status: ProjectStatus): Promise<void>;

	/**
	 * Set project deadline
	 * @param file - Project file
	 * @param deadline - Deadline date
	 * @returns Promise that resolves when deadline is set
	 */
	setProjectDeadline(file: TFile, deadline: Date): Promise<void>;

	/**
	 * Archive a project
	 * @param file - Project file to archive
	 * @param mode - Organization mode
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise that resolves when project is archived
	 */
	archiveProject(
		file: TFile,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<void>;

	/**
	 * Get projects by area of improvement
	 * @param areaName - Name of the area
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of project files
	 */
	getProjectsByArea(areaName: string, mode: OrganizationMode): Promise<TFile[]>;

	/**
	 * Enforce project limit when creating new projects
	 * @param mode - Organization mode
	 * @returns Promise that resolves if limit check passes, throws if limit reached
	 */
	enforceProjectLimit(mode: OrganizationMode): Promise<void>;

	/**
	 * Enforce project limit (Result pattern)
	 * @param mode - Organization mode
	 * @returns Promise resolving to Result - success if limit not reached, error if reached
	 */
	enforceProjectLimitSafe(mode: OrganizationMode): Promise<Result<void, ProjectLimitError>>;
}

