import { allPlacedTokens } from "../tile";
import { searchNeighbourTilesForWildlife } from "./util";

const ElkScoringValue: Record<number, number> = {
        0: 0,
        1: 2,
        3: 9,
        4: 13,
};

export class ElkScoring {
        private score = 0;
        private allElkTokens: string[] = [];
        private usedElkTokenIDs: string[] = [];
        private potentialElkLines: string[] = [];
        private confirmedElkLines: any[][] = [];
        private potentialElkLineStartingTokens = {
                E: [],
                SE: [],
                SW: [],
        };
        constructor() {}

        calculateElkTokenScoring() {
                for (const tokenID of Object.keys(allPlacedTokens)) {
                        if (allPlacedTokens[tokenID] == "elk") {
                                this.allElkTokens.push(tokenID);
                        }
                }

                if (this.allElkTokens.length != 0) {
                        if (this.allElkTokens.length == 1) {
                                this.usedElkTokenIDs.push(this.allElkTokens[0]);
                                this.confirmedElkLines.push(this.allElkTokens);
                        } else {
                                this.generateAllElkLines();
                        }
                }

                if (this.confirmedElkLines.length > 0) {
                        this.confirmedElkLines.sort((a, b) => b.length - a.length);
                        for (let i = 0; i < this.confirmedElkLines.length; i++) {
                                const elkInLineNum = this.confirmedElkLines[i].length;
                                this.score += ElkScoringValue[elkInLineNum];
                        }
                }
                return this.score;
        }

        generateAllElkLines() {
                const sharedElkTokenIDs = {};
                const allLineDetails = {};
                for (let i = this.allElkTokens.length - 1; i >= 0; i--) {
                        const neighbouringElk = searchNeighbourTilesForWildlife(this.allElkTokens[i], "elk");
                        if (neighbouringElk.length == 0) {
                                this.confirmedElkLines.push([this.allElkTokens[i]]);
                                this.usedElkTokenIDs.push(this.allElkTokens[i]);
                                this.allElkTokens.splice(i, 1);
                        }
                }

                for (let i = 0; i < this.allElkTokens.length; i++) {}
        }
}
