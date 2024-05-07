import { Scene, TransformNode, Vector3 } from '@babylonjs/core';
import {
	AdvancedDynamicTexture,
	Button,
	Button3D,
	Container,
	Control,
	GUI3DManager,
	HolographicButton,
	PlanePanel,
	Rectangle,
	StackPanel,
	StackPanel3D,
} from '@babylonjs/gui';
import { TileInfo } from './interfaces';

export class TileActions {
	main: AdvancedDynamicTexture;
	// cancelButton: Button;
	panel: StackPanel;
	private srcTile: TileInfo | null = null;
	private destTile: string | null = null;
	constructor(private scene: Scene) {
		this.main = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);
		this.main.layer!.layerMask = 0x10000000;

		this.panel = this.createPanel();
		this.panel.isVisible = false;
		this.addButton(this.panel, 'red', 'cancel-btn', 'cancel', () => {
			alert('cancel');
		});
		this.addButton(this.panel, 'green', 'confirm-btn', 'confirm', () => {
			alert('cancel');
		});
		this.addButton(this.panel, 'blue', 'ccw-btn', 'rotate CCW', () => {
			alert('cancel');
		});
		this.addButton(this.panel, 'magenta', 'cw-btn', 'rotate CW', () => {
			alert('cancel');
		});
	}

	private createPanel() {
		const panel = new StackPanel();
		panel.spacing = 20;
		panel.isVertical = false;
		panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

		panel.paddingBottomInPixels = 10;
		panel.height = '50px';
		panel.color = 'white';
		this.main.addControl(panel);
		return panel;
	}

	private addButton(
		target: Container | AdvancedDynamicTexture,
		background: string,
		name: string,
		title: string,
		fn: any
	) {
		const addBtn = Button.CreateSimpleButton(name, title);
		addBtn.width = '100px';
		addBtn.height = '50px';
		addBtn.background = background;
		addBtn.color = 'white';
		addBtn.onPointerUpObservable.add(fn);
		target.addControl(addBtn);
	}

	set src(srcTile: TileInfo) {
		this.srcTile = srcTile;
	}

	set dest(destTile: string) {
		this.destTile = destTile;
	}
}
