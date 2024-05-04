import { MapData } from '../../../interfaces';
import { Queue } from '../../../utils';
const ElkScoringValue: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 9,
	4: 13,
};

export class ElkScoring {
	private totalScore = 0;

	constructor(private mapData: MapData) {
		const allElks: string[] = [];

		for (const [key, mapItem] of this.mapData) {
			if (mapItem.placedToken == 'elk') allElks.push(key);
		}

		const allElkGroups = this.groupElkIds(allElks);

		allElkGroups.forEach((elkGroup) => {
			this.totalScore += this.calculateElkGroup(elkGroup);
		});
	}

	private groupElkIds(elkIDs: string[]) {
		const allElkGroups: string[][] = [];
		const visited = new Set();
		for (const key of elkIDs) {
			const ellElkGroup: string[] = [];
			const q = new Queue();
			q.push(key);
			ellElkGroup.push(key);
			visited.add(key);
			while (q.size > 0) {
				const token = q.pop();
				const neighborhood = this.mapData.get(token)!.neighborhood;
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

	private searchNeighborhoodElkKeys(tokenKey: string) {
		const neighborhoodElk: string[] = [];
		const mapItem = this.mapData.get(tokenKey)!;
		const neighborTileKeys = mapItem.neighborhood;
		for (const neighborTileKey of neighborTileKeys) {
			if (!this.mapData.has(neighborTileKey)) continue;
			const neighborTile = this.mapData.get(neighborTileKey)!;
			if (neighborTile.placedToken === 'elk') neighborhoodElk.push(neighborTileKey);
		}
		return neighborhoodElk;
	}

	private calculateElkGroup(elkGroup: string[]): number {
		switch (elkGroup.length) {
			case 1:
				return ElkScoringValue[1];
			case 2:
				const [first, second] = elkGroup;
				const firstElkNeighborhood = this.searchNeighborhoodElkKeys(first);
				// 이거는 무리
				if (firstElkNeighborhood.includes(second)) {
					return ElkScoringValue[2];
				} else {
					// 이거는 따로 떨어져 있는 경우
					return ElkScoringValue[1] * 2;
				}
			default:
				const reSortedElkGroups = this.groupElkIds(elkGroup);
				if (reSortedElkGroups.length == 1) {
					return this.calculateElkGroupOverTwo(elkGroup);
				} else {
					return reSortedElkGroups.reduce((r, elkGroup) => {
						r += this.calculateElkGroup(elkGroup);
						return r;
					}, 0);
				}
		}
	}

	private calculateElkGroupOverTwo(elkGroup: string[]) {
		let maxScore = 0;
		const potentials = elkGroup.reduce((result: Array<[string, number]>, elkToken: string) => {
			const nextDirections = this.isStartingElk(elkToken);
			nextDirections.forEach((dir) => {
				result.push([elkToken, dir]);
			});
			return result;
		}, []);

		for (const [startToken, dir] of potentials) {
			let score = 0;
			const inLineElks = this.allElksInLine(startToken, dir);
			score += ElkScoringValue[4 * Math.floor(inLineElks.length / 4)];
			score += ElkScoringValue[inLineElks.length % 4];
			if (elkGroup.length > inLineElks.length) {
				const restElks = elkGroup.filter((elk) => !inLineElks.includes(elk));
				score += this.calculateElkGroup(restElks);
			}
			maxScore = Math.max(maxScore, score);
		}

		return maxScore;
	}

	private isStartingElk(elkToken: string) {
		const nextDirections: number[] = [];
		const neighborTileKeys = this.mapData.get(elkToken)!.neighborhood;
		const checkDir = [
			[0, 3],
			[4, 1],
			[5, 2],
		];

		for (const [prevElkDir, nextElkDir] of checkDir) {
			const prevElkKey = neighborTileKeys[prevElkDir];
			// 없어야 하는 곳에 엘크가 있는 경우
			if (this.mapData.get(prevElkKey)?.placedToken == 'elk') continue;
			// 있어야 하는 곳에 엘크가 없는 경우
			const nextElkKey = neighborTileKeys[nextElkDir];
			if (!this.mapData.has(nextElkKey)) continue;
			if (this.mapData.get(nextElkKey)?.placedToken != 'elk') continue;

			nextDirections.push(nextElkDir);
		}
		return nextDirections;
	}

	allElksInLine(startTokenKey: string, direction: number) {
		const standInLineTokens = [startTokenKey];
		const q = new Queue();
		q.push(startTokenKey);
		while (q.size > 0) {
			const elkTokenKey = q.pop();
			const nextToken = this.nextElkInDirection(elkTokenKey, direction);
			if (nextToken) {
				q.push(nextToken);
				standInLineTokens.push(nextToken);
			}
		}
		return standInLineTokens;
	}

	nextElkInDirection(tokenKey: string, direction: number) {
		const neighborhood = this.mapData.get(tokenKey)!.neighborhood;
		const potentialTokenKey = neighborhood[direction];
		if (!this.mapData.has(potentialTokenKey)) return false;
		const potentialToken = this.mapData.get(potentialTokenKey);
		if (potentialToken?.placedToken == 'elk') return false;
		return potentialTokenKey;
	}

	get score() {
		return this.totalScore;
	}
}
