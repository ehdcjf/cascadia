import { MapData } from '../../../interfaces';
import { Queue } from '../../../utils';
const FoxScoringValueD: Record<number, number> = {
	0: 0,
	1: 5,
	2: 7,
	3: 9,
	4: 11,
};

/**
 *
 * 하나의 여우는 하나의 쌍에만 속할 수 있음.
 * 예를 들어  여우가 3마리가 뭉쳐져 있다면
 * 그 중에서 가장 효율적인 여우 한 쌍을 선택해야함.
 *
 * 같은 경우로 여우가 한줄로 4개가 있는 경우
 * 양 끝의 두 쌍[[1,2],[3,4]]을 취하는 것이 좋은지? 아니면 가운데만 취할지[1,[2,3],4]를 고민해야함.
 *
 *
 * 일단 여우 2마리 이상의 무리 전부 구한 다음.
 *
 * 2마리면 그냥 계산하고,
 * 3마리 이상이면 다시 2마리씩 그룹지어서 계산하도록 해야함.
 *
 * 여우 무리 찾는 메서드
 *
 * 무리계산하는 메서드
 *
 * 2마리 계산하는 메서드
 *
 * 그룹짓는 메서드
 *
 *
 *
 *
 */
export class FoxScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(private readonly mapData: MapData) {}

	findAllFoxGroups() {
		const allFoxGroups = [];
		const visited = new Set();
		for (const [key, mapItem] of this.mapData) {
			if (mapItem.placedToken != 'fox') continue;
			const foxGroup: string[] = [key];
			const q = new Queue();
			q.push(key);
			visited.add(key);

			while (q.size > 0) {
				const fox = q.pop();
				const neighborKeys = this.mapData.get(fox)!.neighborhood;
				for (const neighborKey of neighborKeys) {
					if (!this.mapData.has(neighborKey)) continue;
					if (visited.has(neighborKey)) continue;
					if (this.mapData.get(neighborKey)?.placedToken != 'fox') continue;
					foxGroup.push(neighborKey);
					q.push(neighborKey);
					visited.add(neighborKey);
				}
			}

			if (foxGroup.length > 1) allFoxGroups.push(foxGroup);
			return foxGroup;
		}
	}

	calculateFoxGroups() {}

	calcuateFoxPair() {}

	createSubgroupsOfFoxGroup() {}

	get score() {
		return this.totalScore;
	}
}
