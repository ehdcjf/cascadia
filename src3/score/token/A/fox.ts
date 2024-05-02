import { MapItem } from '../../../board';
import { WildLife } from '../../../interfaces';
const FoxScoringValue: Record<number, number> = {
	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
};

export class FoxScoring {
	private totalScore = 0;
	constructor(mapData: Map<string, MapItem>) {
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'fox') continue;
			const neighborKeys = mapItem.coor.neighborKeys;
			const uniqueWildLife: Set<WildLife> = new Set();
			for (const nkey of neighborKeys) {
				if (!mapData.has(nkey)) continue;
				const neighborItem = mapData.get(nkey)!;
				if (neighborItem.placedToken) uniqueWildLife.add(neighborItem.placedToken);
			}
			this.totalScore += FoxScoringValue[uniqueWildLife.size];
		}
	}

	get score() {
		return this.totalScore;
	}
}
