import { MapData, QRS, WildLife } from '../../../interfaces';
import { Queue, qrsFromTileID } from '../../../utils';
/**
 * Score for each pair of hawks,
 * an increasing number of points based on the number of unique animal types between them (not including other hawks).
 * Each hawk may only be part of one pair
 */
const HawkScoringValueD = {
	1: 3,
	2: 5,
	3: 7,
	4: 7,
	5: 7,
	6: 7,
};

type QueueItem = {
	potentialHawks: string[];
	score: number;
	confirmedHawks: string[][];
};

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

		for (let i = 0; i < allIsolatedHawks.length; i++) {
			for (let j = 0; j < allIsolatedHawks.length; j++) {
				if (i == j) continue;
				if (this.checkBetween(allIsolatedHawks[i], allIsolatedHawks[j])) {
					this.confirmedTiles.push([allIsolatedHawks[i], allIsolatedHawks[j]]);
				}
			}
		}

		this.calculateHawkValue(allIsolatedHawks);
	}

	private calculateHawkValue(allHawks: string[]) {
		const q = new Queue<QueueItem>();
		const firstItem: QueueItem = { potentialHawks: allHawks, score: 0, confirmedHawks: [] };

		q.push(firstItem);

		while (q.size > 0) {
			const { potentialHawks: hawks, score, confirmedHawks } = q.pop()!;
			if (score > this.totalScore) {
				this.totalScore = score;
				this.confirmedTiles = confirmedHawks;
			}

			for (let i = 0; i < hawks.length; i++) {
				const hawkA = hawks[i];
				for (let j = 0; j < hawks.length; j++) {
					if (i == j) continue;
					const hawkB = hawks[j];
					const between = new Set(this.checkBetween(hawkA, hawkB));
					if (between.size > 0) {
						const newScore = score + HawkScoringValueD[between.size];
						const newHawks = hawks.filter((v) => v != hawkA && v != hawkB);
						const newConfirmedHawks = [...confirmedHawks, [hawkA, hawkB]];
						q.push({
							potentialHawks: newHawks,
							score: newScore,
							confirmedHawks: newConfirmedHawks,
						});
					}
				}
			}
		}
	}

	private checkBetween(hawkA: string, hawkB: string) {
		const route: (WildLife | null)[] = [];
		const hawkAqrs = this.mapData.get(hawkA)!.qrs;
		const hawkBqrs = this.mapData.get(hawkB)!.qrs;
		const hawkClone = { ...hawkAqrs };
		const Q = Math.abs(hawkAqrs.q - hawkBqrs.q);
		const R = Math.abs(hawkAqrs.r - hawkBqrs.r);
		const S = Math.abs(hawkAqrs.s - hawkBqrs.s);

		if (Q == 0 && R == S && hawkAqrs.r < hawkBqrs.r) {
			// 남동쪽 확인
			// 2 남동쪽 방향:  q ,r+1, s-1
			for (let i = 1; i < R; i++) {
				hawkClone.r += 1;
				hawkClone.s -= 1;
				const token = this.placedTokenFromQRS(hawkClone);
				if (token == 'hawk') return [];
				else route.push(token);
			}
		} else if (R == 0 && Q == S && hawkAqrs.q < hawkBqrs.q) {
			// 동쪽 확인
			// 1 동쪽 방향:  q+1 ,r, s-1
			for (let i = 1; i < Q; i++) {
				hawkClone.q += 1;
				hawkClone.s -= 1;
				const token = this.placedTokenFromQRS(hawkClone);
				if (token == 'hawk') return [];
				else route.push(token);
			}
		} else if (S == 0 && Q == R && hawkAqrs.q < hawkBqrs.q) {
			// 북동쪽 확인
			// 0 북동쪽 방향:  q+1 ,r-1, s
			for (let i = 1; i < Q; i++) {
				hawkClone.q += 1;
				hawkClone.r -= 1;
				const token = this.placedTokenFromQRS(hawkClone);
				if (token == 'hawk') return [];
				else route.push(token);
			}
		}
		return route;
	}

	private placedTokenFromQRS(hawkQRS: QRS) {
		const { q, r, s } = hawkQRS;
		const tileID = `tile[${q}][${r}][${s}]`;
		return this.mapData.get(tileID)?.placedToken ?? null;
	}

	get score() {
		return this.totalScore;
	}
}
