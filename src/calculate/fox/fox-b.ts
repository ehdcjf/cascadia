import { MapData } from '../../interfaces';

export class FoxScoringB {
	protected readonly FoxScoringValue: Record<number, number> = {
		0: 0,
		1: 3,
		2: 5,
		3: 7,
	} as const;

	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: MapData) {
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'fox') continue;
			const neighborhood = mapItem.neighborhood;

			const pairsOfWildlife = neighborhood
				.map((key) => mapData.get(key)?.placedToken)
				.filter((tile) => !!tile && tile != 'fox')
				.reduce((r, v, _, a) => {
					if (r.has(v)) return r;

					const wildlifeCount = a.filter((w) => w == v).length;
					const pairCount = Math.floor(wildlifeCount / 2);
					if (pairCount > 0) r.add(v);
					return r;
				}, new Set()).size;

			if (pairsOfWildlife > 0) {
				this.confirmedTiles.push([key]);
				this.totalScore += this.FoxScoringValue[pairsOfWildlife];
			}
		}
	}

	get score() {
		return this.totalScore;
	}

	get tiles() {
		return this.confirmedTiles;
	}
}
