import { AbstractMesh, ActionManager, TransformNode, Vector3 } from '@babylonjs/core';
import { Assets } from '.';
import { TokenKey, WildLife } from '../interfaces';

export class TokenMesh {
	private _token: AbstractMesh;
	constructor(anchor: TransformNode, private _wildlife?: WildLife) {
		this._token = Assets.getToken(anchor);
		this._token.setEnabled(true);
		if (this._wildlife) {
			this._token.material = Assets.getTokenMat(this._wildlife);
		}
		this._token.actionManager = Assets.getActionManger();
		this._token.isPickable = true;
	}

	set material(value: 'none' | 'active' | 'inactive') {
		let mat = this._wildlife;
		if (value == 'active') mat += '-active';
		if (value == 'inactive') mat += '-inactive';
		this._token.material = Assets.getTokenMat(mat as TokenKey);
	}

	get wildlife() {
		return this._wildlife;
	}

	get position() {
		return this._token.position;
	}

	set position(vec3: Vector3) {
		this._token.position = vec3;
	}

	get actionManager(): ActionManager {
		return this._token.actionManager as ActionManager;
	}

	set scalingDeterminant(value: number) {
		this._token.scalingDeterminant = value;
	}

	set rotation(vec3: Vector3) {
		// if (Math.abs(number) >= 360) number %= 360;
		this._token.rotation = vec3;
	}

	dispose() {
		this._token.dispose();
	}
}
