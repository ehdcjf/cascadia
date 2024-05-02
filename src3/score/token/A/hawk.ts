import { MapItem } from '../../../board';
const HawkScoringValue: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 8,
	4: 11,
	5: 14,
	6: 18,
	7: 22,
	8: 26,
};

export class HawkScoring {
	private totalScore = 0;
	constructor(mapData: Map<string, MapItem>) {
		let isolatedHawksCount = 0;
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'hawk') continue;

			const neighborKeys = mapItem.coor.neighborKeys;
			let isIsolated = true;
			for (const nkey of neighborKeys) {
				if (!mapData.has(nkey)) continue;
				const neighborItem = mapData.get(nkey)!;
				if (neighborItem.placedToken == 'hawk') {
					isIsolated = false;
					break;
				}
			}
			if (isIsolated) isolatedHawksCount += 1;
		}
		this.totalScore += HawkScoringValue[isolatedHawksCount];
	}

	get score() {
		return this.totalScore;
	}
}
