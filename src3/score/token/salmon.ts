import { MapItem } from '../../board';
import { Queue } from '../../utils';
const SalmonScoringValue: Record<number, number> = {
	1: 2,
	2: 4,
	3: 7,
	4: 11,
	5: 15,
	6: 20,
	7: 26,
};

export class SalmonScoring {
	//  이미 사용했거나 조건 충족하지 않은 연어 목록
	private usedToken: Set<string> = new Set();
	private confirmedSalmonRuns: Array<Set<string>> = [];
	private totalScore = 0;
	constructor(private mapData: Map<string, MapItem>) {
		this.calculateSalmonToken();
	}

	private searchNeighborSalmonKeys(tokenKey: string) {
		const neighborSalmons: string[] = [];

		const mapItem = this.mapData.get(tokenKey)!;
		const neighborTileKeys = mapItem.coor.neighborKeys;
		for (const neighborTileKey of neighborTileKeys) {
			if (!this.mapData.has(neighborTileKey)) continue;
			const neighborTile = this.mapData.get(neighborTileKey)!;
			if (neighborTile.placedToken === 'salmon') neighborSalmons.push(neighborTileKey);
		}
		return neighborSalmons;
	}

	private calculateSalmonToken() {
		const validSalmonTokens: Array<string> = [];

		for (const [key, mapItem] of this.mapData) {
			if (mapItem.placedToken != 'salmon') continue;

			const neighborSalmons = this.searchNeighborSalmonKeys(key);

			if (neighborSalmons.length <= 2) {
				validSalmonTokens.push(key);
			} else {
				this.usedToken.add(key);
			}
		}

		for (const mainSalmonKey of validSalmonTokens) {
			const potentialSalmonTokenIDs: Set<string> = new Set();
			if (this.usedToken.has(mainSalmonKey)) continue;

			const confirmedNeighborSalmons = this.searchNeighborSalmonKeys(mainSalmonKey).filter(
				(neighbor) => !this.usedToken.has(neighbor)
			);

			if (confirmedNeighborSalmons.length == 2) {
				const [firstNeighborKey, secondNeighborKey] = confirmedNeighborSalmons;

				// 하나만 체크해도 될듯?
				const firstNeighborhood = this.mapData.get(firstNeighborKey)!.coor.neighborKeys;
				const secondNeighborhood = this.mapData.get(secondNeighborKey)!.coor.neighborKeys;

				if (
					!firstNeighborhood.includes(secondNeighborKey) &&
					!secondNeighborhood.includes(firstNeighborKey)
				) {
					const forwardsAndBackwardsSalmonRunIDs = this.forwardsAndBackwardsSalmonRun(
						mainSalmonKey,
						confirmedNeighborSalmons
					);
					forwardsAndBackwardsSalmonRunIDs.forEach((key) => {
						potentialSalmonTokenIDs.add(key);
					});
					potentialSalmonTokenIDs;
				} else {
					[mainSalmonKey, firstNeighborKey, secondNeighborKey].forEach((tokenKey) => {
						potentialSalmonTokenIDs.add(tokenKey);
						this.usedToken.add(tokenKey);
					});
				}
			} else if (confirmedNeighborSalmons.length < 2) {
				potentialSalmonTokenIDs.add(mainSalmonKey);
				const salmonRunTokenIDs = this.salmonTokensInRun(mainSalmonKey);
				salmonRunTokenIDs.forEach((key) => {
					potentialSalmonTokenIDs.add(key);
				});
			}
			this.confirmedSalmonRuns.push(potentialSalmonTokenIDs);
		}

		this.confirmedSalmonRuns.forEach((salmonIDs) => {
			const salomInRunNums = salmonIDs.size > 7 ? 7 : salmonIDs.size;
			this.totalScore += SalmonScoringValue[salomInRunNums];
		});
	}

	private salmonTokensInRun(startKey: string) {
		const salmonRunIDs = [];
		const q = new Queue();

		salmonRunIDs.push(startKey);
		this.usedToken.add(startKey);
		q.push(startKey);

		while (q.size > 0) {
			const key = q.pop();
			const neighborSalmons = this.searchNeighborSalmonKeys(key).filter(
				(neighbor) => !this.usedToken.has(neighbor)
			);

			if (neighborSalmons.length == 1) {
				const nextSalmon = neighborSalmons[0];
				salmonRunIDs.push(nextSalmon);
				this.usedToken.add(nextSalmon);
				q.push(neighborSalmons);
			}
		}
		return salmonRunIDs;
	}

	private forwardsAndBackwardsSalmonRun(mainTokenKey: string, neighborTokens: string[]) {
		const forwardsAndBackwardsSalmonRunIDs: Set<string> = new Set();
		forwardsAndBackwardsSalmonRunIDs.add(mainTokenKey);
		this.usedToken.add(mainTokenKey);

		neighborTokens.forEach((tokenKey) => {
			this.usedToken.add(tokenKey);
			const q = new Queue();
			q.push(tokenKey);
			while (q.size > 0) {
				const salmonKey = q.pop();

				const neighborSalmons = this.searchNeighborSalmonKeys(salmonKey).filter(
					(neighbor) => !this.usedToken.has(neighbor)
				);

				if (neighborSalmons.length == 1) {
					const neighbor = neighborSalmons[0];
					forwardsAndBackwardsSalmonRunIDs.add(neighbor);
					this.usedToken.add(neighbor);
					q.push(neighbor);
				}
			}
		});

		return forwardsAndBackwardsSalmonRunIDs;
	}

	get score() {
		return this.totalScore;
	}
}
