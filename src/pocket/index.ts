import { Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { tiles } from '../data';
import { Mediator, TileInfo, WildLife } from '../interfaces';
import { PocketTile } from './tile';
import { PocketToken } from './token';
import { TileMesh } from '../assets/tile';
import { TokenMesh } from '../assets/token';
import type { GameManager } from '../mediator';
import { sleep } from '../utils';
import { GameInfo } from '../gameInfo';

export class Pocket {
	private reserveTiles: TileInfo[] = [];
	private reserveTokens: WildLife[] = [];
	private activeTiles: PocketTile[] = [];
	private activeTokens: PocketToken[] = [];
	private pocketAnchor: TransformNode;
	constructor(private scene: Scene, private readonly mediator: Mediator, private readonly gameInfo: GameInfo) {
		this.pocketAnchor = new TransformNode('pocket-anchor', this.scene);
		this.pocketAnchor.position = new Vector3(100, 100, 100);
		this.setup();
	}

	private createTile(tileInfo: TileInfo) {
		const tile = new TileMesh(this.pocketAnchor);
		return new PocketTile(this.scene, tile, tileInfo, this.mediator, this.gameInfo);
	}

	private createToken(wildlife: WildLife) {
		const token = new TokenMesh(this.pocketAnchor, wildlife);
		return new PocketToken(this.scene, token, this.mediator, this.gameInfo);
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
		// (this.reserveTokens = this.suffle(tokens)),
		this.reserveTiles = this.suffle(tiles);
		await Promise.all([this.refillTile(), this.refillToken()]);
	}

	public async processTile(index: number) {
		const targetTile = this.activeTiles.splice(index, 1)[0];
		await targetTile.slideRight();
		const furthestTile = this.activeTiles.splice(0, 1)[0];
		await furthestTile.slideLeft();
		await this.refillTile();
	}

	public async processToken(index: number, throwToken: boolean = false) {
		const targetToken = this.activeTokens.splice(index, 1)[0];
		if (throwToken) await targetToken.slideLeft();
		else await targetToken.slideRight();
		const furthestToken = this.activeTokens.splice(0, 1)[0];
		await furthestToken.slideLeft();
		await this.refillToken();
	}

	protected suffle<T>(originArray: Array<T>): Array<T> {
		const array = originArray.slice(0);

		for (let i = array.length - 1; i >= 0; i--) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			[array[i], array[randomIndex]] = [array[randomIndex], array[i]];
		}
		return array;
	}
	public highlightTile(index: number) {
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

	public async duplicateRefill() {
		const wildlife = this.gameInfo.duplicate!;
		const duplicate = this.activeTokens.filter((v) => v.wildlife == wildlife);
		await Promise.all(duplicate.map((token) => token.slideRight()));
		await sleep(200);
		this.activeTokens = this.activeTokens.filter((v) => v.wildlife !== wildlife);
		await this.refillToken();
		// 위로 올릴 수도 있음.
		this.reserveTokens = this.suffle([...this.reserveTokens, ...duplicate.map((v) => v.wildlife!)]);
	}

	public async natureClear(selectedTokens: number[]) {
		const shouldThrow = selectedTokens.map((v) => this.activeTokens[v]);
		await Promise.all(shouldThrow.map((token) => token.slideRight()));
		await sleep(200);
		this.activeTokens = this.activeTokens.filter((_, i) => !selectedTokens.includes(i));
		await this.refillToken();
		this.reserveTokens = this.suffle([...this.reserveTokens, ...shouldThrow.map((v) => v.wildlife!)]);
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
					type: 'CAN_REFILL',
					data: wildlife as WildLife,
				});
				return;
			} else if (cnt == 4) {
				this.mediator.notifyObservers({
					type: 'DUPLICATE_ALL',
					data: wildlife as WildLife,
				});
				return;
			}
		}

		this.mediator.notifyObservers({
			type: 'TURN_START',
		});
	}
}
