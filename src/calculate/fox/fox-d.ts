import { GroupResult, MapData, IScoring } from '../../interfaces';
import { Queue, qrsFromTileID } from '../../utils';

export class FoxScoringD implements IScoring {
	protected readonly FoxScoringValue: Record<number, number> = {
		0: 0,
		1: 5,
		2: 7,
		3: 9,
		4: 11,
	} as const;
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];

	constructor(protected readonly mapData: MapData) {
		const allFoxes: string[] = [];
		for (const [key, tile] of mapData) {
			if (tile.placedToken == 'fox') allFoxes.push(key);
		}
		const allFoxGroups = this.groupedFox(allFoxes);

		allFoxGroups.forEach((foxGroup) => {
			const result = this.calculateFoxGroup(foxGroup);
			this.totalScore += result.score;
			this.confirmedTiles.push(...result.groups);
		});
	}

	protected groupedFox(foxGroup: string[]) {
		const foxGroups: string[][] = [];
		const visited = new Set();
		for (const fox of foxGroup) {
			if (visited.has(fox)) continue;

			const q = new Queue<string>();
			const group: string[] = [fox];
			q.push(fox);
			visited.add(fox);
			while (q.size > 0) {
				const nowFox = q.pop()!;
				const neighborhood = this.mapData.get(nowFox)!.neighborhood;
				for (const neighbor of neighborhood) {
					if (!foxGroup.includes(neighbor)) continue;
					if (visited.has(neighbor)) continue;
					q.push(neighbor);
					group.push(neighbor);
					visited.add(neighbor);
				}
			}

			if (group.length > 1) foxGroups.push(group);
		}
		return foxGroups;
	}

	protected calculateFoxGroup(foxGroup: string[]) {
		let maxScore = 0;
		let groups: string[][] = [];
		const foxGroupSize = foxGroup.length;
		if (foxGroupSize == 2) {
			return {
				score: this.calculateNeighborhood(foxGroup),
				groups: [foxGroup],
			};
		} else {
			for (let i = 0; i < foxGroup.length - 1; i++) {
				for (let j = i + 1; j < foxGroup.length; j++) {
					const foxA = foxGroup[i];
					const foxB = foxGroup[j];
					const distance = this.calculateDistance(foxA, foxB);
					if (distance > 1) continue;
					const restFoxesGroups = this.groupedFox(
						foxGroup.filter((v) => v != foxA && v != foxB)
					);

					const foxGroups = [[foxA, foxB], ...restFoxesGroups];

					const foxGroupResult: GroupResult = foxGroups.reduce(
						(r, v) => {
							const result = this.calculateFoxGroup(v);
							r.score += result.score;
							r.groups = [...r.groups, ...result.groups];

							return r;
						},
						{ score: 0, groups: [] } as GroupResult
					);

					if (foxGroupResult.score > maxScore) {
						maxScore = foxGroupResult.score;
						groups = foxGroupResult.groups;
					}
				}
			}
		}
		return { score: maxScore, groups };
	}

	protected calculateDistance(tileA: string, tileB: string) {
		const x = qrsFromTileID(tileA);
		const y = qrsFromTileID(tileB);
		return (Math.abs(x.q - y.q) + Math.abs(x.r - y.r) + Math.abs(x.s - y.s)) / 2;
	}

	protected calculateNeighborhood(foxGroup: string[]) {
		let score = 0;

		const neighborhood: Set<string> = foxGroup.reduce((r, v) => {
			this.mapData.get(v)?.neighborhood.forEach((neighbor) => {
				if (!foxGroup.includes(neighbor)) r.add(neighbor);
			});
			return r;
		}, new Set<string>());

		const pairsOfWildlife = [...neighborhood]
			.map((key) => this.mapData.get(key)?.placedToken)
			.filter((tile) => !!tile && tile != 'fox')
			.reduce((r, v, _, a) => {
				if (!r.has(v)) return r;
				const wildlifeCount = a.filter((w) => w == v).length;
				const pairCount = Math.floor(wildlifeCount / 2);
				if (pairCount > 0) r.add(v);
				return r;
			}, new Set()).size;
		if (pairsOfWildlife > 0) {
			score += this.FoxScoringValue[pairsOfWildlife];
		}

		return score;
	}

	get score() {
		return this.totalScore;
	}

	get tiles() {
		return this.confirmedTiles;
	}
}
