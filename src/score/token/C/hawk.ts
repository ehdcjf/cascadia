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

 */

const HawkScoringValueC = 3;

export class HawkScoring {
	private totalScore = 0;
	private confirmedTiles: Array<Array<string>> = [];
	constructor(private readonly mapData: MapData) {
		const allIsolatedHawks: string[] = [];

		// 일단  매 전부 찾고.
		for (const [key, mapItem] of mapData) {
			if (mapItem.placedToken == 'hawk') allIsolatedHawks.push(key);
		}

		// 매 좌표 뽑아낸다음.
		const potentialHawksQRS = allIsolatedHawks.map((key) => qrsFromTileID(key));

		for (let i = 0; i < allIsolatedHawks.length; i++) {
			const hawkA = potentialHawksQRS[i];
			for (let j = 0; j < allIsolatedHawks.length; j++) {
				if (i == j) continue;
				const hawkB = potentialHawksQRS[j];
				if (this.checkLineOfSight(hawkA, hawkB)) {
					this.confirmedTiles.push([allIsolatedHawks[i], allIsolatedHawks[j]]);
				}
			}
		}

		this.totalScore = this.confirmedTiles.length * HawkScoringValueC;
	}

	private checkLineOfSight(hawkA: QRS, hawkB: QRS) {
		const hawkClone = { ...hawkA };
		const Q = Math.abs(hawkA.q - hawkB.q);
		const R = Math.abs(hawkA.r - hawkB.r);
		const S = Math.abs(hawkA.s - hawkB.s);

		if (Q == 0 && R == S && hawkA.r < hawkB.r) {
			// 남동쪽 확인
			// 2 남동쪽 방향:  q ,r+1, s-1
			for (let i = 1; i < R; i++) {
				hawkClone.r += 1;
				hawkClone.s -= 1;
				const token = this.placedTokenFromQRS(hawkClone);
				if (token == 'hawk') return false;
			}
			return true;
		} else if (R == 0 && Q == S && hawkA.q < hawkB.q) {
			// 동쪽 확인
			// 1 동쪽 방향:  q+1 ,r, s-1
			for (let i = 1; i < Q; i++) {
				hawkClone.q += 1;
				hawkClone.s -= 1;
				const token = this.placedTokenFromQRS(hawkClone);
				if (token == 'hawk') return false;
			}
			return true;
		} else if (S == 0 && Q == R && hawkA.q < hawkB.q) {
			// 북동쪽 확인
			// 0 북동쪽 방향:  q+1 ,r-1, s
			for (let i = 1; i < Q; i++) {
				hawkClone.q += 1;
				hawkClone.r -= 1;
				const token = this.placedTokenFromQRS(hawkClone);
				if (token == 'hawk') return false;
			}
			return true;
		} else return false;
	}

	placedTokenFromQRS(hawkQRS: QRS) {
		const { q, r, s } = hawkQRS;
		const tileID = `tile[${q}][${r}][${s}]`;
		return this.mapData.get(tileID)?.placedToken ?? null;
	}

	get score() {
		return this.totalScore;
	}
}
