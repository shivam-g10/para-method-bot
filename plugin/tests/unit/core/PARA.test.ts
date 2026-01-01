import { PARA } from '../../../src/core/PARA';
import { MockApp } from '../../mocks/ObsidianMocks';

describe('PARA', () => {
	let para: PARA;
	let mockApp: MockApp;

	beforeEach(() => {
		mockApp = new MockApp();
		para = new PARA(mockApp as any);
	});

	describe('getTypes', () => {
		it('should return all PARA types', () => {
			const types = para.getTypes();
			expect(types).toEqual(['project', 'area', 'resource', 'archive']);
		});
	});

	describe('getFolderName', () => {
		it('should return default folder name for project', () => {
			const folderName = para.getFolderName('project');
			expect(folderName).toBe('1-Projects');
		});

		it('should return custom folder name if provided', () => {
			const customFolders = {
				project: 'MyProjects',
				area: 'MyAreas',
				resource: 'MyResources',
				archive: 'MyArchives',
			};
			const folderName = para.getFolderName('project', customFolders);
			expect(folderName).toBe('MyProjects');
		});
	});

	describe('getTag', () => {
		it('should return correct tag for project', () => {
			const tag = para.getTag('project');
			expect(tag).toBe('#project');
		});

		it('should return correct tag for area', () => {
			const tag = para.getTag('area');
			expect(tag).toBe('#area');
		});
	});

	describe('detectTypeFromPath', () => {
		it('should detect project from path', () => {
			const type = para.detectTypeFromPath('1-Projects/my-project.md');
			expect(type).toBe('project');
		});

		it('should detect area from path', () => {
			const type = para.detectTypeFromPath('2-Areas/my-area.md');
			expect(type).toBe('area');
		});

		it('should return null if no PARA folder in path', () => {
			const type = para.detectTypeFromPath('random-folder/file.md');
			expect(type).toBeNull();
		});
	});

	describe('isProjectActive', () => {
		it('should return true for active project', () => {
			const item = {
				type: 'project' as const,
				status: 'active' as const,
				name: 'Test Project',
				path: '1-Projects/test.md',
			};
			expect(para.isProjectActive(item)).toBe(true);
		});

		it('should return false for completed project', () => {
			const item = {
				type: 'project' as const,
				status: 'completed' as const,
				name: 'Test Project',
				path: '1-Projects/test.md',
			};
			expect(para.isProjectActive(item)).toBe(false);
		});
	});
});

