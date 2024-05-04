import { MapData, QRS } from '../../../interfaces';
import { qrsFromTileID } from '../../../utils';
/**
 * 가시선 하나당 3점.
 *
 * B에서 썼던 함수를 쓰면 안될거 같고...
 *
 * 우선 매가 독립적이어야 된다는 조건은 없으니,
 *
 * 모든 매를 찾은 다음.
 *
 * 가시선 전부 찾고, 방향 같은거 있으면 더 짧은 거로
 * 여기서는  북동 동 남동 으로 3방향만 찾자.
 *
 * 확정된 가시선에 대해 [시작매, 끝매]  이런식으로 담아서 관리하면 될듯
 *
 * 0 북동쪽 방향:  q+1 ,r-1, s
 * 1 동쪽 방향:  q+1 ,r, s-1
 * 2 남동쪽 방향:  q ,r+1, s-1
 */

const HawkScoringValueC = 3;

export class HawkScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(mapData: MapData) {
		const allIsolatedHawks: string[] = [];
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
			}
		}

		const potentialHawksQRS = allIsolatedHawks.map((key) => qrsFromTileID(key));

		const confirmedHawk: Set<string> = new Set();

		for (let i = 0; i < allIsolatedHawks.length - 1; i++) {
			let isLineOfSight = false;
			if (confirmedHawk.has(allIsolatedHawks[i])) continue;
			const hawkA = potentialHawksQRS[i];
			for (let j = i + 1; j < allIsolatedHawks.length; j++) {
				const hawkB = potentialHawksQRS[j];
				if (this.checkLineOfSight(hawkA, hawkB)) {
					isLineOfSight = true;
					confirmedHawk.add(allIsolatedHawks[i]);
					confirmedHawk.add(allIsolatedHawks[j]);
					break;
				}
			}
			if (isLineOfSight) break;
		}

		this.confirmedTiles = [...confirmedHawk].map((key) => [key]);

		const confirmedHawkCount = this.confirmedTiles.length > 8 ? 8 : this.confirmedTiles.length;
		this.totalScore = HawkScoringValueB[confirmedHawkCount];
	}

	private checkLineOfSight(hawkA: QRS, hawkB: QRS) {
		const Q = Math.abs(hawkA.q - hawkB.q);
		const R = Math.abs(hawkA.r - hawkB.r);
		const S = Math.abs(hawkA.s - hawkB.s);

		if (Q == 0 && R == S) {
			const sign = Math.sign(hawkB.r-hawkA.r);
			 




		} else if (R == 0 && Q == S) {
		} else if (S == 0 && Q == R) {
		} else return false;
	}

	get score() {
		return this.totalScore;
	}
}
