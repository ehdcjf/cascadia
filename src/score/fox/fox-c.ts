import { MapData } from '../../interfaces';

export class FoxScoringC {
	protected readonly FoxScoringValue: Record<number, number> = {
		1: 1,
		2: 2,
		3: 3,
		4: 4,
		5: 5,
		6: 6,
	} as const;
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: MapData) {
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'fox') continue;
			const neighborhood = mapItem.neighborhood;

			const mostAbundantCount = neighborhood
				.map((key) => mapData.get(key)?.placedToken)
				.filter((tile) => !!tile && tile != 'fox')
				.reduce((r, v, _, a) => {
					const wildlifeCount = a.filter((w) => w == v).length;
					r = Math.max(wildlifeCount, r);
					return r;
				}, 0);

			if (mostAbundantCount > 0) {
				this.confirmedTiles.push([key]);
				this.totalScore += this.FoxScoringValue[mostAbundantCount];
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
