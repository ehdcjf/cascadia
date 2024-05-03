import { MapItem } from '../../../board';
import { Queue } from '../../../utils';

export class BearScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: Map<string, MapItem>) {
		const visited: Set<string> = new Set();
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'bear' || visited.has(key)) continue;
			const q = new Queue();
			const bearGroup: string[] = [];
			q.push(key);
			visited.add(key);

			while (q.size > 0) {
				const now = q.pop();
				const neighborKeys = mapData.get(now)!.coor.neighborKeys;
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
			if (bearGroup.length == 3) {
				this.totalScore += 10;
				this.confirmedTiles.push(bearGroup);
			}
		}
	}

	get score() {
		return this.totalScore;
	}
}
