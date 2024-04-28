export type Tile = {
        tileNum: string;
        habitats: Habitat[];
        wildlife: WildLife[];
        rotation: 0 | 60 | 120 | 180 | 240 | 300 | 360; // increments of 60
};

export type WildLife = "bear" | "elk" | "hawk" | "salmon" | "fox";
export type Habitat = "desert" | "forest" | "lake" | "mountain" | "swamp";

export type MapDataItem = {
        row: number;
        column: number;
        placedTile: boolean;
        habitats: Habitat[];
        wildlife: WildLife[];
        placedToken: WildLife | false;
        rotation: number;
};

export type MapData = MapDataItem[][];
