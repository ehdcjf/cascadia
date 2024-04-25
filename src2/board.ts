import { mapLimits } from "./const";
import { startingTiles } from "./data";
import type { MapDataItem, WildLife } from "./interfaces";

export class Board {
        private _mapData: MapDataItem[][] = [];

        get mapdata() {
                return this._mapData;
        }

        private setMapData(row: number, column: number, data: Partial<MapDataItem>) {
                this._mapData[row][column] = { ...this._mapData[row][column], ...data };
        }

        private mapRowsColumnsIndexes: { rows: Record<number, number>; columns: Record<number, number> } = {
                rows: {},
                columns: {},
        };

        constructor() {
                this.initiateMap();
        }

        protected initiateMap() {
                const numRows = mapLimits.down - mapLimits.up + 1;
                const numColumns = mapLimits.right - mapLimits.left + 1;
                let j = mapLimits.up;
                for (let i = 0; i < numRows; i++) {
                        this.mapRowsColumnsIndexes.rows[j] = i;
                        this._mapData[i] = [];
                        let l = mapLimits.left;
                        for (let k = 0; k < numColumns; k++) {
                                this.mapRowsColumnsIndexes.columns[l] = k;
                                this.setMapData(i, k, {
                                        row: j,
                                        column: l,
                                        placedTile: false,
                                        habitats: [],
                                        wildlife: [],
                                        placedToken: false,
                                        rotation: 0,
                                });
                                l++;
                        }
                        j++;
                }
        }

        protected loadStartingTileDetails() {
                const randomStartingTileID = Math.floor(Math.random() * 5);
                const startingTile = startingTiles[randomStartingTileID];
                [
                        [20, 20],
                        [21, 19],
                        [21, 20],
                ].forEach(([row, column], i: number) => {
                        const thisStartingTile = startingTile[i];
                        const mapRowIndex = this.mapRowsColumnsIndexes["rows"][row];
                        const mapColumnIndex = this.mapRowsColumnsIndexes["columns"][column];
                        this.setMapData(mapRowIndex, mapColumnIndex, {
                                placedTile: true,
                                habitats: thisStartingTile.habitats,
                                wildlife: thisStartingTile.wildlife,
                                rotation: thisStartingTile.rotation,
                        });
                });
        }
}
