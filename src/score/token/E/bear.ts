import { MapData } from '../../../interfaces';
import { Queue } from '../../../utils';
const BearScoringValueE = 3;

export class BearScoring {
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: MapData) {
		const visited: Set<string> = new Set();

		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'bear' || visited.has(key)) continue;
			const neighborKeys = mapData.get(key)!.neighborhood;
			// const unoccupiedTile: string[] = [];
			let unoccupiedTile = 0;
			let notBear = 0;

			neighborKeys.forEach((neighborKey) => {
				if (mapData.has(neighborKey) && mapData.get(neighborKey)?.placedToken != 'bear') {
					notBear += 1;
				} else if (!mapData.has(neighborKey)) {
					unoccupiedTile += 1;
				}
			});

			if (unoccupiedTile == 1 && notBear == 5) {
				this.confirmedTiles.push([key]);
			}
		}
	}

	get score() {
		return BearScoringValueE * this.confirmedTiles.length;
	}
}
