function calculateSalmonTokenScoring() {
        let salmonScoringValues = {
                1: 2,
                2: 4,
                3: 7,
                4: 11,
                5: 15,
                6: 20,
                7: 26,
        };

        const tokenIDs = Object.keys(allPlacedTokens);

        let allSalmonTileIDs = [];

        // 연어 전부 뽑고
        for (const tokenID of tokenIDs) {
                if (allPlacedTokens[tokenID] == "salmon") {
                        allSalmonTileIDs.push(tokenID);
                }
        }

        let validSalmonTiles = [];

        // 주변에 연어 2마리 초과하는 연어는 무시
        // 주변에 연어 2마리 이하만 생각
        for (let i = 0; i < allSalmonTileIDs.length; i++) {
                let neighbouringSalmon = searchNeighbourTilesForWildlife(allSalmonTileIDs[i], "salmon");
                if (neighbouringSalmon.length <= 2) {
                        validSalmonTiles.push(allSalmonTileIDs[i]);
                } else {
                        usedSalmonTokenIDs.push(allSalmonTileIDs[i]);
                }
        }

        // 주변에 연어 2마리 이하인 연어 중에서
        for (let j = 0; j < validSalmonTiles.length; j++) {
                potentialSalmonTokenIDs = [];

                // 아직 안쓴 연어만
                if (usedSalmonTokenIDs.indexOf(validSalmonTiles[j]) == -1) {
                        // 이 배열의 길이는 0 | 1 | 2
                        let potentialNeighbourSalmon = searchNeighbourTilesForWildlife(validSalmonTiles[j], "salmon");

                        let confirmedNeighbourSalmon = [];

                        // 아직 안썼으면 이웃한 연어로 확정
                        for (let k = 0; k < potentialNeighbourSalmon.length; k++) {
                                if (usedSalmonTokenIDs.indexOf(potentialNeighbourSalmon[k]) == -1) {
                                        confirmedNeighbourSalmon.push(potentialNeighbourSalmon[k]);
                                }
                        }

                        // 이웃이 둘인경우..
                        if (confirmedNeighbourSalmon.length == 2) {
                                let tilesToCheck = [validSalmonTiles[j]]; // 원래 연어

                                tilesToCheck.push(...confirmedNeighbourSalmon); // 이웃 연어 추가

                                // 이웃 연어 1의 이웃 가져오고
                                let firstNeighbourTiles = neighbourTileIDs(confirmedNeighbourSalmon[0]);

                                // 이웃 연어2의 이웃 가져와서
                                let secondNeighbourTiles = neighbourTileIDs(confirmedNeighbourSalmon[1]);

                                // 만약에 이웃한 연어 1의 이웃에 이웃연어 2가 포함되지 않고.
                                // 이웃한 연어 1의 이웃에 이웃연어 1이 포함되지 않는다면
                                // 아무튼 떨어져 있다는 뜻.
                                if (
                                        firstNeighbourTiles.indexOf(confirmedNeighbourSalmon[1]) === -1 &&
                                        secondNeighbourTiles.indexOf(confirmedNeighbourSalmon[0]) === -1
                                ) {
                                        // perform a run forwards and backwards!!
                                        let forwardsAndBackwardsSalmonRunIDs = forwardsAndBackwardsSalmonRun(
                                                validSalmonTiles[j],
                                                confirmedNeighbourSalmon,
                                        );

                                        potentialSalmonTokenIDs.push(...forwardsAndBackwardsSalmonRunIDs);
                                } else {
                                        // since all tokens with 3 or more neighbours have been removed - if this criteria of the loop is met it HAS to be a valid triangle formation
                                        // 정삼각형 모양이면 인정함.
                                        potentialSalmonTokenIDs.push(...tilesToCheck);
                                        usedSalmonTokenIDs.push(...tilesToCheck);
                                }
                                // 이웃이 없거나, 하나인경우..
                                //  연어가 딱 한마리이거나.
                                // 연어 무리의 시작점
                        } else if (confirmedNeighbourSalmon.length < 2) {
                                potentialSalmonTokenIDs.push(validSalmonTiles[j]);
                                let salmonRunIDs = salmonTokensInRun(validSalmonTiles[j], "salmon");
                                potentialSalmonTokenIDs.push(...salmonRunIDs);
                        }
                        confirmedSalmonRuns.push(potentialSalmonTokenIDs);
                }
        }

        confirmedSalmonRuns.sort(function (a, b) {
                return b.length - a.length;
        });

        for (let i = 0; i < confirmedSalmonRuns.length; i++) {
                let uniqueSalmonIDs = confirmedSalmonRuns[i].filter(onlyUnique);
                let salmonInRunNum = uniqueSalmonIDs.length;
                if (salmonInRunNum > 7) salmonInRunNum = 7;
                tokenScoring.salmon.totalScore += salmonScoringValues[salmonInRunNum];
        }
}

