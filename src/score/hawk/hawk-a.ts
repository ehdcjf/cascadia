import { MapData } from '../../interfaces';
import { IHawkScoring } from './hawk';

export class HawkScoringA implements IHawkScoring {
	protected readonly HawkScoringValue: Record<number, number> = {
		0: 0,
		1: 2,
		2: 5,
		3: 8,
		4: 11,
		5: 14,
		6: 18,
		7: 22,
		8: 26,
	} as const;
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];

	constructor(mapData: MapData) {
		for (const [hawk, tile] of mapData) {
			if (tile.placedToken != 'hawk') continue;

			const neighborhood = tile.neighborhood;
			let isIsolated = true;
			for (const neighbor of neighborhood) {
				const token = mapData.get(neighbor)!.placedToken;
				if (token == 'hawk') {
					isIsolated = false;
					break;
				}
			}
			if (isIsolated) this.confirmedTiles.push([hawk]);
		}

		const hawkCount = this.confirmedTiles.length > 8 ? 8 : this.confirmedTiles.length;

		this.totalScore = this.HawkScoringValue[hawkCount];
	}

	get score() {
		return this.totalScore;
	}

	get tiles() {
		return this.confirmedTiles;
	}
}
