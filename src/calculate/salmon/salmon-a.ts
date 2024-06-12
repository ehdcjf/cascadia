import { MapData } from '../../interfaces';
import { SalmonScoring } from './salmon';

export class SalmonScoringA extends SalmonScoring {
	protected readonly SalmonScoringValue: Record<number, number> = {
		1: 2,
		2: 5,
		3: 8,
		4: 12,
		5: 16,
		6: 20,
		7: 25,
	} as const;

	constructor(mapData: MapData) {
		super(mapData);
		this.calculate();
	}

	protected calculate(): void {
		this.salmonGroups.forEach((salmonGroup) => {
			const salmonGroupSize = salmonGroup.length >= 7 ? 7 : salmonGroup.length;
			console.log(salmonGroup);
			console.log(this.SalmonScoringValue);
			console.log(salmonGroupSize);
			this.totalScore += this.SalmonScoringValue[salmonGroupSize];
			this.confirmedTiles.push(salmonGroup);
		});
	}
}
