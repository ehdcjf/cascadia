export type WildLife = "bear" | "elk" | "hawk" | "salmon" | "fox";
export type Habitat = "desert" | "forest" | "lake" | "mountain" | "swamp";
export type TileInfo = { tileNum: string; habitats: Habitat[]; wildlife: WildLife[]; rotation: number };
