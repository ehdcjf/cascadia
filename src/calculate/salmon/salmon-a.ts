import { MapData } from '../../interfaces';
import { SalmonScoring } from './salmon';

export class SalmonScoringA extends SalmonScoring {
	protected readonly SalmonScoringValue: Record<number, number> = {
		1: 2,
		2: 4,
		3: 7,
		4: 11,
		5: 15,
		6: 20,
		7: 26,
	} as const;

	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		this.salmonGroups.forEach((salmonGroup) => {
			const salmonGroupSize = salmonGroup.length >= 7 ? 7 : salmonGroup.length;
			this.totalScore += this.SalmonScoringValue[salmonGroupSize];
			this.confirmedTiles.push(salmonGroup);
		});
	}
}
