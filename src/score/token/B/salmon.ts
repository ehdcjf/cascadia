import { MapItem } from '../../../board';
import { Queue } from '../../../utils';
const SalmonScoringValueB: Record<number, number> = {
	0: 0,
	1: 2,
	2: 4,
	3: 9,
	4: 11,
	5: 17,
};

export class SalmonScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: Map<string, MapItem>) {
		const allSalmons: Set<string> = new Set();
		const invalidSalmon: Set<string> = new Set();
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'salmon') continue;
			const neighborKeys = mapItem.coor.neighborKeys;
			const neighborSalmonCount = neighborKeys.filter(
				(neighborKey) => mapData.get(neighborKey)?.placedToken == 'salmon'
			).length;

			if (neighborSalmonCount < 3 && neighborSalmonCount >= 1) {
				allSalmons.add(key);
			} else {
				invalidSalmon.add(key);
			}
		}
		//  큐로 그냥 돌리면 안됨... 



		// const visied = new Set();

		// for (const salmon of allSalmons) {
		// 	if (visied.has(salmon)) continue;
		// 	const q = new Queue();
		// 	const salmonGroup: string[] = [salmon];
		// 	q.push(salmon);
		// 	visied.add(salmon);

		// 	while (q.size > 0) {
		// 		const now = q.pop();

		// 		const neighborKeys = mapData.get(now)!.coor.neighborKeys;
		// 		for (const neighborKey of neighborKeys) {
		// 			if (!allSalmons.has(neighborKey)) continue;
		// 			if (visied.has(neighborKey)) continue;
		// 			if (invalidSalmon.has(neighborKey)) continue;
		// 			salmonGroup.push(neighborKey);
		// 			q.push(neighborKey);
		// 			visied.add(neighborKey);
		// 		}
		// 	}

		// 	const salmonScoreIndex = salmonGroup.length > 5 ? 5 : salmonGroup.length;
		// 	this.confirmedTiles.push(salmonGroup);
		// 	this.totalScore += SalmonScoringValueB[salmonScoreIndex];
		// }
	}

	get score() {
		return this.totalScore;
	}
}
