import { linkedTileSides } from "../const";
import { allPlacedTokens } from "../tile";

export function searchNeighbourTilesForWildlife(currentID: string, wildlife: string) {
        const matchedTileIDs: string[] = [];

        const [row, column] = currentID.split("-").map(Number);
        const rowColMapSet = row % 2 == 0 ? 0 : 1;

        for (let i = 0; i < linkedTileSides.length; i++) {
                const newRow = row + linkedTileSides[i].rowColMapping[rowColMapSet].rowDiff;
                const newColumn = column + linkedTileSides[i].rowColMapping[rowColMapSet].columnDiff;
                const newTileID = `${newRow}-${newColumn}`;

                if (!allPlacedTokens.hasOwnProperty(newTileID)) continue;
                if (allPlacedTokens[newTileID] == wildlife) {
                        matchedTileIDs.push(newTileID);
                }
        }
        return matchedTileIDs;
}

export function neighbourTileIDs(currentID: string) {
        const neighbourIDs: string[] = [];
        const [row, column] = currentID.split("-").map(Number);
        const rowColMapSet = row % 2 == 0 ? 0 : 1;

        for (let i = 0; i < linkedTileSides.length; i++) {
                const newRow = row + linkedTileSides[i].rowColMapping[rowColMapSet].rowDiff;
                const newColumn = column + linkedTileSides[i].rowColMapping[rowColMapSet].columnDiff;
                const newTileID = `${newRow}-${newColumn}`;
                neighbourIDs.push(newTileID);
        }
        return neighbourIDs;
}
