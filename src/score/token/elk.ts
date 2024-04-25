import { getRowColMapIndex, idToRowColumn } from "../../utils";
import { directions, linkedTileSides } from "../const";
import { allPlacedTokens } from "../tile";
import { searchNeighbourTilesForWildlife } from "./util";

const ElkScoringValue: Record<number, number> = {
        0: 0,
        1: 2,
        3: 9,
        4: 13,
};

export class ElkScoring {
        protected score = 0;
        protected allElkTokens: string[] = [];
        protected usedElkTokenIDs: string[] = [];
        protected potentialElkLines: string[][] = [];
        protected confirmedElkLines: any[][] = [];
        protected potentialElkLineStartingTokens: { E: any[]; SE: any[]; SW: any[] } = {
                E: [],
                SE: [],
                SW: [],
        };
        protected allLineDetails: any = {};
        protected sharedElkTokenIDs: any = {};
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

                this.allElkTokens.forEach((elkToken) => {
                        const validStartingLineDirection = this.checkVaildStartingElkToken(elkToken);
                        if (validStartingLineDirection && validStartingLineDirection.length > 0) {
                                for (let j = 0; j < validStartingLineDirection.length; j++) {
                                        this.potentialElkLineStartingTokens[validStartingLineDirection[j]].push(
                                                elkToken,
                                        );
                                }
                        }
                });

                Object.entries(this.potentialElkLineStartingTokens).forEach(([direction, value]) => {
                        value.forEach((token) => {
                                const currentPotentialElkLine = this.allElkTokensInLine(token, direction);
                                this.potentialElkLines.push(currentPotentialElkLine);
                        });
                });

                this.potentialElkLines.sort((a, b) => b.length - a.length);

                const checkedIndexCombos = [];
                const allSharedElkTokenLineNums = [];

                for (let i = this.potentialElkLines.length - 1; i >= 0; i--) {}
        }

        protected nextElkTokenInDirection(tileID: string, direction: string) {
                const [row, column] = idToRowColumn(tileID);
                const rowColMapIndex = getRowColMapIndex(row);
                const directionIndex = directions.indexOf(direction);
                const newRow = row + linkedTileSides[directionIndex].rowColMapping[rowColMapIndex].rowDiff;
                const newColumn = column + linkedTileSides[directionIndex].rowColMapping[rowColMapIndex].columnDiff;
                const newTileID = `${newRow}-${newColumn}`;

                if (!allPlacedTokens.hasOwnProperty(newTileID)) return false;
                if (allPlacedTokens[newTileID] != "elk") return false;
                if (this.usedElkTokenIDs.includes(newTileID)) return false;
                return newTileID;
        }

        protected allElkTokensInLine(tileID: string, direction: string) {
                const matchedLineIDs = [tileID];
                let lastTokenID = tileID;
                let elkLineLimit = 0;
                while (true) {
                        const nextTokenID = this.nextElkTokenInDirection(lastTokenID, direction);
                        if (nextTokenID) {
                                matchedLineIDs.push(nextTokenID);
                                elkLineLimit++;
                                lastTokenID = nextTokenID;
                        } else {
                                return matchedLineIDs;
                        }
                }
        }

        protected checkVaildStartingElkToken(tileID: string): false | ("E" | "SE" | "SW")[] {
                const blankSides = [0, 4, 5];
                const lineCheckSides = [3, 1, 2];

                const validElkLineDirections: string[] = [];

                const [row, column] = idToRowColumn(tileID);
                const rowColMapIndex = getRowColMapIndex(row);

                [
                        [0, 3],
                        [4, 1],
                        [5, 2],
                ].forEach(([blank, lineCheckSide]) => {
                        const oppositeDirection = linkedTileSides[lineCheckSide].direction;

                        const precedingRow = row + linkedTileSides[blank].rowColMapping[rowColMapIndex].rowDiff;
                        const precedingColumn =
                                column + linkedTileSides[blank].rowColMapping[rowColMapIndex].columnDiff;
                        const precedingTileID = precedingRow + precedingColumn;

                        const followingRow = row + linkedTileSides[lineCheckSide].rowColMapping[rowColMapIndex].rowDiff;
                        const followingColumn =
                                column + linkedTileSides[lineCheckSide].rowColMapping[rowColMapIndex].columnDiff;
                        const followingTileID = followingRow + followingColumn;

                        let validPrecedingTile = false;
                        let validFollowingTile = false;

                        if (allPlacedTokens.hasOwnProperty(precedingTileID)) {
                                if (allPlacedTokens[precedingTileID] != "elk") {
                                        validPrecedingTile = true;
                                }
                        } else {
                                validPrecedingTile = true;
                        }

                        if (allPlacedTokens.hasOwnProperty(followingTileID)) {
                                if (allPlacedTokens[followingTileID] == "elk") {
                                        validFollowingTile = true;
                                }
                        }

                        if (validFollowingTile && validPrecedingTile) {
                                validElkLineDirections.push(oppositeDirection);
                        }
                });

                return validElkLineDirections.length == 0 ? false : (validElkLineDirections as ("E" | "SE" | "SW")[]);
        }

        protected processStanaloneElkLine(elkLine: string[]) {
                if (elkLine.length <= 4) {
                        this.confirmedElkLines.push(elkLine);
                        this.usedElkTokenIDs.push(...elkLine);
                } else {
                        for (let i = 0; i < elkLine.length; i += 4) {
                                const tempArray = elkLine.slice(i, i + 4);
                                this.confirmedElkLines.push(tempArray);
                                this.usedElkTokenIDs.push(...tempArray);
                        }
                }
        }
}
