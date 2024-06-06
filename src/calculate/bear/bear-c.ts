import { MapData } from '../../interfaces';
import { BearScoring } from './bear';
const BearScoringValueC: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 8,
} as const;
const BearScoringValueCBonus = 3 as const;

export class BearScoringC extends BearScoring {
	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		let bonuseCheck = 0;

		for (const bearGroup of this.bearGroups) {
			const bearGroupSize = bearGroup.length;

			if (bearGroupSize >= 1 && bearGroupSize <= 3) {
				this.confirmedTiles.push(bearGroup);
				this.totalScore += BearScoringValueC[bearGroupSize];
				bonuseCheck |= 1 << (bearGroupSize - 1);
			}
		}

		if (bonuseCheck == 7) this.totalScore += BearScoringValueCBonus;
	}
}
