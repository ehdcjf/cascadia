import { ActionManager, TransformNode } from '@babylonjs/core';
import { Assets } from './assets';

export type WildLife = 'bear' | 'elk' | 'hawk' | 'salmon' | 'fox';
export type Habitat = 'desert' | 'forest' | 'lake' | 'mountain' | 'swamp';

export type TileInfo = { tileNum: string; habitats: Habitat[]; wildlife: WildLife[]; rotation: number };
export type PocketTileInfo = Omit<TileInfo, 'tileNum'> & { index: number };
export type PocketTokenInfo = { wildlife: WildLife; index: number };
// export type Tile = {
// 	tileNum: number;
// 	placedToken: null | WildLife;
// 	habaitats: Array<Habitat>;
// 	wildlife: Array<WildLife>;
// 	habitatSides: Array<Habitat | null>;
// 	neighborhood: Array<string>;
// 	qrs: QRS;
// };

export type MapData = Map<string, Tile>;
export type QRS = { q: number; r: number; s: number };

export type GroupResult = {
	score: number;
	groups: string[][];
};

export type TileKey =
	| 'desert-lake'
	| 'desert-swamp'
	| 'desert'
	| 'forest-desert'
	| 'forest-lake'
	| 'forest-swamp'
	| 'lake-mountain'
	| 'mountain-desert'
	| 'mountain-forest'
	| 'mountain-swamp'
	| 'swamp-lake'
	| 'blank'
	| 'forest'
	| 'lake'
	| 'mountain'
	| 'swamp';

export type TokenKey =
	| 'bear'
	| 'elk'
	| 'fox'
	| 'hawk'
	| 'salmon'
	| 'pinecone'
	| 'bear-active'
	| 'elk-active'
	| 'fox-active'
	| 'hawk-active'
	| 'salmon-active'
	| 'bear-inactive'
	| 'elk-inactive'
	| 'fox-inactive'
	| 'hawk-inactive'
	| 'salmon-inactive';

export type ActionKey = 'cancel' | 'confirm' | 'rotate-cw' | 'rotate-ccw';

// export type PointerMask = {

// 	x: ActionManager.OnPointerOutTrigger

// }

export abstract class BaseModal {
	protected anchor!: TransformNode;

	constructor(parent: TransformNode) {
		this.anchor = Assets.getTransformNode('modal-anchor');
		this.anchor.parent = parent;
		this.hide();
	}
	show() {
		this.anchor.setEnabled(true);
	}

	hide() {
		this.anchor.setEnabled(false);
	}
}

export enum MediatorEventType {
	SELECT_TILE,
	SELECT_TOKEN,
	PUT_TILE,
	PUT_TOKEN,
	CANCEL_TILE,
	CONFIRM_TILE,
	ROTATE_TILE_CW,
	ROTATE_TILE_CCW,
}

type SELECT_TILE_EVENT = {
	type: MediatorEventType.SELECT_TILE;
	data: PocketTileInfo;
};

type SELECT_TOKEN_EVENT = {
	type: MediatorEventType.SELECT_TOKEN;
	data: PocketTokenInfo;
};

type PUT_TILE_EVENT = {
	type: MediatorEventType.PUT_TILE;
	data: string;
};

type PUT_TOKEN_EVENT = {
	type: MediatorEventType.PUT_TOKEN;
	data: string;
};

type CONFIRM_TILE_EVENT = {
	type: MediatorEventType.CONFIRM_TILE;
};

type CANCEL_TILE_EVENT = {
	type: MediatorEventType.CANCEL_TILE;
};

type ROTATE_TILE_CCW_EVENT = {
	type: MediatorEventType.ROTATE_TILE_CCW;
};

type ROTATE_TILE_CW_EVENT = {
	type: MediatorEventType.ROTATE_TILE_CW;
};

export type MediatorEvent =
	| SELECT_TILE_EVENT
	| SELECT_TOKEN_EVENT
	| PUT_TILE_EVENT
	| PUT_TOKEN_EVENT
	| CONFIRM_TILE_EVENT
	| CANCEL_TILE_EVENT
	| ROTATE_TILE_CCW_EVENT
	| ROTATE_TILE_CW_EVENT;
