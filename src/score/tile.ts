import { mapData } from "../setup";
import { linkedTileSides } from "./const";

export const allPlacedTiles: Record<
        string,
        {
                tileNum: number;
                row: number;
                column: number;
                habitats: string[];
                habitatsSides: string[];
        }
> = {};
export const allPlacedTokens: Record<string, string | false> = {};
const habitatsMaches: Record<
        string,
        { placedTiles: number; tilesWithMachedHabitats: any[]; finalSets: any[]; largestSet: number }
> = {
        desert: {
                placedTiles: 0,
                tilesWithMachedHabitats: [],
                finalSets: [],
                largestSet: 0,
        },
        forest: {
                placedTiles: 0,
                tilesWithMachedHabitats: [],
                finalSets: [],
                largestSet: 0,
        },
        lake: {
                placedTiles: 0,
                tilesWithMachedHabitats: [],
                finalSets: [],
                largestSet: 0,
        },
        mountain: {
                placedTiles: 0,
                tilesWithMachedHabitats: [],
                finalSets: [],
                largestSet: 0,
        },
        swamp: {
                placedTiles: 0,
                tilesWithMachedHabitats: [],
                finalSets: [],
                largestSet: 0,
        },
};

const rotationIndexes = {
        positive: [0, 60, 120, 180, 240, 300],
        negative: [0, -300, -240, -180, -120, -60],
};

function processRotationFigure(rotation: number) {
        if (rotation >= 360) return rotation % 360;
        else if (rotation <= -360) return rotation % -360;
        else return rotation;
}

function findRotationIndex(rotation: number) {
        if (rotation == 0) return 0;
        const sign = Math.sign(rotation) != -1 ? "positive" : "negative";
        return rotationIndexes[sign].indexOf(rotation);
}

export function processPlacedTileAndTokens() {
        let tileNum = 1;

        for (let i = 0; i < mapData.length; i++) {
                for (let j = 0; j < mapData[i].length; j++) {
                        if (!mapData[i][j].placedTile) continue;

                        const { row, column } = mapData[i][j];
                        const rotation = processRotationFigure(+mapData[i][j].rotation);
                        const numTurns = findRotationIndex(rotation);
                        const habitats: string[] = [];
                        const habitatsSides = new Array(6);
                        if (mapData[i][j].habitats.length == 1) {
                                const thisHabitat = mapData[i][j].habitats[0];
                                habitatsSides.fill(thisHabitat);
                                habitatsMaches[thisHabitat].placedTiles += 1;
                                habitats.push(thisHabitat);
                        } else if (mapData[i][j].habitats.length == 2) {
                                let habitatsLoaded = 0;
                                let turnedIndex = habitatsLoaded + numTurns;
                                const [firstHabitat, secondHabitat] = mapData[i][j].habitats;
                                habitatsMaches[firstHabitat].placedTiles += 1;
                                habitatsMaches[secondHabitat].placedTiles += 1;
                                habitats.push(firstHabitat, secondHabitat);
                                let currentHabitat = firstHabitat;
                                for (let k = 0; k < 6; k++) {
                                        habitatsSides[turnedIndex] = currentHabitat;
                                        turnedIndex++;
                                        if (turnedIndex == 6) turnedIndex = 0;
                                        habitatsLoaded++;
                                        if (habitatsLoaded == 3) currentHabitat = secondHabitat;
                                }
                        }

                        const key = `${row}-${column}`;
                        allPlacedTiles[key] = {
                                tileNum: tileNum,
                                row: row,
                                column: column,
                                habitats: habitats,
                                habitatsSides: habitatsSides,
                        };

                        if (mapData[i][j].placedToken) allPlacedTokens[key] = mapData[i][j].placedToken;
                        tileNum++;
                }
        }

        const tileIDs = Object.keys(allPlacedTiles);

        for (const tileID of tileIDs) {
                const row = allPlacedTiles[tileID].row;
                const column = allPlacedTiles[tileID].column;
                const rowColMapSet = row % 2 == 0 ? 0 : 1;

                for (let i = 0; i < linkedTileSides.length; i++) {
                        const newRow = row + linkedTileSides[i].rowColMapping[rowColMapSet].rowDiff;
                        const newColumn = column + linkedTileSides[i].rowColMapping[rowColMapSet].columnDiff;
                        const newTileID = `${newRow}-${newColumn}`;
                        if (allPlacedTiles.hasOwnProperty(newTileID)) {
                                const [m1, m2] = linkedTileSides[i].indexMatch.split("-").map(Number);
                                if (
                                        allPlacedTiles[tileID].habitatsSides[m1] ==
                                        allPlacedTiles[newTileID].habitatsSides[m2]
                                ) {
                                        const tileNum = allPlacedTiles[tileID].tileNum;
                                        const matchedTileNum = allPlacedTiles[newTileID].tileNum;
                                        const key = `${tileNum}-${matchedTileNum}`;
                                        habitatsMaches[
                                                allPlacedTiles[tileID].habitatsSides[m1]
                                        ].tilesWithMachedHabitats.push(key);
                                }
                        }
                }
        }

        for (const habitat of Object.keys(habitatsMaches)) {
                const currentHabitat = habitatsMaches[habitat];
                if (currentHabitat.placedTiles == 0) continue;
                if (currentHabitat.tilesWithMachedHabitats.length == 0) {
                        currentHabitat.largestSet = 1;
                        continue;
                }

                const linkedTiles: any[] = JSON.parse(JSON.stringify(currentHabitat.tilesWithMachedHabitats));

                while (linkedTiles.length > 0) {
                        const tileQueue: any[] = [];
                        const tileGroup: any[] = [];

                        const firstTiles = linkedTiles.pop();
                        const [tile1, tile2] = firstTiles.split("-");
                        const reverseTileMatch = `${tile2}-${tile1}`;
                        const reverseTileIndex = linkedTiles.indexOf(reverseTileMatch);

                        if (reverseTileIndex > -1) linkedTiles.splice(reverseTileIndex, 1);

                        tileQueue.push(tile1, tile2);

                        while (tileQueue.length > 0) {
                                for (let k = linkedTiles.length - 1; k >= 0; k--) {
                                        const tileToCheckString = linkedTiles[k].toString();
                                        const tileToCheckSplit = tileToCheckString.split("-");
                                        if (tileQueue[0] != tileToCheckSplit[0]) continue;
                                        const matched = linkedTiles.splice(k, 1);
                                        const mathedString = matched.toString();
                                        const mtile = mathedString.split("-")[1];
                                        if (tileQueue.indexOf(mtile) === -1 && tileGroup.indexOf(mtile) === -1) {
                                                tileQueue.push(mtile);
                                        }
                                }
                                const lastTileChecked = tileQueue.shift();
                                tileGroup.push(lastTileChecked);
                        }

                        if (tileGroup.length > currentHabitat.largestSet) {
                                currentHabitat.largestSet = tileGroup.length;
                        }
                        currentHabitat.finalSets.push(tileGroup);
                }
        }
        calculateHabitatScoring();
}

function calculateHabitatScoring() {
        const result = Object.entries(habitatsMaches).reduce((r: any, v) => {
                const [name, info] = v;
                const bonus = info.largestSet > 6 ? 2 : 0;
                r.push([name, info.largestSet, bonus]);
                return r;
        }, []);

        console.table(result);
}
