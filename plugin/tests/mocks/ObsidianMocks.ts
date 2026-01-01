/**
 * Mock implementations of Obsidian API for testing
 */

export class MockApp {
	workspace: any;
	vault: any;
	metadataCache: any;
	fileManager: any;
	settings: any;

	constructor() {
		this.workspace = new MockWorkspace();
		this.vault = new MockVault();
		this.metadataCache = new MockMetadataCache();
		this.fileManager = new MockFileManager();
		this.settings = {};
	}
}

export class MockWorkspace {
	activeLeaf: any;
	leaves: any[] = [];
	layoutReady: Promise<void> = Promise.resolve();

	constructor() {
		this.activeLeaf = new MockWorkspaceLeaf();
	}

	getActiveFile(): any {
		return this.activeLeaf?.view?.file || null;
	}

	getLeavesOfType(): any[] {
		return [];
	}
}

export class MockWorkspaceLeaf {
	view: any;

	constructor() {
		this.view = {
			file: null,
		};
	}
}

export class MockVault {
	files: Map<string, string> = new Map();
	adapter: any;

	constructor() {
		this.adapter = new MockVaultAdapter();
	}

	async read(file: any): Promise<string> {
		const path = typeof file === 'string' ? file : file.path;
		return this.files.get(path) || '';
	}

	async write(file: any, data: string): Promise<void> {
		const path = typeof file === 'string' ? file : file.path;
		this.files.set(path, data);
	}

	async create(path: string, data: string): Promise<any> {
		this.files.set(path, data);
		return { path, name: path.split('/').pop() || path };
	}

	async delete(file: any): Promise<void> {
		const path = typeof file === 'string' ? file : file.path;
		this.files.delete(path);
	}

	async rename(file: any, newPath: string): Promise<void> {
		const path = typeof file === 'string' ? file : file.path;
		const data = this.files.get(path);
		if (data) {
			this.files.delete(path);
			this.files.set(newPath, data);
		}
	}

	getAbstractFileByPath(path: string): any {
		if (this.files.has(path)) {
			return {
				path,
				name: path.split('/').pop() || path,
				stat: {
					size: this.files.get(path)?.length || 0,
					mtime: Date.now(),
					ctime: Date.now(),
				},
			};
		}
		return null;
	}

	getMarkdownFiles(): any[] {
		return Array.from(this.files.keys())
			.filter(path => path.endsWith('.md'))
			.map(path => this.getAbstractFileByPath(path))
			.filter(Boolean);
	}
}

export class MockVaultAdapter {
	exists(path: string): Promise<boolean> {
		return Promise.resolve(true);
	}

	stat(path: string): Promise<any> {
		return Promise.resolve({
			type: 'file',
			size: 0,
			mtime: Date.now(),
			ctime: Date.now(),
		});
	}

	list(path: string): Promise<any[]> {
		return Promise.resolve([]);
	}

	mkdir(path: string): Promise<void> {
		return Promise.resolve();
	}

	rm(path: string, recursive: boolean): Promise<void> {
		return Promise.resolve();
	}

	read(path: string): Promise<string> {
		return Promise.resolve('');
	}

	write(path: string, data: string): Promise<void> {
		return Promise.resolve();
	}
}

export class MockMetadataCache {
	cache: Map<string, any> = new Map();

	getFileCache(file: any): any {
		const path = typeof file === 'string' ? file : file.path;
		return this.cache.get(path) || null;
	}

	getFirstLinkpathDest(linkpath: string, sourcePath: string): any {
		return null;
	}
}

export class MockFileManager {
	async renameFile(file: any, newPath: string): Promise<void> {
		// Mock implementation
	}
}

export class MockPlugin {
	app: MockApp;
	manifest: any;
	settings: any;

	constructor(app: MockApp) {
		this.app = app;
		this.manifest = {
			id: 'para-agent',
			name: 'PARA Method Obsidian Agent',
			version: '0.1.0',
		};
		this.settings = {};
	}

	async loadSettings(): Promise<void> {
		// Mock implementation
	}

	async saveSettings(): Promise<void> {
		// Mock implementation
	}
}

export class MockSettingTab {
	plugin: any;

	constructor(plugin: any) {
		this.plugin = plugin;
	}
}

