import { PocketTileInfo, TileInfo } from './interfaces';

export enum GameState {
	PICK_TILE,
}

export class GameInfo {
	public state = GameState.PICK_TILE;
	public pocketTile: PocketTileInfo | null = null;
}
