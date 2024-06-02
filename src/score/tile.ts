import type { Habitat, Tile } from '../interfaces';
import { Queue } from '../utils';

// const indexMatch = [
// 	[0, 3],
// 	[1, 4],
// 	[2, 5],
// 	[3, 0],
// 	[4, 1],
// 	[5, 2],
// ];

class HabitatScore {
	placedTiles: Set<string>;
	tilesWithMatchedHabitats: Map<number, Set<number>>;
	largestSet: any[];
	constructor() {
		this.placedTiles = new Set();
		this.tilesWithMatchedHabitats = new Map();
		this.largestSet = new Array();
	}
}

export class TileScoring {
	habitatsMaches: Record<Habitat, HabitatScore> = {
		desert: new HabitatScore(),
		forest: new HabitatScore(),
		lake: new HabitatScore(),
		mountain: new HabitatScore(),
		swamp: new HabitatScore(),
	};
	tileNumtoID: Array<string> = new Array(24);
	constructor(mapData: Map<string, Tile>) {
		// 타일 전부순회하면서.
		// 각 서식지에 대한 그래프를 만들 준비를 한다.
		for (const [tileID, tile] of mapData) {
			const { tileNum } = tile;

			this.tileNumtoID[tileNum] = tileID;
			const neighborhood = tile.neighborhood;

			for (let dir = 0; dir < neighborhood.length; dir++) {
				const myHabitat = tile.habitatSides[dir]!;
				if (myHabitat == null) continue;
				this.habitatsMaches[myHabitat].placedTiles.add(tileID);

				const neighborKey = neighborhood[dir];

				if (!mapData.has(neighborKey)) continue;

				const neighborTile = mapData.get(neighborKey)!;

				const neighborTileNum = neighborTile.tileNum;
				const matchedDir = (dir + 3) % 6;
				const neighborHabitat = neighborTile.habitatSides[matchedDir];
				if (myHabitat === neighborHabitat) {
					if (!this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.has(tileNum)) {
						this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.set(
							tileNum,
							new Set()
						);
					}
					if (
						!this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.has(
							neighborTileNum
						)
					) {
						this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.set(
							neighborTileNum,
							new Set()
						);
					}

					const links1 =
						this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.get(tileNum)!;
					links1.add(neighborTileNum);
					this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.set(tileNum, links1);

					const links2 =
						this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.get(
							neighborTileNum
						)!;
					links2.add(tileNum);
					this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.set(
						neighborTileNum,
						links2
					);
					tile.habitatSides[dir] = null;
				}
			}
		}

		for (const habitatName in this.habitatsMaches) {
			const habaitat = this.habitatsMaches[habitatName as Habitat];
			if (habaitat.placedTiles.size == 0) continue;
			else if (habaitat.placedTiles.size == 1) {
				habaitat.largestSet = [...habaitat.placedTiles];
				continue;
			}
			const matchedHabitats = habaitat.tilesWithMatchedHabitats;

			for (const [tileNum] of matchedHabitats) {
				const q = new Queue<number>();
				const visitedHabitats: Set<number> = new Set();
				q.push(tileNum);
				visitedHabitats.add(tileNum);

				while (q.size > 0) {
					const now = q.pop()!;
					if (matchedHabitats.has(now)) {
						const links = matchedHabitats.get(now)!;
						for (const nextTile of links) {
							if (!visitedHabitats.has(nextTile)) {
								visitedHabitats.add(nextTile);
								q.push(nextTile);
							}
						}
					}
					matchedHabitats.delete(tileNum);
				}

				if (habaitat.largestSet.length < visitedHabitats.size) {
					habaitat.largestSet = [...visitedHabitats].map((v) => this.tileNumtoID[v]);
				}
			}
		}
	}

	getScore() {
		return this.habitatsMaches;
	}
}
