import { MapData } from '../../interfaces';
import { BearScoring } from './bear';
const BearScoringValueB = 10;

export class BearScoringB extends BearScoring {
	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		for (const bearGroup of this.bearGroups) {
			if (bearGroup.length == 3) {
				this.confirmedTiles.push(bearGroup);
			}
		}
		this.totalScore = BearScoringValueB * this.confirmedTiles.length;
	}
}
