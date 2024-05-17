export type WildLife = 'bear' | 'elk' | 'hawk' | 'salmon' | 'fox';
export type Habitat = 'desert' | 'forest' | 'lake' | 'mountain' | 'swamp';

export type TileInfo = { tileNum: string; habitats: Habitat[]; wildlife: WildLife[]; rotation: number };
export type PocketTileInfo = Omit<TileInfo,'tileNum'> & {index:number}
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
