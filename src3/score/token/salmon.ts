import { MapItem } from "../../board";
import { Queue } from "../../utils";
const SalmonScoringValue: Record<number, number> = {
        1: 2,
        2: 4,
        3: 7,
        4: 11,
        5: 15,
        6: 20,
        7: 26,
};

export class SalmonScoring {
        //  이미 사용했거나 조건 충족하지 않은 연어 목록
        private usedToken: Set<string> = new Set();
        private confirmedSalmonRuns: Array<Set<string>> = [];
        private validSalmonTokens: Array<string> = [];
        private totalScore = 0;
        constructor(private mapData: Map<string, MapItem>) {
                this.getValidSalmonTokens();
        }

        private getValidSalmonTokens() {
                for (const [key, mapItem] of this.mapData) {
                        if (mapItem.placedToken != "salmon") continue;

                        const neighborSalmons = this.searchNeighborSalmon(key);

                        if (neighborSalmons.length <= 2) {
                                this.validSalmonTokens.push(key);
                        } else {
                                this.usedToken.add(key);
                        }
                }
        }

        private searchNeighborSalmon(tokenKey: string) {
                const neighborSalmons: string[] = [];

                const mapItem = this.mapData.get(tokenKey)!;
                const neighborTileKeys = mapItem.coor.neighborKeys;
                for (const neighborTileKey of neighborTileKeys) {
                        if (!this.mapData.has(neighborTileKey)) continue;
                        const neighborTile = this.mapData.get(neighborTileKey)!;
                        if (neighborTile.placedToken === "salmon") neighborSalmons.push(neighborTileKey);
                }
                return neighborSalmons;
        }

        private calculateSalmonToken() {
                for (const mainSalmonKey of this.validSalmonTokens) {
                        const potentialSalmonTokenIDs: Set<string> = new Set();
                        if (this.usedToken.has(mainSalmonKey)) continue;

                        const confirmedNeighborSalmons = this.searchNeighborSalmon(mainSalmonKey).filter(
                                (neighbor) => !this.usedToken.has(neighbor),
                        );

                        if (confirmedNeighborSalmons.length == 2) {
                                const [firstNeighborKey, secondNeighborKey] = confirmedNeighborSalmons;

                                const firstNeighborhood = this.mapData.get(firstNeighborKey)!.coor.neighborKeys;
                                const secondNeighborhood = this.mapData.get(secondNeighborKey)!.coor.neighborKeys;

                                if (
                                        !firstNeighborhood.includes(secondNeighborKey) &&
                                        !secondNeighborhood.includes(firstNeighborKey)
                                ) {
                                        const forwardsAndBackwardsSalmonRunIDs = this.forwardsAndBackwardsSalmonRun();
                                } else {
                                        [mainSalmonKey, firstNeighborKey, secondNeighborKey].forEach((tokenKey) => {
                                                potentialSalmonTokenIDs.add(tokenKey);
                                                this.usedToken.add(tokenKey);
                                        });
                                }
                        } else if (confirmedNeighborSalmons.length < 2) {
                                potentialSalmonTokenIDs.add(mainSalmonKey);
                                const salmonRunTokenIDs = this.salmonTokensInRun(mainSalmonKey);
                                salmonRunTokenIDs.forEach((key) => {
                                        potentialSalmonTokenIDs.add(key);
                                });
                        }
                        this.confirmedSalmonRuns.push(potentialSalmonTokenIDs);
                }

                this.confirmedSalmonRuns.forEach((salmonIDs) => {
                        const salomInRunNums = salmonIDs.size > 7 ? 7 : salmonIDs.size;
                        this.totalScore += SalmonScoringValue[salomInRunNums];
                });
        }

        private salmonTokensInRun(startKey: string) {
                const salmonRunIDs = [];
                let nextTokenKey = startKey;

                salmonRunIDs.push(startKey);
                this.usedToken.add(startKey);

                let salmonRunEnded = false;

                while (!salmonRunEnded) {
                        const neighborSalmons = this.searchNeighborSalmon(nextTokenKey).filter(
                                (neighbor) => !this.usedToken.has(neighbor),
                        );

                        if (neighborSalmons.length == 1) {
                                const nextSalmon = neighborSalmons[0];
                                salmonRunIDs.push(nextSalmon);
                                this.usedToken.add(nextSalmon);
                                nextTokenKey = nextSalmon;
                        } else {
                                salmonRunEnded = true;
                        }
                }
                return salmonRunIDs;
        }

        private forwardsAndBackwardsSalmonRun() {
                return [];
        }

        get score() {
                return this.totalScore;
        }
}
