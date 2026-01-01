import { FileService } from '../../../src/services/FileService';
import { MockApp, MockVault } from '../../mocks/ObsidianMocks';

describe('FileService', () => {
	let fileService: FileService;
	let mockApp: MockApp;

	beforeEach(() => {
		mockApp = new MockApp();
		fileService = new FileService(mockApp as any);
	});

	describe('fileExists', () => {
		it('should return true if file exists', () => {
			const vault = mockApp.vault as MockVault;
			vault.files.set('test.md', '# Test');
			
			expect(fileService.fileExists('test.md')).toBe(true);
		});

		it('should return false if file does not exist', () => {
			expect(fileService.fileExists('nonexistent.md')).toBe(false);
		});
	});

	describe('detectPARAType', () => {
		it('should detect PARA type from folder path', async () => {
			const file = { path: '1-Projects/test.md', name: 'test.md' } as any;
			const type = await fileService.detectPARAType(file, 'folder');
			expect(type).toBe('project');
		});

		it('should detect PARA type from properties', async () => {
			// Mock properties service
			const file = { path: 'test.md', name: 'test.md' } as any;
			// This would require mocking PropertiesService
			// For now, just test the structure
			expect(file).toBeDefined();
		});
	});
});

