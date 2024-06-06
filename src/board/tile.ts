import { AbstractMesh, Vector3 } from '@babylonjs/core';
import { Habitat, Tile, WildLife } from '../interfaces';

type TileState = 'tile' | 'habitat';
export class BoardTile {
	private _tileInfo: any;
	private _state: TileState = 'tile';
	constructor(private _tile: AbstractMesh, private _token: AbstractMesh, position: Vector3) {
		this._tile.setEnabled(true);
	}

	get tileInfo() {
		return this._tileInfo;
	}

	get state() {
		return this._state;
	}

	set state(value: TileState) {
		this._state = value;
	}

	public blank() {}

	public drawTile(habitat: Habitat, wildlifes: WildLife[]) {}

	public drawToken(wildlife: WildLife) {}

	public rotate(value: number) {}
}
