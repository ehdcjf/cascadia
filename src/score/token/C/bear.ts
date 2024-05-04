import { MapData } from '../../../interfaces';
import { Queue } from '../../../utils';

/**
 * C Bears
 */
const BearScoringValueC: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 8,
} as const;

const Bonus = 3 as const;

export class BearScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: MapData) {
		const visited: Set<string> = new Set();
		let bonuseCheck = 0;
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'bear' || visited.has(key)) continue;
			const q = new Queue();
			const bearGroup: string[] = [];
			q.push(key);
			visited.add(key);

			while (q.size > 0) {
				const bear = q.pop();
				const bearNeighborhoodKeys = mapData.get(bear)!.neighborhood;
				for (const neighborKey of bearNeighborhoodKeys) {
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

			if (bearGroupSize >= 1 && bearGroupSize <= 3) {
				this.confirmedTiles.push(bearGroup);
				this.totalScore += BearScoringValueC[bearGroupSize];
				bonuseCheck |= 1 << (bearGroupSize - 1);
			}
		}

		if (bonuseCheck == 7) this.totalScore += Bonus;
	}

	get score() {
		return this.totalScore;
	}
}
