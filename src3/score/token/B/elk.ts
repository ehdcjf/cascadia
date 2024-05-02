import { Coordinates } from '../../../board';
import { MapItem } from '../../../board';
import { Queue } from '../../../utils';
const ElkScoringValueB: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 9,
	4: 13,
};

const ParallelogramQRS = [
	[
		[1, -1, 0],
		[1, 0, -1],
		[2, -1, -1],
	],
	[
		[1, 0, -1],
		[0, 1, -1],
		[1, 1, -2],
	],
	[
		[0, 1, -1],
		[-1, 1, 0],
		[-1, 2, -1],
	],
];

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
				score = ElkScoringValueB[0];
				break;
			case 1:
				score = ElkScoringValueB[1];
				groups.push(elkGroup);
				break;
			case 2:
				const [first, second] = elkGroup.map((key) => this.mapData.get(key)!.coor);
				const distance = this.calcDistanceByQRS(first, second);
				if (distance == 1) {
					score = ElkScoringValueB[2];
					groups.push(elkGroup);
				} else {
					score = ElkScoringValueB[1] * 2;
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

	// 아무튼 4마리 이상의 그룹으로 이루어진 경우
	private calculateElkGroupOverTwo(elkGroup: string[]): { score: number; groups: string[][] } {
		let maxScore = 0;
		let group: string[][] = [];
		elkGroup.forEach((elkKey) => {
			const [q, r, s] = elkKey.split('#').map(Number);

			ParallelogramQRS.forEach((parallelogram) => {
				const targetKeys = parallelogram.map((p) => [q + p[0], r + p[1], s + p[2]].join('#'));
				const isParallelogram = targetKeys.every((key) => elkGroup.includes(key));
				if (isParallelogram && elkGroup.length > 3) {
					const restElks = elkGroup.filter((v) => v != elkKey || !targetKeys.includes(v));
					const result = this.calculateElkGroup(restElks);
					const score = ElkScoringValueB[4] + result.score;
					if (score > maxScore) {
						maxScore = score;
						group = [[elkKey, ...targetKeys], ...result.groups];
					}
				} else {
					targetKeys.pop(); // 마지막 키를 제거하면 삼각형
					const isTriangle = targetKeys.every((key) => elkGroup.includes(key));
					if (isTriangle) {
						const restElks = elkGroup.filter(
							(v) => v != elkKey || !targetKeys.includes(v)
						);
						const result = this.calculateElkGroup(restElks);
						const score = ElkScoringValueB[3] + result.score;
						if (score > maxScore) {
							maxScore = score;
							group = [[elkKey, ...targetKeys], ...result.groups];
						}
					} else {
						targetKeys.pop(); // 마지막 키를 제거하면 직선
						const isLine = targetKeys.every((key) => elkGroup.includes(key));
						if (isLine) {
							const restElks = elkGroup.filter(
								(v) => v != elkKey || !targetKeys.includes(v)
							);
							const result = this.calculateElkGroup(restElks);
							const score = ElkScoringValueB[2] + result.score;
							if (score > maxScore) {
								maxScore = score;
								group = [[elkKey, ...targetKeys], ...result.groups];
							}
						}
					}
				}
			});
		});

		return {
			score: maxScore,
			groups: group,
		};
	}

	get score() {
		return this.totalScore;
	}
}
