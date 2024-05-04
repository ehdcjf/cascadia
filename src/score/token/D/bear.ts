import { MapData } from '../../../interfaces';
import { Queue } from '../../../utils';

/**
 * D Bears Score Value
 */
const BearScoringValueD: Record<number, number> = {
	0: 0,
	1: 0,
	2: 5,
	3: 8,
	4: 13,
} as const;

export class BearScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: MapData) {
		const visited: Set<string> = new Set();
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'bear' || visited.has(key)) continue;
			const q = new Queue();
			const bearGroup: string[] = [];
			q.push(key);
			visited.add(key);

			while (q.size > 0) {
				const bear = q.pop();
				const neighborKeys = mapData.get(bear)!.neighborhood;
				for (const neighborKey of neighborKeys) {
					if (!mapData.has(neighborKey) || visited.has(neighborKey)) continue;
					const neighbor = mapData.get(neighborKey)!;
					if (neighbor.placedToken == 'bear') {
						bearGroup.push(neighborKey);
						q.push(neighborKey);
						visited.add(neighborKey);
					}
				}
			}

			const bearGroupSize = bearGroup.length;

			if (bearGroupSize >= 2 && bearGroupSize <= 4) {
				this.confirmedTiles.push(bearGroup);
				this.totalScore += BearScoringValueD[bearGroupSize];
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
