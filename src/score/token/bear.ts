import { Scoring } from "../../interfaces";
import { allPlacedTokens } from "../tile";
import { neighbourTileIDs } from "./util";

const BearScoringValue: Record<number, number> = {
  0: 0,
  1: 4,
  2: 11,
  3: 19,
  4: 27,
};

export class BearScoring extends Scoring {
  constructor() {
    super("bear");
  }

  protected calculate() {
    let confirmedBearPairs = 0;
    const potentialTokenIDs: string[] = [];
    const usedTokenIDs: string[] = [];

    const bearTokenIDs = this.getTargetTokenIDs();

    return 0;
  }
}

export function calculateBearScoring() {
  let confirmedBearPairs = 0;
  const potentialTokenIDs: string[] = [];
  const usedTokenIDs: string[] = [];

  for (const tokenID of Object.keys(allPlacedTokens)) {
    if (allPlacedTokens[tokenID] != "bear") continue;
    if (usedTokenIDs.includes(tokenID)) continue;

    const neighbourTiles = neighbourTileIDs(tokenID);
    for (let i = 0; i < neighbourTiles.length; i++) {
      const currentNeighbourTile = neighbourTiles[i];
      if (!allPlacedTokens.hasOwnProperty(currentNeighbourTile)) continue;
      if (allPlacedTokens[currentNeighbourTile] == "bear") {
        potentialTokenIDs.push(currentNeighbourTile);
      }
    }

    if (potentialTokenIDs.length == (1 as number)) {
      const potentialBearPairNeighbourTiles = neighbourTileIDs(
        potentialTokenIDs[0]
      );
      for (let i = 0; i < potentialBearPairNeighbourTiles.length; i++) {
        const currentPotentialTile = potentialBearPairNeighbourTiles[i];
        if (!allPlacedTokens.hasOwnProperty(currentPotentialTile)) continue;
        if (allPlacedTokens[currentPotentialTile] == "bear") {
          potentialTokenIDs.push(currentPotentialTile);
        }
      }
      if (potentialTokenIDs.length == 2) {
        if (confirmedBearPairs <= 4) confirmedBearPairs++;
      }
    }
    usedTokenIDs.push(...potentialTokenIDs);
  }

  return BearScoringValue[confirmedBearPairs];
}
