import { MapData } from '../../interfaces';
import { SalmonScoring } from './salmon';

export class SalmonScoringC extends SalmonScoring {
	protected readonly SalmonScoringValue: Record<number, number> = {
		3: 10,
		4: 12,
		5: 15,
	} as const;
	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		this.salmonGroups.forEach((salmonGroup) => {
			const salmonGroupSize = salmonGroup.length;

			switch (salmonGroupSize) {
				case 0:
				case 1:
				case 2:
					break;
				case 3:
				case 4:
				case 5:
					this.totalScore += this.SalmonScoringValue[salmonGroupSize];
					this.confirmedTiles.push(salmonGroup);
					break;
				default:
					this.totalScore += this.SalmonScoringValue[5];
					this.confirmedTiles.push(salmonGroup);
					break;
			}
		});
	}
}
