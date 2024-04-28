<<<<<<< HEAD
import { Tile, WildLife } from "./interfaces";
import { startingTiles, tiles } from "./data";
import { processPlacedTileAndTokens } from "./score/tile";
export const allTiles: Tile[] = [];
export const allTokens: string[] = [];

const mapLimits = {
        up: 10,
        down: 30,
        left: 10,
        right: 30,
};
const tokenNums: Record<WildLife, number> = {
        bear: 20,
        salmon: 20,
        hawk: 20,
        elk: 20,
        fox: 20,
};

const mapRowsColumnsIndexes = {
        rows: {},
        columns: {},
};

export const mapData: {
        row: number;
        column: number;
        placedTile: boolean;
        habitats: string[];
        wildlife: string[];
        placedToken: string | false;
        rotation: number;
}[][] = [];

/**
 *
 * tile random
 * @param amount
 */
function setupTiles(amount: number) {
        const suffled = this.suffle(tiles);
        allTiles.push(suffled);
}

/**
 * token random
 */
function setupTokens() {
        const tokens: WildLife[] = [];
        for (const tokenName in tokenNums) {
                for (let i = 0; i < tokenNums[tokenName]; i++) {
                        tokens.push(tokenName as WildLife);
                }
        }
        const suffled = this.suffle(tokens);
        allTokens.push(suffled);
}

//fisherYates
// suffle array
function suffle<T>(originArray: Array<T>): Array<T> {
        const array = originArray.slice(0);

        for (let i = array.length - 1; i > 0; i--) {
                const randomIndex = Math.floor(Math.random() * (i + 1));
                [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
        }

        return array;
}

function initiateMap() {
        const numRows = mapLimits.down - mapLimits.up + 1;
        const numColumns = mapLimits.right - mapLimits.left + 1;
        let j = mapLimits.up;
        for (let i = 0; i < numRows; i++) {
                mapRowsColumnsIndexes.rows[j] = i;
                mapData[i] = [];
                let l = mapLimits.left;
                for (let k = 0; k < numColumns; k++) {
                        mapRowsColumnsIndexes.columns[l] = k;
                        mapData[i][k] = {
                                row: j,
                                column: l,
                                placedTile: false,
                                habitats: [],
                                wildlife: [],
                                placedToken: false,
                                rotation: 0,
                        };
                        l++;
                }
                j++;
        }
        loadStartingTileDetails();
        generateMap();
}

initiateMap();
processPlacedTileAndTokens();

function loadStartingTileDetails() {
        const randomStartingTileId = Math.floor(Math.random() * 5);
        const startingTile = startingTiles[randomStartingTileId];
        [
                [20, 20],
                [21, 19],
                [21, 20],
        ].forEach(([row, column], i: number) => {
                const mapRowIndex = mapRowsColumnsIndexes["rows"][row];
                const mapColumnIndex = mapRowsColumnsIndexes["columns"][column];
                mapData[mapRowIndex][mapColumnIndex].placedTile = true;
                mapData[mapRowIndex][mapColumnIndex].habitats = startingTile[i].habitats;
                mapData[mapRowIndex][mapColumnIndex].wildlife = startingTile[i].wildlife;
                mapData[mapRowIndex][mapColumnIndex].rotation = startingTile[i].rotation;
        });
}

function generateMap() {}

export function neighbourTiles(tileID: string) {
        const [row, column] = tileID.split("-").map(Number);
        const even = [
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0],
                [-1, -1],
                [1, -1],
        ];
        const odd = [
                [0, 1],
                [0, -1],
                [-1, 0],
                [1, 0],
                [1, 1],
                [-1, +1],
        ];
        const potientialPlaceMent = row % 2 == 0 ? even : odd;
        return potientialPlaceMent.map(([dr, dc]) => `${row + dr}-${column + dc}`);
}
=======
import { Tile, WildLife } from "./interfaces";
import { startingTiles, tiles } from "./data";
import { processPlacedTileAndTokens } from "./score/tile";
export const allTiles: Tile[] = [];
export const allTokens: WildLife[] = [];

const mapLimits = {
        up: 10,
        down: 30,
        left: 10,
        right: 30,
};
const tokenNums: Record<WildLife, number> = {
        bear: 20,
        salmon: 20,
        hawk: 20,
        elk: 20,
        fox: 20,
};

const mapRowsColumnsIndexes: { rows: Record<number, number>; columns: Record<number, number> } = {
        rows: {},
        columns: {},
};

export const mapData: {
        row: number;
        column: number;
        placedTile: boolean;
        habitats: string[];
        wildlife: string[];
        placedToken: WildLife | false;
        rotation: number;
}[][] = [];

/**
 *
 * tile random
 * @param amount
 */
function setupTiles(amount: number) {
        const suffled = suffle(tiles);
        allTiles.push(...suffled);
}

/**
 * token random
 */
function setupTokens() {
        const tokens: WildLife[] = [];
        for (const tokenName in tokenNums) {
                for (let i = 0; i < tokenNums[tokenName as WildLife]; i++) {
                        tokens.push(tokenName as WildLife);
                }
        }
        const suffled = suffle(tokens);
        allTokens.push(...suffled);
}

//fisherYates
// suffle array
function suffle<T>(originArray: Array<T>): Array<T> {
        const array = originArray.slice(0);

        for (let i = array.length - 1; i > 0; i--) {
                const randomIndex = Math.floor(Math.random() * (i + 1));
                [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
        }

        return array;
}

function initiateMap() {
        const numRows = mapLimits.down - mapLimits.up + 1;
        const numColumns = mapLimits.right - mapLimits.left + 1;
        let j = mapLimits.up;
        for (let i = 0; i < numRows; i++) {
                mapRowsColumnsIndexes.rows[j] = i;
                mapData[i] = [];
                let l = mapLimits.left;
                for (let k = 0; k < numColumns; k++) {
                        mapRowsColumnsIndexes.columns[l] = k;
                        mapData[i][k] = {
                                row: j,
                                column: l,
                                placedTile: false,
                                habitats: [],
                                wildlife: [],
                                placedToken: false,
                                rotation: 0,
                        };
                        l++;
                }
                j++;
        }
        loadStartingTileDetails();
        generateMap();
}

initiateMap();
processPlacedTileAndTokens();

function loadStartingTileDetails() {
        const randomStartingTileId = Math.floor(Math.random() * 5);
        const startingTile = startingTiles[randomStartingTileId];
        [
                [20, 20],
                [21, 19],
                [21, 20],
        ].forEach(([row, column], i: number) => {
                const mapRowIndex = mapRowsColumnsIndexes["rows"][row];
                const mapColumnIndex = mapRowsColumnsIndexes["columns"][column];
                mapData[mapRowIndex][mapColumnIndex].placedTile = true;
                mapData[mapRowIndex][mapColumnIndex].habitats = startingTile[i].habitats;
                mapData[mapRowIndex][mapColumnIndex].wildlife = startingTile[i].wildlife;
                mapData[mapRowIndex][mapColumnIndex].rotation = startingTile[i].rotation;
        });
}

function generateMap() {}

export function neighbourTiles(tileID: string) {
        const [row, column] = tileID.split("-").map(Number);
        const even = [
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0],
                [-1, -1],
                [1, -1],
        ];
        const odd = [
                [0, 1],
                [0, -1],
                [-1, 0],
                [1, 0],
                [1, 1],
                [-1, +1],
        ];
        const potientialPlaceMent = row % 2 == 0 ? even : odd;
        return potientialPlaceMent.map(([dr, dc]) => `${row + dr}-${column + dc}`);
}
>>>>>>> v2
