import { MapItem } from '../../../board';
const FoxScoringValueC: Record<number, number> = {
	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
	6: 6,
};

export class FoxScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: Map<string, MapItem>) {
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'fox') continue;
			const neighborKeys = mapItem.coor.neighborKeys;

			const mostAbundantCount = neighborKeys
				.map((key) => mapData.get(key)?.placedToken)
				.filter((tile) => !!tile && tile != 'fox')
				.reduce((r, v, _, a) => {
					const wildlifeCount = a.filter((w) => w == v).length;
					r = Math.max(wildlifeCount, r);
					return r;
				}, 0);
			if (mostAbundantCount > 0) {
				this.confirmedTiles.push([key]);
				this.totalScore += FoxScoringValueC[mostAbundantCount];
			}
		}
	}

	get score() {
		return this.totalScore;
	}
}
