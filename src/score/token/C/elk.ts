import { MapData } from '../../../interfaces';
import { Queue } from '../../../utils';
const ElkScoringValueC: Record<number, number> = {
	0: 0,
	1: 0,
	2: 4,
	3: 7,
	4: 10,
	5: 14,
	6: 18,
	7: 23,
	8: 28,
};

export class ElkScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];

	constructor(mapData: MapData) {
		const visited: Set<string> = new Set();

		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'elk' || visited.has(key)) continue;
			const q = new Queue();
			const elkGroup: string[] = [];
			q.push(key);
			visited.add(key);

			while (q.size > 0) {
				const now = q.pop();
				const neighborKeys = mapData.get(now)!.neighborhood;
				for (const neighborKey of neighborKeys) {
					if (!mapData.has(neighborKey) || visited.has(neighborKey)) continue;
					const neighborItem = mapData.get(neighborKey)!;
					if (neighborItem.placedToken == 'elk') {
						if (elkGroup.length < 8) elkGroup.push(neighborKey);

						q.push(neighborKey);
						visited.add(neighborKey);
					}
				}
			}
			const elkGroupSize = elkGroup.length;
			if (elkGroupSize < 2) continue;

			this.totalScore += ElkScoringValueC[elkGroupSize];
			this.confirmedTiles.push(elkGroup);
		}
	}

	get score() {
		return this.totalScore;
	}
}
