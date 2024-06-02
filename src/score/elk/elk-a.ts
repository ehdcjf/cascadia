import { MapData, GroupResult } from '../../interfaces';
import { Queue } from '../../utils';
import { ElkScoring } from './elk';
const ElkScoringValueA: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 9,
	4: 13,
};

export class ElkScoringA extends ElkScoring {
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
				score += ElkScoringValueA[1];
				groups.push(elkGroup);
				break;
			case 2:
				const distance = this.calculateDistance(elkGroup[0], elkGroup[1]);
				if (distance == 1) {
					// 이웃한 엘크
					score = ElkScoringValueA[2];
					groups.push(elkGroup);
				} else {
					score += ElkScoringValueA[1] * 2;
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

		const startingElks: [string, number][] = [];

		elkGroup.forEach((elk) => {
			const neighborhood = this.mapData.get(elk)!.neighborhood;
			for (let i = 0; i < 3; i++) {
				const nextNeighbor = neighborhood[i];
				const prevNeighbor = neighborhood[i + 3];
				if (elkGroup.includes(nextNeighbor) && !elkGroup.includes(prevNeighbor)) {
					startingElks.push([elk, i]);
				}
			}
		});

		startingElks.forEach(([firstElk, dir]) => {
			const standInLineElks = [firstElk];
			const q = new Queue<string>();
			q.push(firstElk);

			while (q.size > 0 && standInLineElks.length < 4) {
				const elk = q.pop()!;
				const neighborhood = this.mapData.get(elk)!.neighborhood;
				const nextElk = neighborhood[dir];
				if (elkGroup.includes(nextElk)) {
					q.push(nextElk);
					standInLineElks.push(nextElk);
				}
			}
			const lineLength = standInLineElks.length;
			const restElks = elkGroup.filter((elk) => !standInLineElks.includes(elk));
			const restResult = this.calculateElkGroup(restElks);
			const score = ElkScoringValueA[lineLength] + restResult.score;
			if (score > maxScore) {
				maxScore = score;
				groups = [standInLineElks, ...restResult.groups];
			}
		});

		return { score: maxScore, groups };
	}
}
