import { Scene, Tools, TransformNode, Vector3, Animation, AbstractMesh } from '@babylonjs/core';
import { TileInfo, WildLife } from './interfaces';
import { tiles } from './data';
import { numFromName, sleep } from './utils';
import { Assets } from './assets';
const positionY = [-3, -1, 1, 3, 5];

export class Pocket {
	allTokens: WildLife[] = [];
	allTiles: TileInfo[] = [];
	anchor: TransformNode;
	tokens: (WildLife | null)[] = [];
	tiles: (TileInfo | null)[] = [];
	tileEdges: AbstractMesh[] = [];

	constructor(protected scene: Scene, private assets: Assets) {
		this.anchor = new TransformNode('pocket-anchor', this.scene);
		this.anchor.position = new Vector3(100, 100, 100);

		this.setupTiles();
		this.setupTokens();
		this.refillTokens();
		this.refillTiles();
		this.setTileEdge();
	}
	private setTileEdge() {
		positionY.forEach((y, i) => {
			const tileEdge = this.scene.getMeshById('tile-edge')!.clone('edge' + i, this.anchor)!;
			tileEdge.id = 'edge';
			tileEdge.position = new Vector3(0.5, y, 0);
			tileEdge.scaling = new Vector3(0.7, 0.7, 0.7);
			tileEdge.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
			tileEdge.material = this.assets.tokenEdgeMat['none'];
			tileEdge.setEnabled(true);
			this.tileEdges.push(tileEdge);
		});
	}

	public cleanEdge() {
		this.scene.getMeshesById('edge').forEach((mesh) => {
			mesh.material = this.assets.tokenEdgeMat['none'];
		});
	}

	public paintEdge(index: number, color: 'red' | 'yellow' | 'none') {
		this.scene.getMeshByName('edge' + index)!.material = this.assets.tokenEdgeMat[color];
	}

	protected setupTokens() {
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
		this.allTokens = this.suffle(tokens);
	}

	protected setupTiles() {
		this.allTiles = this.suffle(tiles);
	}

	protected suffle<T>(originArray: Array<T>): Array<T> {
		const array = originArray.slice(0);

		for (let i = array.length - 1; i > 0; i--) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			[array[i], array[randomIndex]] = [array[randomIndex], array[i]];
		}

		return array;
	}

	public async deleteToken(index: number, dir: 'right' | 'left') {
		const token = this.scene.getMeshByName('token' + index)!;
		const end = dir == 'left' ? 2 : -2;
		await Animation.CreateAndStartAnimation(
			'deleteTokenAnim',
			token,
			'position.x',
			60,
			50,
			-1,
			end,
			Animation.ANIMATIONLOOPMODE_CONSTANT
		)!.waitAsync();
		token.dispose();
	}

	public async deleteTile(index: number, dir: 'right' | 'left') {
		const tile = this.scene.getMeshByName('tile' + index)!;
		const end = dir == 'left' ? 2 : -2;
		await Animation.CreateAndStartAnimation(
			'deleteTileAnim',
			tile,
			'position.x',
			60,
			40,
			0.5,
			end,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			undefined,
			() => {},
			this.scene
		)!.waitAsync();

		tile.dispose();
	}

	public async discardFurthest() {
		const furthestTileIndex = this.scene
			.getMeshesById('tile')
			.map((v) => numFromName(v.name))
			.sort((a, b) => a - b)[0];
		const furthestTokenIndex = this.scene
			.getMeshesById('token')
			.map((v) => numFromName(v.name))
			.sort((a, b) => a - b)[0];

		await Promise.all([
			this.deleteTile.call(this, furthestTileIndex, 'left'),
			this.deleteToken.call(this, furthestTokenIndex, 'left'),
		]);
		await sleep(400);
		this.refillTokens();
		this.refillTiles();
		// await Promise.all([this.refillTiles(), this.refillTokens()]);
	}

	private popToken() {
		const wildlife = this.allTokens.pop()!;

		// const token = this.pocketToken.clone('token4', this.anchor)!;
		const token = this.assets.cloneToken(this.anchor, 'token', 'token4', wildlife, new Vector3(-1, 5, 0));
		token.metadata = wildlife;
		token.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
		token.scaling = new Vector3(0.6, 0.6, 0.6);
		return token;
	}

	private popTile() {
		const tileInfo = this.allTiles.pop()!;

		const tile = this.assets.cloneTile(this.anchor, 'tile', 'tile4', tileInfo, new Vector3(0.5, 5, 0));
		tile.metadata = tileInfo;

		tile.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
		tile.scaling = new Vector3(0.7, 0.7, 0.7);
		return tile;
	}

	private refillTiles() {
		const aliveTiles = this.scene.getMeshesById('tile');
		const tiles = aliveTiles.sort((a, b) => numFromName(a.name) - numFromName(b.name));
		while (tiles.length < 4) {
			tiles.push(this.popTile());
		}
		tiles.forEach(async (tile, dest) => {
			const src = numFromName(tile.name);
			const startY = positionY[src];
			const endY = positionY[dest];

			await Animation.CreateAndStartAnimation(
				'refillTile',
				tile,
				'position.y',
				60,
				50,
				startY,
				endY,
				Animation.ANIMATIONLOOPMODE_CONSTANT
			)!.waitAsync();

			tile.name = 'tile' + dest;
		});
	}

	public refillTokens() {
		const aliveTokens = this.scene.getMeshesById('token')!;
		const tokens = aliveTokens.sort((a, b) => numFromName(a.name) - numFromName(b.name));

		while (tokens.length < 4) {
			tokens.push(this.popToken());
		}

		tokens.forEach(async (token, dest) => {
			const src = numFromName(token.name);
			const startY = positionY[src];
			const endY = positionY[dest];
			await Animation.CreateAndStartAnimation(
				'refillToken',
				token,
				'position.y',
				60,
				50,
				startY,
				endY,
				Animation.ANIMATIONLOOPMODE_CONSTANT
			)!.waitAsync();
			token.name = 'token' + dest;
		});
	}
}
