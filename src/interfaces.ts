export type WildLife = 'bear' | 'elk' | 'hawk' | 'salmon' | 'fox';
export type Habitat = 'desert' | 'forest' | 'lake' | 'mountain' | 'swamp';
export type TileInfo = { tileNum: string; habitats: Habitat[]; wildlife: WildLife[]; rotation: number };
export type Tile = {
	tileNum: number;
	placedToken: null | WildLife;
	habaitats: Array<Habitat>;
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
