import { allPlacedTokens } from "../tile";

const ElkScoringValue = {
        0: 0,
        1: 2,
        3: 9,
        4: 13,
};

export class ElkScoring {
        private allElkTokens: string[] = [];
        private usedElkTokenIDs = [];
        private potentialElkLines = [];
        private confirmedElkLines = [];
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
                        } else {
                        }
                }
        }

        generateAllElkLines() {}
}
