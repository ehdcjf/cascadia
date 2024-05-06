import { MapData } from '../../interfaces';
import { ElkScoring } from './elk';
const ElkScoringValueC: Record<number, number> = {
	0: 0,
	1: 0,
	2: 4,
	3: 7,
	4: 10,
	5: 14,
	6: 18,
	7: 23,
	8: 28,
};
export class ElkScoringC extends ElkScoring {
	constructor(mapData: MapData) {
		super(mapData);
	}

	protected calculate(): void {
		for (const elkGroup of this.elkGroups) {
			const elkGroupSize = elkGroup.length > 8 ? 8 : elkGroup.length;
			if (elkGroupSize < 2) continue;

			this.totalScore += ElkScoringValueC[elkGroupSize];
			this.confirmedTiles.push(elkGroup);
		}
	}
}
