import { AbstractMesh } from '@babylonjs/core';
import { TileInfo, TileKey, WildLife } from '../interfaces';

export enum SceneState {
	PICK_TILE,
	TILE_ACTION,
	PUT_TOKEN,
}

export class ScenMatadata {
	public state: SceneState = SceneState.PICK_TILE;
	public tile: TileInfo | null = null;
	public token: WildLife | null = null;
	public targetTile: AbstractMesh | null = null;
	public rotation = 0;
	constructor() {}
}
