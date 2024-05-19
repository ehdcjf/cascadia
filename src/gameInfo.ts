import { PocketTileInfo, TileInfo, WildLife } from './interfaces';

export enum GameState {
	PICK_TILE,
	TILE_ACTION,
	PUT_TOKEN,
	NO_PLACEMENT,
	DUPLICATE_THREE,
	DUPLICATE_ALL,
	SUFFLE,
}

export class GameInfo {
	public state = GameState.PICK_TILE;
	public pocketTile: PocketTileInfo | null = null;
	public pocketToken: { index: number; wildlife: WildLife } | null = null;
	public targetTile: string | null = null;
	public duplicate: WildLife | null = null;
	public canUndo: boolean = false;
	public useNatureToken: boolean = false;
	public duplicateThree: boolean = false;
	public natureToken = 0;
}
