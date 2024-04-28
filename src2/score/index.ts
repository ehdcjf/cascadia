import { rotationIndexes } from "../const";
import { WildLife } from "../interfaces";

export class Scoring {
        private allPlacedTiles: Record<
                string,
                {
                        tileNum: number;
                        row: number;
                        column: number;
                        habitats: string[];
                        habitatsSides: string[];
                }
        > = {};

        private allPlacedTokens: Record<string, WildLife> = {};

        constructor() {}

        private findRotationIndex(rotation: number) {
                if (rotation >= 360) rotation % 360;
                else if (rotation <= -360) rotation % -360;
                if (rotation == 0) return 0;
                const sign = Math.sign(rotation) != -1 ? "positive" : "negative";
                return rotationIndexes[sign].indexOf(rotation);
        }

        processPlacedTileAndTokens() {}
}
