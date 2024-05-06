import { MapData, GroupResult } from '../../interfaces';
import { Queue } from '../../utils';
import { ElkScoring } from './elk';
const ElkScoringValueD: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 8,
	4: 12,
	5: 16,
	6: 21,
};

export class ElkScoringD extends ElkScoring {
	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		this.elkGroups.forEach((elkGroup) => {
			const result = this.calculateElkGroup(elkGroup);
			this.totalScore += result.score;
			this.confirmedTiles.push(...result.groups);
		});
	}

	private calculateElkGroup(elkGroup: string[]): GroupResult {
		let score = 0;
		const groups: string[][] = [];
		const elkGroupSize = elkGroup.length;
		switch (elkGroupSize) {
			case 0:
				break;
			case 1:
				score += ElkScoringValueD[1];
				groups.push(elkGroup);
				break;
			case 2:
				const distance = this.calculateDistance(elkGroup[0], elkGroup[1]);
				if (distance == 1) {
					score = ElkScoringValueD[2];
					groups.push(elkGroup);
				} else {
					score += ElkScoringValueD[1] * 2;
					groups.push([elkGroup[0]]);
					groups.push([elkGroup[1]]);
				}
				break;
			default:
				const reGroupedElks = this.groupedElks(elkGroup);
				if (reGroupedElks.length == 1) {
					const result = this.calculateElkGroupOverTwo(elkGroup);
					score += result.score;
					groups.push(...result.groups);
				} else {
					reGroupedElks.forEach((elkGroup) => {
						const result = this.calculateElkGroup(elkGroup);
						score += result.score;
						groups.push(...result.groups);
					});
				}
				break;
		}

		return { score, groups };
	}

	private calculateElkGroupOverTwo(elkGroup: string[]): GroupResult {
		let maxScore = 0;
		let groups: string[][] = [];

		const q = new Queue<[string[], number]>();

		elkGroup.forEach((elkKey) => {
			const neighborKeys = this.mapData.get(elkKey)!.neighborhood;

			neighborKeys.forEach((neighborKey, lastDir) => {
				if (elkGroup.includes(neighborKey)) {
					const elks = [elkKey, neighborKey];
					q.push([elks, lastDir]);
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
				groups = [elks, ...result.groups];
			}

			if (elkSize == 6) continue;

			const lastElk = elks[elkSize - 1];
			const nextDir = (lastDir + 1) % 6;

			const nextElk = this.mapData.get(lastElk)!.neighborhood[nextDir];
			if (restElks.includes(nextElk)) {
				q.push([[...elks, nextElk], nextDir]);
			}
		}

		return { score: maxScore, groups };
	}
}
