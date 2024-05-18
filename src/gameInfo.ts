import { PocketTileInfo, TileInfo } from './interfaces';

export enum GameState {
	PICK_TILE,
	TILE_ACTION,
}

export class GameInfo {
	public state = GameState.PICK_TILE;
	public pocketTile: PocketTileInfo | null = null;
	public targetTile: string | null = null;
}