let currentSalmonRunIDs = [];
let forwardsAndBackwardsSalmonRunIDs = [];

function forwardsAndBackwardsSalmonRun(firstTile, startingTiles) {
        forwardsAndBackwardsSalmonRunIDs = [];

        let nextWildlifeToken = "";

        forwardsAndBackwardsSalmonRunIDs = [firstTile];
        usedSalmonTokenIDs.push(firstTile);

        for (let i = 0; i < startingTiles.length; i++) {
                let nextTokenID = startingTiles[i];
                forwardsAndBackwardsSalmonRunIDs.push(startingTiles[i]);
                usedSalmonTokenIDs.push(startingTiles[i]);

                let forwardsBackwardsSalmonRunEnded = false;

                while (!forwardsBackwardsSalmonRunEnded) {
                        let result = searchNeighbourTilesForWildlife(nextTokenID, "salmon");

                        for (let i = result.length - 1; i >= 0; i--) {
                                // Because the previous tile in the run would also be included as part of this function - we can go ahead and remove it
                                if (usedSalmonTokenIDs.indexOf(result[i]) !== -1) {
                                        result.splice(i, 1);
                                }
                        }
                        if (result.length == 1) {
                                forwardsAndBackwardsSalmonRunIDs.push(result[0]);
                                usedSalmonTokenIDs.push(result[0]);
                                nextTokenID = result[0];
                        } else {
                                forwardsBackwardsSalmonRunEnded = true;
                        }
                }
        }
        return forwardsAndBackwardsSalmonRunIDs;
}

function salmonTokensInRun(startID, thisWildlife) {
        currentSalmonRunIDs = [];

        let nextWildlifeToken = "";
        let nextTokenID = startID;

        currentSalmonRunIDs = [startID];
        usedSalmonTokenIDs.push(startID);

        let salmonRunEnded = false;

        while (!salmonRunEnded) {
                let result = searchNeighbourTilesForWildlife(nextTokenID, thisWildlife);

                for (let i = result.length - 1; i >= 0; i--) {
                        // Because the previous tile in the run would also be included as part of this function - we can go ahead and remove it
                        if (usedSalmonTokenIDs.indexOf(result[i]) !== -1) {
                                result.splice(i, 1);
                        }
                }

                if (result.length == 1) {
                        currentSalmonRunIDs.push(result[0]);
                        usedSalmonTokenIDs.push(result[0]);
                        nextTokenID = result[0];
                } else {
                        salmonRunEnded = true;
                }
        }

        return currentSalmonRunIDs;
}

function searchNeighbourTilesForWildlife(currentID, thisWildlife) {
        let matchedTileIDs = [];

        let splitTileID = currentID.split("-");

        let thisRow = parseInt(splitTileID[1]);
        let thisColumn = parseInt(splitTileID[3]);

        let rowColMapSet = thisRow % 2;
        if (rowColMapSet != 0) rowColMapSet = 1;

        for (let i = 0; i < linkedTileSides.length; i++) {
                let newRow = thisRow + linkedTileSides[i].rowColMapping[rowColMapSet].rowDif;
                let newColumn = thisColumn + linkedTileSides[i].rowColMapping[rowColMapSet].colDif;
                let newTileID = "row-" + newRow + "-column-" + newColumn;

                if (allPlacedTokens.hasOwnProperty(newTileID)) {
                        if (allPlacedTokens[newTileID] == thisWildlife) {
                                matchedTileIDs.push(newTileID);
                        }
                }
        }

        return matchedTileIDs;
}

function neighbourTileIDs(currentID) {
        let neighbourIDs = [];

        let splitTileID = currentID.split("-");

        let thisRow = parseInt(splitTileID[1]);
        let thisColumn = parseInt(splitTileID[3]);

        let rowColMapSet = thisRow % 2;
        if (rowColMapSet != 0) rowColMapSet = 1;

        for (let i = 0; i < linkedTileSides.length; i++) {
                let newRow = thisRow + linkedTileSides[i].rowColMapping[rowColMapSet].rowDif;
                let newColumn = thisColumn + linkedTileSides[i].rowColMapping[rowColMapSet].colDif;
                let newTileID = "row-" + newRow + "-column-" + newColumn;

                neighbourIDs.push(newTileID);
        }

        return neighbourIDs;
}
