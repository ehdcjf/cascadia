import { MapData } from '../../interfaces';
import { SalmonScoring } from './salmon';

export class SalmonScoringB extends SalmonScoring {
	protected readonly SalmonScoringValue: Record<number, number> = {
		0: 0,
		1: 2,
		2: 4,
		3: 9,
		4: 11,
		5: 17,
	} as const;
	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		this.salmonGroups.forEach((salmonGroup) => {
			const salmonGroupSize = salmonGroup.length >= 5 ? 5 : salmonGroup.length;
			this.totalScore += this.SalmonScoringValue[salmonGroupSize];
			this.confirmedTiles.push(salmonGroup);
		});
	}
}
