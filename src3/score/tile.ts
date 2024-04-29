import { MapItem } from "../board";
const rotationIndexes = {
        positive: [0, 60, 120, 180, 240, 300],
        negative: [0, -300, -240, -180, -120, -60],
};
const indexMatch = [
        [0, 3],
        [1, 4],
        [2, 5],
        [3, 0],
        [4, 1],
        [5, 2],
];

export class TileScoring {
        habitatsMaches: Record<
                string,
                {
                        placedTiles: number;
                        tilesWithMachedHabitats: Set<string>;
                        finalSets: Set<string>;
                        largestSet: number;
                }
        > = {
                desert: {
                        placedTiles: 0,
                        tilesWithMachedHabitats: new Set(),
                        finalSets: new Set(),
                        largestSet: 0,
                },
                forest: {
                        placedTiles: 0,
                        tilesWithMachedHabitats: new Set(),
                        finalSets: new Set(),
                        largestSet: 0,
                },
                lake: {
                        placedTiles: 0,
                        tilesWithMachedHabitats: new Set(),
                        finalSets: new Set(),
                        largestSet: 0,
                },
                mountain: {
                        placedTiles: 0,
                        tilesWithMachedHabitats: new Set(),
                        finalSets: new Set(),
                        largestSet: 0,
                },
                swamp: {
                        placedTiles: 0,
                        tilesWithMachedHabitats: new Set(),
                        finalSets: new Set(),
                        largestSet: 0,
                },
        };
        constructor(mapData: Map<string, MapItem>) {
                for (const [key, tile] of mapData) {
                        const neighborhood = tile.coor.nighborCoor;
                        const tileId = tile.tileId;
                        for (let i = 0; i < neighborhood.length; i++) {
                                const neighborKey = neighborhood[i].key;
                                if (!mapData.has(neighborKey)) continue;
                                const neighborTileId = mapData.get(neighborKey)!.tileId;

                                const [mi1, mi2] = indexMatch[i];
                                const myHabitat = mapData.get(key)?.habitatsArray[mi1]!;
                                const neighborHabitat = mapData.get(neighborKey)?.habitatsArray[mi2]!;
                                if (myHabitat === neighborHabitat) {
                                        const connectedTile =
                                                tileId < neighborTileId
                                                        ? `${tileId}-${neighborTileId}`
                                                        : `${neighborTileId}-${tileId}`;

                                        this.habitatsMaches[myHabitat].tilesWithMachedHabitats.add(connectedTile);
                                }
                        }
                }

                console.log(this.habitatsMaches);
        }
}
