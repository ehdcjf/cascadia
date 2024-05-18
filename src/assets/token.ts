import { AbstractMesh, TransformNode } from '@babylonjs/core';
import { Assets } from '.';

export class TokenMesh {
	private _token: AbstractMesh;
	constructor(anchor: TransformNode) {
		this._token = Assets.g;
	}
}
