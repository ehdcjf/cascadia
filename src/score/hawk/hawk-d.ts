import { MapData, QRS, WildLife } from '../../interfaces';
import { Queue } from '../../utils';
import { IHawkScoring } from './hawk';

export class HawkScoringD implements IHawkScoring {
	protected readonly HawkScoringValue = {
		0: 0,
		1: 4,
		2: 7,
		3: 9,
	};
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];

	constructor(protected readonly mapData: MapData) {
		// 모든 매 찾기
		const allHawks: string[] = [];
		for (const [hawk, tile] of this.mapData) {
			if (tile.placedToken != 'hawk') continue;
			allHawks.push(hawk);
		}

		const allLineOfSight = new Map<string, number>();

		for (let i = 0; i < allHawks.length; i++) {
			const hawkA = this.mapData.get(allHawks[i])!;
			const hawkAQRS = hawkA.qrs;
			for (let j = 0; j < allHawks.length; j++) {
				if (i == j) continue;
				const hawkB = this.mapData.get(allHawks[j])!;
				const hawkBQRS = hawkB.qrs;
				const lineOfSightValue = this.checkLineOfSight(hawkAQRS, hawkBQRS);
				if (lineOfSightValue > 0) {
					const lineOfSightID = `${allHawks[i]}#${allHawks[j]}`;
					allLineOfSight.set(lineOfSightID, lineOfSightValue);
				}
			}
		}

		const allLineOfSightKeys = [...allLineOfSight.keys()] as const;
		const q = new Queue<{ los: string[]; score: number }>();
		q.push({ los: [], score: 0 });

		while (q.size > 0) {
			const { los, score } = q.pop()!;
			// const visited = [...new Set(los.flatMap((key) => key.split('#')))];
			if (score > this.totalScore) {
				this.totalScore = score;
				this.confirmedTiles = los.map((key) => key.split('#'));
			}
			const visited = los.flatMap((key) => key.split('#'));
			for (const lineOfSightKey of allLineOfSightKeys) {
				const [tileA, tileB] = lineOfSightKey.split('#');
				if (visited.includes(tileA) || visited.includes(tileB)) continue;
				q.push({
					los: [...los, lineOfSightKey],
					score: score + allLineOfSight.get(lineOfSightKey)!,
				});
			}
		}
	}

	//  매A에서
	//  0 북동쪽으로    북동쪽이라는 거는  매B의 q좌표가 더 크다는 뜻.
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

		const uniqueWildLifeTypes = new Set<WildLife>();
		if (S == 0 && Q == R && Q > 1 && hawkB.q > hawkA.q) {
			for (let i = 1; i < Q; i++) {
				hawkClone.q += 1;
				hawkClone.r -= 1;
				const tileID = `tile[${hawkClone.q}][${hawkClone.r}][${hawkClone.s}]`;
				const token = this.mapData.get(tileID)?.placedToken ?? null;
				if (token == 'hawk') return 0;
				else if (token) {
					uniqueWildLifeTypes.add(token);
				}
			}
			return uniqueWildLifeTypes.size;
		} else if (R == 0 && Q == S && Q > 1 && hawkB.q > hawkA.q) {
			for (let i = 1; i < Q; i++) {
				hawkClone.q += 1;
				hawkClone.s -= 1;
				const tileID = `tile[${hawkClone.q}][${hawkClone.r}][${hawkClone.s}]`;
				const token = this.mapData.get(tileID)?.placedToken ?? null;
				if (token == 'hawk') return 0;
				else if (token) {
					uniqueWildLifeTypes.add(token);
				}
			}
			return uniqueWildLifeTypes.size;
		} else if (Q == 0 && R == S && R > 1 && hawkB.r > hawkA.r) {
			for (let i = 1; i < R; i++) {
				hawkClone.r += 1;
				hawkClone.s -= 1;
				const tileID = `tile[${hawkClone.q}][${hawkClone.r}][${hawkClone.s}]`;
				const token = this.mapData.get(tileID)?.placedToken ?? null;
				if (token == 'hawk') return 0;
				else if (token) {
					uniqueWildLifeTypes.add(token);
				}
			}
			return uniqueWildLifeTypes.size;
		} else return 0;
	}

	get score() {
		return this.totalScore;
	}

	get tiles() {
		return this.confirmedTiles;
	}
}
