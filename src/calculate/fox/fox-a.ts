import { MapData, WildLife, IScoring } from '../../interfaces';

export class FoxScoringA implements IScoring {
	protected readonly FoxScoringValue: Record<number, number> = {
		0: 0,
		1: 1,
		2: 2,
		3: 3,
		4: 4,
		5: 5,
	} as const;
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: MapData) {
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'fox') continue;
			const neighborhood = mapItem.neighborhood;
			const uniqueWildLife: Set<WildLife> = new Set();
			for (const neighbor of neighborhood) {
				const neighborItem = mapData.get(neighbor);
				if (neighborItem?.placedToken) uniqueWildLife.add(neighborItem.placedToken);
			}
			if (uniqueWildLife.size > 0) {
				this.totalScore += this.FoxScoringValue[uniqueWildLife.size];
				this.confirmedTiles.push([key]);
			}
		}
	}

	get score() {
		return this.totalScore;
	}
	get tiles() {
		return this.confirmedTiles;
	}
}
