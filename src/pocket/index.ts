import { Observable, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { tiles } from '../data';
import { TileInfo, WildLife, PocketTileInfo } from '../interfaces';
import { PocketTile } from './tile';
import { PocketToken } from './token';
import { Assets } from '../assets/index';
import { TileMesh } from '../assets/tile';
import type { Mediator } from '../mediator';
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

	private setup() {
		const tokenNums: Record<WildLife, number> = {
			bear: 20,
			salmon: 20,
			hawk: 20,
			elk: 20,
			fox: 20,
		};
		const allTokens: WildLife[] = [];
		for (const tokenName in tokenNums) {
			for (let i = 0; i < tokenNums[tokenName as WildLife]; i++) {
				allTokens.push(tokenName as WildLife);
			}
		}
		this.reserveTokens = this.suffle([...this.reserveTokens]);
		this.reserveTiles = this.suffle(tiles);

		while (this.activeTiles.length < 4) {
			const tileInfo = this.reserveTiles.shift()!;
			const tile = this.createTile(tileInfo);
			this.activeTiles.push(tile);
		}
		this.activeTiles.forEach((tile, index) => {
			tile.slideDown(index);
		});
	}

	protected suffle<T>(originArray: Array<T>): Array<T> {
		const array = originArray.slice(0);

		for (let i = array.length - 1; i > 0; i--) {
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
}
