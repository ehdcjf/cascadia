import { tiles } from '../data';
import { WildLife } from '../interfaces';
import { PocketTile } from './tile';
import { PocketToken } from './token';

export class Pocket {
	private allTiles = tiles;
	private allTokens: WildLife[] = [];
	private tiles: PocketTile[] = [];
	private tokens: PocketToken[] = [];

	constructor() {
		this.setupTiles();
		this.setupTokens();
	}
	private setupTiles() {
		this.allTiles = this.suffle(tiles);
	}
	private setupTokens() {
		const tokenNums: Record<WildLife, number> = {
			bear: 20,
			salmon: 20,
			hawk: 20,
			elk: 20,
			fox: 20,
		};
		const tokens: WildLife[] = [];
		for (const tokenName in tokenNums) {
			for (let i = 0; i < tokenNums[tokenName as WildLife]; i++) {
				tokens.push(tokenName as WildLife);
			}
		}
		this.suffleTokens();
	}

	private suffleTokens(popedTokens = [] as WildLife[]) {
		this.allTokens = this.suffle([...this.allTokens, ...popedTokens]);
	}

	protected suffle<T>(originArray: Array<T>): Array<T> {
		const array = originArray.slice(0);

		for (let i = array.length - 1; i > 0; i--) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			[array[i], array[randomIndex]] = [array[randomIndex], array[i]];
		}

		return array;
	}
}
