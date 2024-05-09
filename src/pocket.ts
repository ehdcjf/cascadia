import {
	Color3,
	Matrix,
	Scene,
	Tags,
	Tools,
	TransformNode,
	Vector3,
	Animation,
	GlowLayer,
	Mesh,
	HighlightLayer,
	AbstractMesh,
} from '@babylonjs/core';
import { TileInfo, WildLife } from './interfaces';
import { tiles } from './data';
import { setVisibility, sleep } from './utils';
const positionY = [-3, -1, 1, 3, 5];
export class Pocket {
	allTokens: WildLife[] = [];
	allTiles: TileInfo[] = [];
	anchor: TransformNode;
	tokens: (WildLife | null)[] = [];
	tiles: (TileInfo | null)[] = [];
	hl: HighlightLayer;

	constructor(protected scene: Scene) {
		this.anchor = new TransformNode('pocket-anchor', this.scene);
		this.anchor.position = new Vector3(100, 100, 100);
		this.hl = new HighlightLayer('hl1', scene);

		this.setupTiles();
		this.setupTokens();
		this.refillTokens();
		this.refillTiles();
		// for (let i = 0; i < 4; i++) {
		// 	this.tiles.push(this.allTiles.pop()!);
		// }

		// this.tiles.forEach((tileInfo, i) => {
		// 	const habitatName = tileInfo!.habitats.join('-');
		// 	const tileMesh = this.scene.getMeshById(habitatName)!.clone(`tile${i}`, this.anchor)!;
		// 	Tags.EnableFor(tileMesh);
		// 	Tags.AddTagsTo(tileMesh, `tile tile${i}`);
		// 	tileMesh.id = 'tile';
		// 	tileMesh.visibility = 1;
		// 	tileMesh.position.y += (i - 1.5) * 2;
		// 	tileMesh.position.x += 0.5;
		// 	tileMesh.metadata = tileInfo;

		// 	tileMesh.rotation = new Vector3(Tools.ToRadians(90), Tools.ToRadians(tileInfo!.rotation), 0);
		// 	tileMesh.scaling = new Vector3(0.7, 0.7, 0.7);
		// 	tileMesh.renderOutline = true;
		// 	tileMesh.outlineColor = new Color3(0, 0, 0);
		// 	tileMesh.outlineWidth = 0;
		// 	tileMesh.renderOverlay = true;
		// 	tileMesh.overlayColor = Color3.Gray();
		// 	tileMesh.overlayAlpha = 0.5;

		// 	const wildlifeAnchor = new TransformNode(`tile${i}-anchor`, this.scene);
		// 	const wildlife = tileInfo!.wildlife.map((anim) => {
		// 		const meshName = anim + '-plane';
		// 		const planeMash = this.scene.getMeshById(meshName)!.clone(`wildlife`, wildlifeAnchor)!;
		// 		Tags.EnableFor(planeMash);
		// 		Tags.AddTagsTo(planeMash, `tile tile${i} wildlife`);
		// 		planeMash.overlayColor = Color3.Gray();
		// 		planeMash.overlayAlpha = 0.5;
		// 		planeMash.position.y += 0.11;
		// 		// planeMash.rotation = new Vector3(0, -Tools.ToRadians(thisStartingTile.rotation), 0);
		// 		planeMash.visibility = 1;
		// 		return planeMash;
		// 	});

		// 	wildlifeAnchor.parent = tileMesh;
		// 	wildlifeAnchor.rotation = new Vector3(0, -Tools.ToRadians(tileInfo!.rotation), 0);

		// 	if (wildlife.length == 2) {
		// 		wildlife[0].position.x += 0.12;
		// 		wildlife[0].position.z += 0.12;
		// 		wildlife[1].position.x -= 0.12;
		// 		wildlife[1].position.z -= 0.12;
		// 	} else if (wildlife.length == 3) {
		// 		wildlife[0].position.z -= 0.2;
		// 		wildlife[1].position.z += 0.1;
		// 		wildlife[1].position.x -= 0.2 * Math.cos(Math.PI / 6);
		// 		wildlife[2].position.x += 0.2 * Math.cos(Math.PI / 6);
		// 		wildlife[2].position.z += 0.1;
		// 	}
		// });
	}

