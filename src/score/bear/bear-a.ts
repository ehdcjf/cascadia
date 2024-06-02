import { MapData } from '../../interfaces';
import { BearScoring } from './bear';
const BearScoringValueA: Record<number, number> = {
	0: 0,
	1: 4,
	2: 11,
	3: 19,
	4: 27,
};

export class BearScoringA extends BearScoring {
	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		for (const bearGroup of this.bearGroups) {
			if (bearGroup.length == 2) {
				this.confirmedTiles.push(bearGroup);
			}
		}

		this.totalScore =
			this.confirmedTiles.length >= 4
				? BearScoringValueA[4]
				: BearScoringValueA[this.confirmedTiles.length];
	}
}
