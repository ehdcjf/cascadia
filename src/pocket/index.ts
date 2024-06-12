import { TransformNode, Vector3 } from '@babylonjs/core';
import { tiles } from '../data';
import { Mediator, TileInfo, WildLife } from '../interfaces';
import { PocketTile } from './tile';
import { PocketToken } from './token';
import { Assets } from '../assets';
import { GameInfo } from '../gameInfo';
import { sleep } from '../utils';

export class Pocket {
	private reserveTiles: TileInfo[] = [];
	private reserveTokens: WildLife[] = [];
	private activeTiles: PocketTile[] = [];
	private activeTokens: PocketToken[] = [];
	private pocketAnchor: TransformNode;

	constructor(private assets: Assets, private readonly mediator: Mediator, private readonly gameInfo: GameInfo) {
		this.pocketAnchor = this.assets.transformNode;
		this.pocketAnchor.position = new Vector3(100, 100, 100);
		this.setup();
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

	protected suffle<T>(originArray: Array<T>): Array<T> {
		const array = originArray.slice(0);

		for (let i = array.length - 1; i > 0; i--) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			[array[i], array[randomIndex]] = [array[randomIndex], array[i]];
		}

		return array;
	}

	private createTile(tileInfo: TileInfo) {
		const tileMesh = this.assets.pocketTile;
		tileMesh.setAnchor(this.pocketAnchor, new Vector3(0.5, 5, 0));
		return new PocketTile(tileMesh, tileInfo, this.mediator, this.gameInfo);
	}

	private createToken(tokenInfo: WildLife) {
		const tokenMesh = this.assets.pocketToken;
		tokenMesh.setAnchor(this.pocketAnchor, new Vector3(-1, 5, 0));
		return new PocketToken(tokenMesh, tokenInfo, this.mediator, this.gameInfo);
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

	private async refillTile() {
		while (this.activeTiles.length < 4) {
			const tileInfo = this.reserveTiles.shift()!;
			const tile = this.createTile(tileInfo);
			this.activeTiles.push(tile);
		}
		const tilePromise = this.activeTiles.map((tile, index) => tile.slideDown(index));
		await Promise.all(tilePromise);
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

	public cleanAllTiles() {
		this.activeTiles.forEach((tile) => tile.clean());
	}

	public cleanAllToken() {
		this.activeTokens.forEach((token) => token.clean());
	}

	public tileSelect(index: number) {
		this.activeTiles.forEach((tile) => tile.clean());
		this.activeTiles[index].select();
	}

	public tokenActiveOnly(index: number) {
		this.activeTokens.forEach((token) => token.clean());
		this.activeTokens[index].active();
	}

	public tokenInactiveToggle(index: number) {
		if (this.activeTokens[index].isSelected) {
			this.activeTokens[index].clean();
		} else {
			this.activeTokens[index].inactive();
		}
	}

	public getWildLife(index: number) {
		return this.activeTokens[index].wildlife;
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

	dispose() {
		this.pocketAnchor.dispose();
	}
}
