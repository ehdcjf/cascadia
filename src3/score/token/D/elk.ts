import { Coordinates } from '../../../board';
import { MapItem } from '../../../board';
import { Queue } from '../../../utils';
const ElkScoringValueD: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 8,
	4: 12,
	5: 16,
	6: 21,
};

export class ElkScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];

	constructor(private mapData: Map<string, MapItem>) {
		const allElks = [];

		for (const [key, mapItem] of this.mapData) {
			if (mapItem.placedToken == 'elk') allElks.push(key);
		}

		const allElkGroups = this.groupElkIds(allElks);

		allElkGroups.forEach((elkGroup) => {
			const result = this.calculateElkGroup(elkGroup);
			this.totalScore += result.score;
			this.confirmedTiles.push(...result.groups);
		});
	}

	private groupElkIds(elkIDs: string[]) {
		const allElkGroups = [];
		const visited = new Set();
		for (const key of elkIDs) {
			const ellElkGroup = [];
			const q = new Queue();
			q.push(key);
			ellElkGroup.push(key);
			visited.add(key);
			while (q.size > 0) {
				const token = q.pop();
				const neighborhood = this.mapData.get(token)!.coor.neighborKeys;
				for (const neighborKey of neighborhood) {
					const neighborToken = this.mapData.get(neighborKey);
					if (!neighborToken) continue;
					if (neighborToken.placedToken != 'elk') continue;
					q.push(neighborKey);
					ellElkGroup.push(neighborKey);
					visited.add(neighborKey);
				}
			}
			allElkGroups.push(ellElkGroup);
		}

		return allElkGroups;
	}

	private calcDistanceByQRS(a: Coordinates, b: Coordinates) {
		const x = a.qrs;
		const y = b.qrs;
		return (Math.abs(x.q - y.q) + Math.abs(x.r - y.r) + Math.abs(x.s - y.s)) / 2;
	}

	private calculateElkGroup(elkGroup: string[]): { score: number; groups: string[][] } {
		let score = 0;
		const groups: string[][] = [];
		switch (elkGroup.length) {
			case 0:
				score = ElkScoringValueD[0];
				break;
			case 1:
				score = ElkScoringValueD[1];
				groups.push(elkGroup);
				break;

			case 2:
				const [first, second] = elkGroup.map((key) => this.mapData.get(key)!.coor);
				const distance = this.calcDistanceByQRS(first, second);
				if (distance == 1) {
					score = ElkScoringValueD[2];
					groups.push(elkGroup);
				} else {
					score = ElkScoringValueD[1] * 2;
					groups.push([elkGroup[0]]);
					groups.push([elkGroup[1]]);
				}
				break;
			default: {
				const reSortedElkGroups = this.groupElkIds(elkGroup);
				if (reSortedElkGroups.length == 1) {
					const result = this.calculateElkGroupOverTwo(elkGroup);
					score += result.score;
					groups.push(...result.groups);
				} else {
					reSortedElkGroups.forEach((group) => {
						const result = this.calculateElkGroup(group);
						score += result.score;
						groups.push(...result.groups);
					});
				}
				break;
			}
		}
		return { score, groups };
	}

	private calculateElkGroupOverTwo(elkGroup: string[]): { score: number; groups: string[][] } {
		let maxScore = 0;
		let group: string[][] = [];
		const q = new Queue();

		elkGroup.forEach((elkKey) => {
			const neighborKeys = this.mapData.get(elkKey)!.coor.neighborKeys;

			neighborKeys.forEach((neighborKey, lastDir) => {
				if (elkGroup.includes(neighborKey)) {
					const nowElks = [elkKey, neighborKey];
					q.push([nowElks, lastDir]);
				}
			});
		});

		while (q.size > 0) {
			const [elks, lastDir] = q.pop() as [string[], number];
			const elkSize = elks.length;
			const restElks = elkGroup.filter((elk) => !elks.includes(elk));
			const result = this.calculateElkGroup(restElks);
			const score = ElkScoringValueD[elkSize] + result.score;
			if (score > maxScore) {
				maxScore = score;
				group = [elks, ...result.groups];
			}

			if (elkSize == 6) continue;

			const lastElk = elks[elkSize - 1];
			const nextDir = (lastDir + 1) % 6;

			const nextElk = this.mapData.get(lastElk)!.coor.neighborKeys[nextDir];
			if (restElks.includes(nextElk)) {
				q.push([[...elks, nextElk], nextDir]);
			}
		}

		return {
			score: maxScore,
			groups: group,
		};
	}

	get score() {
		return this.totalScore;
	}
}
