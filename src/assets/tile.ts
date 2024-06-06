import { AbstractMesh, TransformNode } from '@babylonjs/core';

export class Tile {
	private _wildlifes: AbstractMesh[] = [];
	private _tile: AbstractMesh;
	constructor(tile: AbstractMesh, edge: AbstractMesh, token: AbstractMesh, tileMat: any, tokenMat: any) {
		this._tile = tile.clone('tile', null)!;
		this._tile.setEnabled(true);
		this._anchor = 
	}

	set anchor(value: TransformNode) {
		this._tile.parent = value;
	}
}
