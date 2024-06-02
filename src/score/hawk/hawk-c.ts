import { MapData, QRS } from '../../interfaces';
import { IHawkScoring } from './hawk';

export class HawkScoringC implements IHawkScoring {
	protected readonly HawkScoringValue = 3;
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];
	protected allHawks: string[] = [];

	constructor(mapData: MapData) {
		const allHawksQRS: QRS[] = [];

		// 모든 매 찾기
		for (const [hawk, tile] of mapData) {
			if (tile.placedToken != 'hawk') continue;
			this.allHawks.push(hawk);
			allHawksQRS.push(tile.qrs);
		}

		for (let i = 0; i < this.allHawks.length; i++) {
			const hawkA = allHawksQRS[i];
			for (let j = 0; j < this.allHawks.length; j++) {
				if (i == j) continue;
				const hawkB = allHawksQRS[j];
				const isValidLineOfSight = this.checkLineOfSight(hawkA, hawkB);
				if (isValidLineOfSight) {
					this.confirmedTiles.push([this.allHawks[i], this.allHawks[j]]);
					this.totalScore += this.HawkScoringValue;
				}
			}
		}
	}

	//  매A에서
	//  0 북동쪽으로
	//  북동쪽이라는 거는  매B의 q좌표가 더 크다는 뜻.
	//  1 동쪽으로
	//  2 남동쪽으로
	//  확인하면
	//  이중 반복문으로 모든 가시선을 확인할 수 있음.
	//  중요한거는 가시선 사이에 매가 있으면 안됨.
	private checkLineOfSight(hawkA: QRS, hawkB: QRS) {
		const hawkClone = { ...hawkA };
		const Q = Math.abs(hawkA.q - hawkB.q);
		const R = Math.abs(hawkA.r - hawkB.r);
		const S = Math.abs(hawkA.s - hawkB.s);

		if (S == 0 && Q == R && Q > 1 && hawkB.q > hawkA.q) {
			for (let i = 1; i < Q; i++) {
				hawkClone.q += 1;
				hawkClone.r -= 1;
				const tileID = `tile[${hawkClone.q}][${hawkClone.r}][${hawkClone.s}]`;
				if (this.allHawks.includes(tileID)) return false;
			}
			return true;
		} else if (R == 0 && Q == S && Q > 1 && hawkB.q > hawkA.q) {
			for (let i = 1; i < Q; i++) {
				hawkClone.q += 1;
				hawkClone.s -= 1;
				const tileID = `tile[${hawkClone.q}][${hawkClone.r}][${hawkClone.s}]`;
				if (this.allHawks.includes(tileID)) return false;
			}
			return true;
		} else if (Q == 0 && R == S && R > 1 && hawkB.r > hawkA.r) {
			for (let i = 1; i < R; i++) {
				hawkClone.r += 1;
				hawkClone.s -= 1;
				const tileID = `tile[${hawkClone.q}][${hawkClone.r}][${hawkClone.s}]`;
				if (this.allHawks.includes(tileID)) return false;
			}
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
