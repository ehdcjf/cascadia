import { MapData, GroupResult } from '../../interfaces';
import { qrsFromTileID } from '../../utils';
import { ElkScoring } from './elk';
const ElkScoringValueB: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 9,
	4: 13,
};

/**
 *  [0,0,0]을 기준으로.
 *  북동쪽, 남동쪽, 남쪽으로 마름모꼴을 그리는 좌표임
 *  마지막 좌표를 빼면 정삼각형을 그리는 좌표고,
 *  첫번째 좌표만 계산하면 직선을 그리는 좌표.
 *
 *
 *
 *
 *
 */
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

export class ElkScoringB extends ElkScoring {
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
				score += ElkScoringValueB[1];
				groups.push(elkGroup);
				break;
			case 2:
				const distance = this.calculateDistance(elkGroup[0], elkGroup[1]);
				if (distance == 1) {
					score = ElkScoringValueB[2];
					groups.push(elkGroup);
				} else {
					score += ElkScoringValueB[1] * 2;
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

		elkGroup.forEach((elk) => {
			const { q, r, s } = qrsFromTileID(elk);

			ParallelogramQRS.forEach((coordinate) => {
				const potentialElks = coordinate.map(
					(diff) => `tile[${q + diff[0]}][${r + diff[1]}][${s + diff[2]}]`
				);
				const isParallelogram = potentialElks.every((key) => elkGroup.includes(key));
				if (isParallelogram && elkGroup.length > 3) {
					const restElks = elkGroup.filter((v) => v != elk && !potentialElks.includes(v));
					const restResult = this.calculateElkGroup(restElks);
					const score = ElkScoringValueB[4] + restResult.score;
					if (score > maxScore) {
						maxScore = score;
						groups = [[elk, ...potentialElks], ...restResult.groups];
					}
				} else {
					potentialElks.pop(); // 마지막 키를 제거하면 삼각형
					const isTriangle = potentialElks.every((key) => elkGroup.includes(key));
					if (isTriangle) {
						const restElks = elkGroup.filter(
							(v) => v != elk && !potentialElks.includes(v)
						);
						const restResult = this.calculateElkGroup(restElks);
						const score = ElkScoringValueB[3] + restResult.score;
						if (score > maxScore) {
							maxScore = score;
							groups = [[elk, ...potentialElks], ...restResult.groups];
						}
					} else {
						potentialElks.pop(); // 마지막 키를 제거하면 직선
						const isLine = potentialElks.every((key) => elkGroup.includes(key));
						if (isLine) {
							const restElks = elkGroup.filter(
								(v) => v != elk && !potentialElks.includes(v)
							);
							const restResult = this.calculateElkGroup(restElks);
							const score = ElkScoringValueB[2] + restResult.score;
							if (score > maxScore) {
								maxScore = score;
								groups = [
									[elk, ...potentialElks],
									...restResult.groups,
								];
							}
						}
					}
				}
			});
		});

		return { score: maxScore, groups };
	}
}
