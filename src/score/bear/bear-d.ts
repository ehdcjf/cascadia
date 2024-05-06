import { MapData } from '../../interfaces';
import { BearScoring } from './bear';
const BearScoringValueD: Record<number, number> = {
	0: 0,
	1: 0,
	2: 5,
	3: 8,
	4: 13,
} as const;

export class BearScoringD extends BearScoring {
	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		for (const bearGroup of this.bearGroups) {
			const bearGroupSize = bearGroup.length;

			if (bearGroupSize >= 2 && bearGroupSize <= 4) {
				this.confirmedTiles.push(bearGroup);
				this.totalScore += BearScoringValueD[bearGroupSize];
			}
		}
	}
}
