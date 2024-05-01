import { MapItem } from '../board';
import { Habitat } from '../interfaces';
import { Queue } from '../utils';

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
		Habitat,
		{
			placedTiles: number;
			tilesWithMatchedHabitats: Map<string, Set<string>>;
			largestSet: number;
		}
	> = {
		desert: {
			placedTiles: 0,
			tilesWithMatchedHabitats: new Map(),
			largestSet: 0,
		},
		forest: {
			placedTiles: 0,
			tilesWithMatchedHabitats: new Map(),
			largestSet: 0,
		},
		lake: {
			placedTiles: 0,
			tilesWithMatchedHabitats: new Map(),
			largestSet: 0,
		},
		mountain: {
			placedTiles: 0,
			tilesWithMatchedHabitats: new Map(),
			largestSet: 0,
		},
		swamp: {
			placedTiles: 0,
			tilesWithMatchedHabitats: new Map(),
			largestSet: 0,
		},
	};
	constructor(mapData: Map<string, MapItem>) {
		for (const [_, tile] of mapData) {
			tile.habitats.forEach((v) => {
				this.habitatsMaches[v].placedTiles++;
			});

			const { tileId } = tile;
			const neighborhood = tile.coor.neighborCoor;

			for (let i = 0; i < neighborhood.length; i++) {
				const neighborKey = neighborhood[i].key;
				if (!mapData.has(neighborKey)) continue;
				const neighborTile = mapData.get(neighborKey)!;
				const neighborTileId = neighborTile.tileId;
				const [mi1, mi2] = indexMatch[i];
				const myHabitat = tile.habitatSides[mi1];
				const neighborHabitat = neighborTile.habitatSides[mi2];
				if (myHabitat === neighborHabitat && neighborTile.habitats.has(myHabitat)) {
					const [tile1, tile2] =
						tileId < neighborTileId
							? [tileId.toString(), neighborTileId.toString()]
							: [neighborTileId.toString(), tileId.toString()];

					if (!this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.has(tile1)) {
						this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.set(
							tile1,
							new Set()
						);
					}
					const links =
						this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.get(tile1)!;
					links?.add(tile2);
					this.habitatsMaches[myHabitat].tilesWithMatchedHabitats.set(tile1, links);
					neighborTile.habitats.delete(myHabitat);
				}
			}
		}

		for (const habitat of Object.keys(this.habitatsMaches) as Habitat[]) {
			const currentHabitat = this.habitatsMaches[habitat];
			if (currentHabitat.placedTiles == 0) continue;
			if (Object.keys(currentHabitat.tilesWithMatchedHabitats).length == 0) {
				currentHabitat.largestSet = 1;
				continue;
			}

			const matchedHabitats = currentHabitat.tilesWithMatchedHabitats;
			while (matchedHabitats.size > 0) {
				let linkCnt = 1;
				const key = [...Object.keys(currentHabitat.tilesWithMatchedHabitats)].pop()!;
				const q = new Queue();
				q.push(key);

				while (q.size > 0) {
					const now = q.pop();
					if (matchedHabitats.has(now)) {
						const value = matchedHabitats.get(now)!;
						linkCnt += value.size;
						value?.forEach((v) => {
							q.push(v);
						});
					}
					matchedHabitats.delete(now);
				}
				if (currentHabitat.largestSet < linkCnt) {
					currentHabitat.largestSet = linkCnt;
				}
			}
		}
		console.log(this.habitatsMaches);
	}
}
