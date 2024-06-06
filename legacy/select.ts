import { AbstractMesh, Tools, Vector3 } from '@babylonjs/core';

const positionX = [[], [0], [-1.5, 1.5], [-2.5, 0, 2.5]];

export class Select {
	constructor(private _buttons: AbstractMesh[]) {
		_buttons.forEach((button, i) => {
			const x = positionX[_buttons.length][i];
			button.position = new Vector3(x, -3.5, 10);
			button.scalingDeterminant = 0.2;
			button.renderingGroupId = 1;
			button.setEnabled(true);
			button.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
		});
	}

	get buttons(): AbstractMesh[] {
		return this._buttons as AbstractMesh[];
	}
}
