import { MapData } from '../../interfaces';
import { SalmonScoring } from './salmon';

export class SalmonScoringD extends SalmonScoring {
	readonly SalmonScoringValueD = 1;
	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		for (const salmonGroup of this.salmonGroups) {
			const salmonGroupSize = salmonGroup.length;
			if (salmonGroupSize < 3) continue;
			this.confirmedTiles.push(salmonGroup);
			this.totalScore += salmonGroupSize + this.calculateNeighborhoodScore(salmonGroup);
		}
	}

	protected calculateNeighborhoodScore(salmonGroup: string[]) {
		const neighborhood = salmonGroup.reduce((r, salmon, _, a) => {
			const neighborhood = this.mapData.get(salmon)!.neighborhood;
			return r.concat(
				neighborhood.filter((neighbor) => !r.includes(neighbor) && !a.includes(neighbor))
			);
		}, [] as string[]);

		return neighborhood.filter((neighbor) => {
			const token = this.mapData.get(neighbor)!.placedToken;
			if (token == 'salmon' || !token) return false;
			return true;
		}).length;
	}
}
