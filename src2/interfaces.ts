export type Tile = {
        tileNum: string;
        habitats: string[];
        wildlife: string[];
        rotation: 0 | 60 | 120 | 180 | 240 | 300 | 360; // increments of 60
};

export type WildLife = "bear" | "elk" | "hawk" | "salmon" | "fox";

export type MapDataItem = {
        row: number;
        column: number;
        placedTile: boolean;
        habitats: string[];
        wildlife: WildLife[];
        placedToken: WildLife | false;
        rotation: number;
};
