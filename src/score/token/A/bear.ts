import { MapData } from '../../../interfaces';
import { Queue } from '../../../utils';
const BearScoringValueA: Record<number, number> = {
	0: 0,
	1: 4,
	2: 11,
	3: 19,
	4: 27,
};

export class BearScoring {
	private confirmedTiles: Array<Array<string>> = [];
	constructor(readonly mapData: MapData) {
		const visited: Set<string> = new Set();
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'bear' || visited.has(key)) continue;
			const q = new Queue();
			const bearGroup: string[] = [];
			q.push(key);
			visited.add(key);

			while (q.size > 0) {
				const now = q.pop();
				const neighborKeys = mapData.get(now)!.neighborhood;
				for (const neighborKey of neighborKeys) {
					if (!mapData.has(neighborKey) || visited.has(neighborKey)) continue;
					const neighborItem = mapData.get(neighborKey)!;
					if (neighborItem.placedToken == 'bear') {
						bearGroup.push(neighborKey);
						q.push(neighborKey);
						visited.add(neighborKey);
					}
				}
			}

			if (bearGroup.length == 2 && this.confirmedTiles.length < 4) {
				this.confirmedTiles.push(bearGroup);
			}
		}
	}

	get score() {
		return BearScoringValueA[this.confirmedTiles.length];
	}
}
