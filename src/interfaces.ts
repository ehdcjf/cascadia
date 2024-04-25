import { allPlacedTokens } from "./score/tile";

export type Tile = {
        tileNum: string;
        habitats: string[];
        wildlife: string[];
        rotation: 0 | 60 | 120 | 180 | 240 | 300 | 360; // increments of 60
};

export type WildLife = "bear" | "elk" | "hawk" | "salmon" | "fox";

export abstract class Scoring {
        protected allPlacedTokens: Record<string, string | false> = allPlacedTokens;

        constructor(protected wildLife: WildLife) {}

        get score() {
                return this.calculate();
        }

        protected getTargetTokenIDs() {
                return Object.entries(this.allPlacedTokens)
                        .filter(([_, value]) => value == this.wildLife)
                        .map((v) => v[0]);
        }
        protected abstract calculate(): number;
}
