import { Observable, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { tiles } from '../data';
import { TileInfo, WildLife, PocketTileInfo, MediatorEventType } from '../interfaces';
import { PocketTile } from './tile';
import { PocketToken } from './token';
import { TileMesh } from '../assets/tile';
import { TokenMesh } from '../assets/token';
import type { Mediator } from '../mediator';
import { sleep } from '../utils';

export class Pocket {
	private reserveTiles: TileInfo[] = [];
	private reserveTokens: WildLife[] = [];
	private activeTiles: PocketTile[] = [];
	private activeTokens: PocketToken[] = [];
	private pocketAnchor: TransformNode;
	constructor(private scene: Scene, private mediator: Mediator) {
		this.pocketAnchor = new TransformNode('pocket-anchor', this.scene);
		this.pocketAnchor.position = new Vector3(100, 100, 100);
		this.setup();
	}

	private createTile(tileInfo: TileInfo) {
		const tile = new TileMesh(this.pocketAnchor);
		return new PocketTile(this.scene, tile, tileInfo, this.mediator);
	}

	private createToken(wildlife: WildLife) {
		const token = new TokenMesh(this.pocketAnchor, wildlife);
		return new PocketToken(this.scene, token, this.mediator);
	}

	private async setup() {
		const tokenNums: Record<WildLife, number> = {
			bear: 20,
			elk: 20,
			fox: 20,
			hawk: 20,
			salmon: 20,
		};
		const tokens: WildLife[] = [];
		for (const tokenName in tokenNums) {
			for (let i = 0; i < tokenNums[tokenName as WildLife]; i++) {
				tokens.push(tokenName as WildLife);
			}
		}
		this.reserveTokens = this.suffle(tokens);
		// this.reserveTokens = ['bear', 'bear', 'bear', 'fox', ...tokens];
		this.reserveTiles = this.suffle(tiles);
		await Promise.all([this.refillTile(), this.refillToken()]);
	}

	protected suffle<T>(originArray: Array<T>): Array<T> {
		const array = originArray.slice(0);

		for (let i = array.length - 1; i >= 0; i--) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			[array[i], array[randomIndex]] = [array[randomIndex], array[i]];
		}

		return array;
	}
	public selectTile(index: number) {
		this.activeTiles.forEach((tile) => tile.hideEdge());
		this.activeTiles[index].showEdge();
	}
	public cleanAllTiles() {
		this.activeTiles.forEach((tile) => tile.hideEdge());
	}

	toggleToken(index: number, value: 1 | 2) {
		this.activeTokens[index].toggle(value);
	}

	selectTokenOnly(index: number, value: 1 | 2) {
		this.activeTokens.forEach((token) => token.toggle(0));
		this.activeTokens[index].toggle(value);
	}

	getWildLife(index: number) {
		return this.activeTokens[index].wildlife;
	}

	public async forcedShuffle(wildlife: WildLife) {
		const throwToken = this.activeTokens.filter((token) => token.wildlife == wildlife);
		await Promise.all(throwToken.map((token) => token.slideRight()));
		await sleep(200);
		this.activeTokens = this.activeTokens.filter((token) => token.wildlife !== wildlife);

		this.reserveTokens = this.suffle([
			...this.reserveTokens,
			...throwToken.map((token) => token.wildlife!),
		]);

		await this.refillToken();
	}

	public async complete(tileIndex: number, tokenIndex: number, throwToken = false) {
		const targetTile = this.activeTiles.splice(tileIndex, 1)[0];
		const targetToken = this.activeTokens.splice(tokenIndex, 1)[0];
		const myPick = throwToken
			? [targetTile.slideRight(), targetToken.slideLeft()]
			: [targetTile.slideRight(), targetToken.slideRight()];
		await Promise.all(myPick);
		const furthestTile = this.activeTiles.splice(0, 1)[0];
		const furthestToken = this.activeTokens.splice(0, 1)[0];
		await sleep(200);
		const discard = [furthestTile.slideLeft(), furthestToken.slideLeft()];
		await Promise.all(discard);
		await Promise.all([this.refillTile(), this.refillToken()]);
	}

	private check() {
		const wildlifes = {} as Record<WildLife, number>;

		for (let i = 0; i < 4; i++) {
			const wildlife = this.activeTokens[i].wildlife!;
			if (!wildlifes[wildlife]) wildlifes[wildlife] = 1;
			else wildlifes[wildlife]++;
		}

		for (const wildlife in wildlifes) {
			const cnt = wildlifes[wildlife as WildLife];
			if (cnt == 3) {
				this.mediator.notifyObservers({
					type: MediatorEventType.DUPLICATE_THREE,
				});
				return;
			} else if (cnt == 4) {
				this.mediator.notifyObservers({
					type: MediatorEventType.DUPLICATE_ALL,
					data: wildlife as WildLife,
				});
				return;
			}
		}

		this.mediator.notifyObservers({
			type: MediatorEventType.VALID_TOKEN,
		});
	}

	private async refillTile() {
		while (this.activeTiles.length < 4) {
			const tileInfo = this.reserveTiles.shift()!;
			const tile = this.createTile(tileInfo);
			this.activeTiles.push(tile);
		}

		const tilePromise = this.activeTiles.map((tile, index) => tile.slideDown(index));

		await Promise.all(tilePromise);
	}

	private async refillToken() {
		while (this.activeTokens.length < 4) {
			const wildlife = this.reserveTokens.shift()!;
			const token = this.createToken(wildlife);
			this.activeTokens.push(token);
		}
		const tokenPromise = this.activeTokens.map((token, index) => token.slideDown(index));
		await Promise.all(tokenPromise);
		this.check();
	}
}
