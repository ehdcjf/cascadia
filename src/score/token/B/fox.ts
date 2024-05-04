import { MapData } from '../../../interfaces';
const FoxScoringValueB: Record<number, number> = {
	0: 0,
	1: 3,
	2: 5,
	3: 7,
};

export class FoxScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: MapData) {
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'fox') continue;
			const neighborKeys = mapItem.neighborhood;

			const pairsOfWildlife = neighborKeys
				.map((key) => mapData.get(key)?.placedToken)
				.filter((tile) => !!tile && tile != 'fox')
				.reduce((r, v, _, a) => {
					if (!r.has(v)) {
						const wildlifeCount = a.filter((w) => w == v).length;
						const pairCount = Math.floor(wildlifeCount / 2);
						if (pairCount > 0) r.add(v);
					}
					return r;
				}, new Set()).size;
			if (pairsOfWildlife > 0) {
				this.confirmedTiles.push([key]);
				this.totalScore += FoxScoringValueB[pairsOfWildlife];
			}
		}
	}

	get score() {
		return this.totalScore;
	}
}
