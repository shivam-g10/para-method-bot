/**
 * Reusable UI components for PARA Agent
 */

export class PARAButton {
	private element: HTMLElement;

	constructor(
		container: HTMLElement,
		text: string,
		onClick: () => void,
		className: string = 'para-agent-button'
	) {
		this.element = container.createEl('button', {
			text,
			cls: className,
		});
		this.element.onclick = onClick;
	}

	getElement(): HTMLElement {
		return this.element;
	}

	setEnabled(enabled: boolean): void {
		if (enabled) {
			this.element.removeAttribute('disabled');
		} else {
			this.element.setAttribute('disabled', 'true');
		}
	}
}

export class PARASection {
	private element: HTMLElement;
	private titleElement: HTMLElement | null = null;

	constructor(container: HTMLElement, title?: string) {
		this.element = container.createDiv('para-agent-section');
		if (title) {
			this.titleElement = this.element.createEl('div', {
				text: title,
				cls: 'para-agent-section-title',
			});
		}
	}

	getElement(): HTMLElement {
		return this.element;
	}

	setTitle(title: string): void {
		if (this.titleElement) {
			this.titleElement.textContent = title;
		} else {
			this.titleElement = this.element.createEl('div', {
				text: title,
				cls: 'para-agent-section-title',
			});
		}
	}
}

