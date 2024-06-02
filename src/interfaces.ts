import { Observable, TransformNode } from '@babylonjs/core';
import { Assets } from './assets';

export type WildLife = 'bear' | 'elk' | 'hawk' | 'salmon' | 'fox';
export type Habitat = 'desert' | 'forest' | 'lake' | 'mountain' | 'swamp';

export type TileInfo = { tileNum: string; habitats: Habitat[]; wildlife: WildLife[]; rotation: number };
export type PocketTileInfo = Omit<TileInfo, 'tileNum'> & { index: number };
export type PocketTokenInfo = { wildlife: WildLife; index: number };
export type Tile = {
	tileNum: number;
	placedToken: null | WildLife;
	habitats: Array<Habitat>;
	wildlife: Array<WildLife>;
	habitatSides: Array<Habitat | null>;
	neighborhood: Array<string>;
	qrs: QRS;
};

export type MapData = Map<string, Tile>;
export type QRS = { q: number; r: number; s: number };

export type GroupResult = {
	score: number;
	groups: string[][];
};

export enum GAMESTATE {
	DEFAULT = 1,
	NATURE_CLEAR = 2,
	NATURE_PICK = 4,
	READY = 7,
}

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
	}

	open() {
		this.anchor.setEnabled(true);
	}

	close() {
		this.anchor.setEnabled(false);
	}
}

type TURN_START_EVENT = {
	type: 'TURN_START';
};

type TURN_END_EVENT = {
	type: 'TURN_END';
};

type INIT_EVENT = {
	type: 'INIT';
};
type READY_EVENT = {
	type: 'READY';
};

type START_EVENT = {
	type: 'START';
};

type END_EVENT = {
	type: 'END';
	data: {
		addNatureToken: boolean;
	};
};

type PICK_TILE_EVENT = {
	type: 'PICK_TILE';
	data: PocketTileInfo;
};

type PICK_TOKEN_EVENT = {
	type: 'PICK_TOKEN';
	data: PocketTokenInfo;
};

type PUT_TILE_EVENT = {
	type: 'PUT_TILE';
	data: string;
};

type PUT_TOKEN_EVENT = {
	type: 'PUT_TOKEN';
	data: {
		addNatureToken: boolean;
	};
};

type CONFIRM_TILE_EVENT = {
	type: 'CONFIRM_TILE';
};

type CANCEL_TILE_EVENT = {
	type: 'CANCEL_TILE';
};

type ROTATE_TILE_CCW_EVENT = {
	type: 'ROTATE_TILE_CCW';
};

type ROTATE_TILE_CW_EVENT = {
	type: 'ROTATE_TILE_CW';
};

type NO_PLACEMENT_EVENT = {
	type: 'NO_PLACEMENT';
};
type THROW_TOKEN_EVENT = {
	type: 'THROW_TOKEN';
};

type DUPLICATE_THREE_EVENT = {
	type: 'DUPLICATE_THREE';
	data: WildLife;
};

type CAN_REFILL_EVENT = {
	type: 'CAN_REFILL';
	data: WildLife;
};

type REPLACE_EVENT = {
	type: 'REPLACE';
};

type DUPLICATE_ALL_EVENT = {
	type: 'DUPLICATE_ALL';
	data: WildLife;
};

type UNDO_EVENT = {
	type: 'UNDO';
};

type CALCULATE_EVENT = {
	type: 'CALCULATE';
};

type USE_NATURE_EVENT = {
	type: 'USE_NATURE';
};

type REFILL_EVENT = {
	type: 'REFILL';
};

type MODAL_OPEN_EVENT = {
	type: 'MODAL_OPEN';
};

type MODAL_CLOSE_EVENT = {
	type: 'MODAL_CLOSE';
};

type TILE_ACTION_EVENT = {
	type: 'TILE_ACTION';
	data: string;
};

export const MODAL_TAG = {
	DUPLICATE_THREE: 'DUPLICATE_THREE',
	DUPLICATE_ALL: 'DUPLICATE_ALL',
	NO_PLACEMENT: 'NO_PLACEMENT',
	NO_PLACEMENT_NATURE: 'NO_PLACEMENT_NATURE',
	PICK_TOKEN: 'PICK_TOKEN',
	PICK_TILE: 'PICK_TILE',
	CLEAR_TOKEN: 'CLEAR_TOKEN',
	USE_NATURE: 'USE_NATURE',
	BEAR_A: 'BEAR_A',
};

export type MODAL_TAG = keyof typeof MODAL_TAG;

export type MediatorEvent =
	| INIT_EVENT
	| READY_EVENT
	| START_EVENT
	| END_EVENT
	| PICK_TILE_EVENT
	| PUT_TILE_EVENT
	| PUT_TOKEN_EVENT
	| PICK_TOKEN_EVENT
	| CONFIRM_TILE_EVENT
	| CANCEL_TILE_EVENT
	| ROTATE_TILE_CCW_EVENT
	| ROTATE_TILE_CW_EVENT
	| NO_PLACEMENT_EVENT
	| THROW_TOKEN_EVENT
	| DUPLICATE_THREE_EVENT
	| DUPLICATE_ALL_EVENT
	| UNDO_EVENT
	| USE_NATURE_EVENT
	| REPLACE_EVENT
	| REFILL_EVENT
	| MODAL_OPEN_EVENT
	| MODAL_CLOSE_EVENT
	| CALCULATE_EVENT
	| CAN_REFILL_EVENT
	| TURN_END_EVENT
	| TURN_START_EVENT
	| TILE_ACTION_EVENT;

export type Mediator = Observable<MediatorEvent>;
