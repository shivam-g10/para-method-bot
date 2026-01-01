import { App, TFile } from 'obsidian';
import { PARA, PARAType, AreaStatus } from '../core/PARA';
import { FileService, OrganizationMode } from './FileService';
import { PropertiesService } from './PropertiesService';
import { TagService } from './TagService';
import { TemplateService } from './TemplateService';
import { ProjectService } from './ProjectService';

export interface AreaMetadata {
	name: string;
	status: AreaStatus;
	why?: string[];
	how?: string[];
	what?: string[];
	initiatives?: string[];
	projects?: string[];
}

export class AreasService {
	private app: App;
	private para: PARA;
	private fileService: FileService;
	private propertiesService: PropertiesService;
	private tagService: TagService;
	private templateService: TemplateService;
	private projectService: ProjectService;

	constructor(app: App, maxActiveProjects: number = 3) {
		this.app = app;
		this.para = new PARA(app);
		this.fileService = new FileService(app);
		this.propertiesService = new PropertiesService(app);
		this.tagService = new TagService(app);
		this.templateService = new TemplateService(app);
		this.projectService = new ProjectService(app, maxActiveProjects);
	}

	/**
	 * Get all active areas
	 */
	async getActiveAreas(mode: OrganizationMode): Promise<TFile[]> {
		const areas = await this.fileService.getFilesByPARAType('area', mode);
		const activeAreas: TFile[] = [];

		for (const area of areas) {
			const status = await this.propertiesService.getStatus(area);
			if (status === 'active') {
				activeAreas.push(area);
			}
		}

		return activeAreas;
	}

	/**
	 * Create a new Area of Improvement
	 */
	async createArea(
		name: string,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<TFile> {
		// Get template
		const template = this.templateService.getPlanOfActionTemplate();

		// Create file path
		const folderName = this.para.getFolderName('area', customFolders);
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
			'para-type': 'area',
			status: 'active',
		});

		// Add tags
		await this.tagService.addPARATag(file, 'area');
		await this.tagService.addStatusTag(file, 'active');

		// Move to folder if needed
		if (mode === 'folder' || mode === 'hybrid') {
			await this.fileService.moveToPARAFolder(file, 'area', customFolders);
		}

		return file;
	}

	/**
	 * Get area metadata
	 */
	async getAreaMetadata(file: TFile): Promise<AreaMetadata> {
		const properties = await this.propertiesService.getProperties(file);
		const content = await this.fileService.readFile(file);

		// Parse content for Golden Circle and other fields
		const why = this.extractSection(content, 'Why am I doing this?');
		const how = this.extractSection(content, 'How will I do this?');
		const what = this.extractSection(content, 'What am I doing?');
		const initiatives = this.extractSection(content, 'Initiatives');
		const projects = this.extractSection(content, 'Projects');

		return {
			name: file.basename,
			status: (properties.status as AreaStatus) || 'active',
			why,
			how,
			what,
			initiatives,
			projects,
		};
	}

	/**
	 * Update area status
	 */
	async updateAreaStatus(file: TFile, status: AreaStatus): Promise<void> {
		await this.propertiesService.setStatus(file, status);

		// Update tags
		await this.tagService.removeTag(file, '#active');
		await this.tagService.removeTag(file, '#inactive');
		await this.tagService.addStatusTag(file, status);
	}

	/**
	 * Link project to area
	 */
	async linkProjectToArea(projectFile: TFile, areaFile: TFile): Promise<void> {
		// Set area-of-improvement property on project
		await this.propertiesService.updateProperty(
			projectFile,
			'area-of-improvement',
			areaFile.basename
		);

		// Add link in area's Projects section
		const areaContent = await this.fileService.readFile(areaFile);
		const projectLink = `[[${projectFile.basename}]]`;

		// Check if Projects section exists
		if (!areaContent.includes('### Projects')) {
			// Add Projects section
			const newContent = `${areaContent}\n\n### Projects\n- ${projectLink}`;
			await this.fileService.writeFile(areaFile, newContent);
		} else {
			// Add to existing Projects section
			const projectsSectionRegex = /(### Projects\n)([\s\S]*?)(?=\n###|$)/;
			const match = areaContent.match(projectsSectionRegex);
			
			if (match) {
				const projectsList = match[2];
				if (!projectsList.includes(projectLink)) {
					const updatedList = `${projectsList}- ${projectLink}\n`;
					const newContent = areaContent.replace(projectsSectionRegex, `$1${updatedList}`);
					await this.fileService.writeFile(areaFile, newContent);
				}
			}
		}
	}

	/**
	 * Get projects linked to area
	 */
	async getLinkedProjects(areaFile: TFile, mode: OrganizationMode): Promise<TFile[]> {
		return await this.projectService.getProjectsByArea(areaFile.basename, mode);
	}

	/**
	 * Extract section from content
	 */
	private extractSection(content: string, sectionTitle: string): string[] {
		const regex = new RegExp(`###+\\s*${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?###`, 'i');
		const match = content.match(regex);
		
		if (!match) {
			return [];
		}

		const sectionContent = match[0];
		const lines = sectionContent.split('\n').slice(1, -1); // Remove header and next section header

		return lines
			.map(line => line.replace(/^[-*]\s*/, '').trim())
			.filter(line => line.length > 0);
	}
}

