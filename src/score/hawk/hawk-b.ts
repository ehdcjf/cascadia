import { MapData, QRS } from '../../interfaces';
import { IHawkScoring } from './hawk';

export class HawkScoringB implements IHawkScoring {
	protected readonly HawkScoringValue: Record<number, number> = {
		0: 0,
		1: 2,
		2: 5,
		3: 9,
		4: 12,
		5: 16,
		6: 20,
		7: 24,
		8: 28,
	} as const;
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];
	constructor(mapData: MapData) {
		const potentialHawks: string[] = [];
		const potentialHawksQRS: QRS[] = [];

		// 고립된 매 찾기
		for (const [hawk, tile] of mapData) {
			if (tile.placedToken != 'hawk') continue;

			const neighborhood = tile.neighborhood;
			let isIsolated = true;
			for (const neighbor of neighborhood) {
				const token = mapData.get(neighbor)!.placedToken;
				if (token == 'hawk') {
					isIsolated = false;
					break;
				}
			}

			if (isIsolated) {
				potentialHawks.push(hawk);
				potentialHawksQRS.push(tile.qrs);
			}
		}

		// 가시선을 가지고 있는 매 찾기
		const confirmedHawk: Set<string> = new Set();
		for (let i = 0; i < potentialHawks.length - 1; i++) {
			if (confirmedHawk.has(potentialHawks[i])) continue;
			const hawkA = potentialHawksQRS[i];

			for (let j = i + 1; j < potentialHawks.length; j++) {
				const hawkB = potentialHawksQRS[j];
				if (this.checkLineOfSight(hawkA, hawkB)) {
					confirmedHawk.add(potentialHawks[i]);
					confirmedHawk.add(potentialHawks[j]);
					break;
				}
			}
		}

		this.confirmedTiles = [...confirmedHawk].map((key) => [key]);
		const confirmedHawkCount = this.confirmedTiles.length > 8 ? 8 : this.confirmedTiles.length;
		this.totalScore = this.HawkScoringValue[confirmedHawkCount];
	}
	private checkLineOfSight(hawkA: QRS, hawkB: QRS) {
		const Q = Math.abs(hawkA.q - hawkB.q);
		const R = Math.abs(hawkA.r - hawkB.r);
		const S = Math.abs(hawkA.s - hawkB.s);

		if (Q == 0 && R == S) {
			return true;
		} else if (R == 0 && Q == S) {
			return true;
		} else if (S == 0 && Q == R) {
			return true;
		} else return false;
	}

	get score() {
		return this.totalScore;
	}

	get tiles() {
		return this.confirmedTiles;
	}
}
