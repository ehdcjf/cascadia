import { MapData, QRS } from '../../../interfaces';
import { qrsFromTileID } from '../../../utils';
/**
 * 가시선으로 연결된 매의 마리수만 구하면되는데,,
 *
 * 이웃에 매가 없는 매만 고르고,
 * 매 이웃 6방향으로 나아가면서 매가 연결되었으면? 그만하면됨.
 * 그럴 필요 없고,
 *
 * qrs 절대값 차이 구한 다음.
 * 두개가 같고, 하나가 0이면  가시선상에 있는거임. 가시선에 있는지 확인하는 함수 만들면 될 듯.
 *
 * 연결되어있다면. 가시선의 시작점 매, 끝점 매 모두 점수를 획득할 수 있는 매로.
 * 끝 점의 매는 확인하지 않아도됨.
 *
 *
 *
 * 0 북동쪽 방향:  q+1 ,r-1, s
 * 1 동쪽 방향:  q+1 ,r, s-1
 * 2 남동쪽 방향:  q ,r+1, s-1
 * 3 남서쪽 방향:  q-1 ,r+1, s
 * 4 서쪽 방향:  q-1 ,r, s+1
 * 5 북서쪽 방향:  q ,r-1, s+1
 */

const HawkScoringValueB: Record<number, number> = {
	0: 0,
	1: 2,
	2: 5,
	3: 9,
	4: 12,
	5: 16,
	6: 20,
	7: 24,
	8: 28,
};

export class HawkScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: MapData) {
		const allIsolatedHawks: string[] = [];
		const potentialHawksQRS: QRS[] = [];
		// 고립된 매 찾기
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken != 'hawk') continue;

			const neighborKeys = mapItem.neighborhood;
			let isIsolated = true;
			for (const nkey of neighborKeys) {
				if (!mapData.has(nkey)) continue;
				const neighborItem = mapData.get(nkey)!;
				if (neighborItem.placedToken == 'hawk') {
					isIsolated = false;
					break;
				}
			}
			if (isIsolated) {
				allIsolatedHawks.push(key);
				potentialHawksQRS.push(qrsFromTileID(key));
			}
		}

		const confirmedHawk: Set<string> = new Set();

		for (let i = 0; i < allIsolatedHawks.length - 1; i++) {
			const hawkA = potentialHawksQRS[i];
			for (let j = i + 1; j < allIsolatedHawks.length; j++) {
				const hawkB = potentialHawksQRS[j];
				if (this.checkLineOfSight(hawkA, hawkB)) {
					confirmedHawk.add(allIsolatedHawks[i]);
					confirmedHawk.add(allIsolatedHawks[j]);
				}
			}
		}

		this.confirmedTiles = [...confirmedHawk].map((key) => [key]);

		const confirmedHawkCount = this.confirmedTiles.length > 8 ? 8 : this.confirmedTiles.length;
		this.totalScore = HawkScoringValueB[confirmedHawkCount];
	}
	private checkLineOfSight(hawkA: QRS, hawkB: QRS) {
		const Q = Math.abs(hawkA.q - hawkB.q);
		const R = Math.abs(hawkA.r - hawkB.r);
		const S = Math.abs(hawkA.s - hawkB.s);

		if (Q == 0 && R == S && hawkA.r < hawkB.r) {
			return true;
		} else if (R == 0 && Q == S && hawkA.q < hawkB.q) {
			return true;
		} else if (S == 0 && Q == R && hawkA.q < hawkB.q) {
			return true;
		} else return false;
	}

	get score() {
		return this.totalScore;
	}
}