	protected pushTile() {}

	protected pushToken() {}

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

	public highlight(mesh: AbstractMesh) {
		this.lowlight();
		[mesh, ...mesh.getChildMeshes()].forEach((v) => {
			this.hl.addMesh(v as Mesh, Color3.Green());
		});
	}

	public lowlight() {
		this.hl.removeAllMeshes();
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
		const tileIndex = this.scene
			.getMeshesById('tile')
			.map((v) => this.numFromName(v.name))
			.sort((a, b) => a - b)[0];
		const tokenIndex = this.scene
			.getMeshesById('token')
			.map((v) => this.numFromName(v.name))
			.sort((a, b) => a - b)[0];

		await Promise.all([
			this.deleteTile.call(this, tileIndex, 'left'),
			this.deleteToken.call(this, tokenIndex, 'left'),
		]);
		await sleep(400);
		this.refillTokens();
		this.refillTiles();
		// await Promise.all([this.refillTiles(), this.refillTokens()]);
	}

	private refillTiles() {
		const aliveTiles = this.scene.getMeshesById('tile');
		const tiles = aliveTiles.sort((a, b) => this.numFromName(a.name) - this.numFromName(b.name));
		while (tiles.length < 4) {
			tiles.push(this.popTile());
		}
		tiles.forEach(async (tile, dest) => {
			const src = this.numFromName(tile.name);
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
		const aliveTokens = this.scene.getMeshesById('token');
		const tokens = aliveTokens.sort((a, b) => this.numFromName(a.name) - this.numFromName(b.name));
		while (tokens.length < 4) {
			tokens.push(this.popToken());
		}
		tokens.forEach(async (token, dest) => {
			const src = this.numFromName(token.name);
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

	private popToken() {
		const wildlife = this.allTokens.pop()!;
		const tokenOrigin = this.scene.getMeshById(`${wildlife}-token`)!;
		const token = tokenOrigin.clone('token4', this.anchor)!;
		token.id = 'token';
		token.visibility = 1;
		token.position.y += (4 - 1.5) * 2;
		token.position.x -= 1;
		token.metadata = wildlife;
		token.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
		token.scaling = new Vector3(0.6, 0.6, 0.6);
		return token;
	}

	private popTile() {
		const tileInfo = this.allTiles.pop()!;
		const habitatName = tileInfo!.habitats.join('-');
		const tile = this.scene.getMeshById(habitatName)!.clone(`tile4`, this.anchor)!;
		tile.id = 'tile';
		tile.visibility = 1;
		tile.position.y += (4 - 1.5) * 2;
		tile.position.x += 0.5;
		tile.metadata = tileInfo;

		tile.rotation = new Vector3(Tools.ToRadians(90), Tools.ToRadians(tileInfo!.rotation), 0);
		tile.scaling = new Vector3(0.7, 0.7, 0.7);

		const wildlifeAnchor = new TransformNode(`tile-anchor`, this.scene);
		const wildlife = tileInfo!.wildlife.map((anim) => {
			const meshName = anim + '-plane';
			const planeMash = this.scene.getMeshById(meshName)!.clone(`wildlife`, wildlifeAnchor)!;
			planeMash.position.y += 0.11;
			planeMash.visibility = 1;
			return planeMash;
		});

		wildlifeAnchor.parent = tile;
		wildlifeAnchor.rotation = new Vector3(0, -Tools.ToRadians(tileInfo!.rotation), 0);

		if (wildlife.length == 2) {
			wildlife[0].position.x += 0.12;
			wildlife[0].position.z += 0.12;
			wildlife[1].position.x -= 0.12;
			wildlife[1].position.z -= 0.12;
		} else if (wildlife.length == 3) {
			wildlife[0].position.z -= 0.2;
			wildlife[1].position.z += 0.1;
			wildlife[1].position.x -= 0.2 * Math.cos(Math.PI / 6);
			wildlife[2].position.x += 0.2 * Math.cos(Math.PI / 6);
			wildlife[2].position.z += 0.1;
		}
		return tile;
	}

	public numFromName(tags: string) {
		const regex = /(\d)$/;
		const match = tags.match(regex)!;
		return +match[1];
	}
}
