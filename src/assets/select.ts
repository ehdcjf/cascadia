import { AbstractMesh, ActionManager, PBRMaterial, Tools, TransformNode, Vector3 } from '@babylonjs/core';
import { Assets } from './index';

const positionX = [[], [0], [-1.5, 1.5], [-2.5, 0, 2.5]];

export class Select {
	constructor(private buttons: AbstractMesh[]) {
		buttons.forEach((button, i) => {
			const x = positionX[buttons.length][i];
			button.position = new Vector3(x, -3.5, 10);
			button.scalingDeterminant = 0.2;
			button.renderingGroupId = 1;
			button.setEnabled(true);
			button.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			button.material!.disableDepthWrite = true;
			(button.material! as PBRMaterial).unlit = true;
			button.actionManager = Assets.getActionManger();
		});
	}

	get actionMangers(): ActionManager[] {
		return this.buttons.map((button) => button.actionManager) as ActionManager[];
	}
	get meshes(): AbstractMesh[] {
		return this.buttons as AbstractMesh[];
	}
}
