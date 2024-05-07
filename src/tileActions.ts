import { Color3, PhysicsViewer, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import {
	AdvancedDynamicTexture,
	Button,
	Checkbox,
	Container,
	Control,
	SelectionPanel,
	Slider,
	StackPanel,
	TextBlock,
	GUI3DManager,
	HolographicButton,
	PlanePanel,
} from '@babylonjs/gui';
import { TileInfo } from './interfaces';

export class TileActions {
	advancedTexture: AdvancedDynamicTexture;
	button1: Button;
	constructor(private scene: Scene, private srcTile: TileInfo, private destTile: string) {
		this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);
		this.advancedTexture.layer!.layerMask = 0x10000000;

		this.button1 = Button.CreateSimpleButton('but1', 'Click');
		this.button1.width = '150px';
		this.button1.height = '40px';
		this.button1.color = 'white';
		this.button1.top = '-300px';
		this.button1.cornerRadius = 20;
		this.button1.background = 'green';
		this.button1.onPointerUpObservable.add(() => {
			alert('Click');
		}, 0x10000000);

		this.advancedTexture.addControl(this.button1);
	}

	// public panel?: StackPanel;
	// public viewer: PhysicsViewer | null | undefined;
	// public main: AdvancedDynamicTexture;
	// public selectBox?: SelectionPanel;

	// constructor(private scene: Scene) {
	// 	this.main = AdvancedDynamicTexture.CreateFullscreenUI('UI');
	// 	this.panel = this.createPanel();
	// }

	// private createPanel() {
	// 	const panel = new StackPanel();
	// 	panel.spacing = 5;
	// 	panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
	// 	panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
	// 	panel.paddingLeftInPixels = 10;
	// 	panel.paddingTopInPixels = 10;
	// 	panel.width = '30%';
	// 	panel.color = 'white';
	// 	this.main.addControl(panel);
	// 	this.addButton(panel, 'cancle', 'canle', () => {
	// 		console.log('CANCLE');
	// 	});

	// 	return panel;
	// }

	// public addButton(target: Container | AdvancedDynamicTexture, name: string, title: string, fn: any) {
	// 	const addBtn = Button.CreateSimpleButton(name, title);
	// 	addBtn.width = '100%';
	// 	addBtn.height = '40px';
	// 	addBtn.background = 'green';
	// 	addBtn.color = 'white';
	// 	addBtn.onPointerUpObservable.add(fn);
	// 	target.addControl(addBtn);
	// }
}
