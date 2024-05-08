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
		for (let i = 0; i < 4; i++) {
			this.tiles.push(this.allTiles.pop()!);
		}

		this.tiles.forEach((tileInfo, i) => {
			const habitatName = tileInfo!.habitats.join('-');
			const tileMesh = this.scene.getMeshById(habitatName)!.clone(`tile${i}`, this.anchor)!;
			Tags.EnableFor(tileMesh);
			Tags.AddTagsTo(tileMesh, `tile tile${i}`);
			tileMesh.id = 'tile';
			tileMesh.visibility = 1;
			tileMesh.position.y += (i - 1.5) * 2;
			tileMesh.position.x += 0.5;
			tileMesh.metadata = tileInfo;

			tileMesh.rotation = new Vector3(Tools.ToRadians(90), Tools.ToRadians(tileInfo!.rotation), 0);
			tileMesh.scaling = new Vector3(0.7, 0.7, 0.7);
			tileMesh.renderOutline = true;
			tileMesh.outlineColor = new Color3(0, 0, 0);
			tileMesh.outlineWidth = 0;
			tileMesh.renderOverlay = true;
			tileMesh.overlayColor = Color3.Gray();
			tileMesh.overlayAlpha = 0.5;

			const wildlifeAnchor = new TransformNode(`tile${i}-anchor`, this.scene);
			const wildlife = tileInfo!.wildlife.map((anim) => {
				const meshName = anim + '-plane';
				const planeMash = this.scene.getMeshById(meshName)!.clone(`wildlife`, wildlifeAnchor)!;
				Tags.EnableFor(planeMash);
				Tags.AddTagsTo(planeMash, `tile tile${i} wildlife`);
				planeMash.overlayColor = Color3.Gray();
				planeMash.overlayAlpha = 0.5;
				planeMash.position.y += 0.11;
				// planeMash.rotation = new Vector3(0, -Tools.ToRadians(thisStartingTile.rotation), 0);
				planeMash.visibility = 1;
				return planeMash;
			});

			wildlifeAnchor.parent = tileMesh;
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
		});
	}

	protected pushTile() {}

	protected pushToken() {}

	async createAndStartAnimationAsync(
		name: string,
		target: any,
		targetProperty: string,
		framePerSecond: number,
		totalFrame: number,
		from: any,
		to: any
	) {
		return new Promise<void>((resolve) => {
			Animation.CreateAndStartAnimation(
				name,
				target,
				targetProperty,
				framePerSecond,
				totalFrame,
				from,
				to,
				Animation.ANIMATIONLOOPMODE_CONSTANT,
				undefined,
				() => {
					resolve();
				}
			);
		});
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

	public highlight(mesh: AbstractMesh) {
		this.lowlight();
		[mesh,...mesh.getChildMeshes()].forEach(v=>{
			this.hl.addMesh(v as Mesh, Color3.Green());
		})		
	}


	public lowlight() {
		this.hl.removeAllMeshes();
	}

	public async deleteToken(index: number, dir: 'right' | 'left') {
		this.tokens[index] = null;
		const token = this.scene.getMeshByName('token' + index)!;
		const end = dir == 'left' ? 2 : -2;
		await this.createAndStartAnimationAsync('tokenSlide', token, 'position.x', 60, 50, -1, end);
		token.dispose();
	}

	public async deleteTile(index: number, dir: 'right' | 'left') {
		this.tiles[index] = null;
		const tile = this.scene.getMeshByName('tile' + index)!;
		const end = dir == 'left' ? 2 : -2;
		await this.createAndStartAnimationAsync('tileSlide', tile, 'position.x', 60, 40, 0.5, end);
		tile.dispose();
	}

	public async discardFurthest() {
		const tileIndex = this.tiles.findIndex((tile) => tile != null);
		const tokenIndex = this.tokens.findIndex((token) => token != null);
		await Promise.all([this.deleteTile(tileIndex, 'left'), this.deleteToken(tokenIndex, 'left')]);
		await sleep(400);
		this.refillTokens();
		// await Promise.all([this.refillTiles(), this.refillTokens()]);
	}

	private refillTokens() {
		const aliveTokens = this.scene.getMeshesById('token');
		const tiles = aliveTokens.sort((a, b) => this.tokenNumFromName(a.name) - this.tokenNumFromName(b.name));
		while (tiles.length < 4) {
			tiles.push(this.popToken());
		}
		tiles.forEach(async (token, dest) => {
			const src = this.tokenNumFromName(token.name);
			const startY = positionY[src];
			const endY = positionY[dest];
			await this.createAndStartAnimationAsync('yslide', token, 'position.y', 60, 50, startY, endY);
			token.name = 'token' + dest;
		});

		// const this.tokens
		// 	.reduce((r, v, index) => {
		// 		if (v != null) r.push(index);
		// 		return r;
		// 	}, [] as number[])

		// 	.forEach(async (start, end) => {
		// 		const token = this.scene.getMeshByName('token' + start)!;
		// 		const startY = positionY[start];
		// 		const endY = positionY[end];
		// 		await this.createAndStartAnimationAsync(
		// 			'yslide',
		// 			token,
		// 			'position.y',
		// 			60,
		// 			50,
		// 			startY,
		// 			endY
		// 		);
		// 		this.tokens[end] = this.tokens[start];
		// 		this.tokens[start] = null;
		// 		token.name = 'token' + end;
		// 		token.metadata = { ...token.metadata, line: end };
		// 	});
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

	// private popTile() {
	// 	const tileInfo = this.allTiles.pop()!;
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
	// }

	// public refillTiles() {
	// 	// 이미 있는 토큰 아래로 당기기
	// 	const shouldPull = this.tiles.reduce((r, v, index) => {
	// 		if (v != null) r.push(index);
	// 		return r;
	// 	}, [] as number[]);

	// 	while(shouldPull.length<4){
	// 		shouldPull.push(4)
	// 	}

	// 	const shouldPullPromise = shouldPull.map(async(start, end) => {
	// 		const tile = this.scene.getMeshByName('tile' + start)?? this.;
	// 		const tileInfo = this.tiles[start]??;
	// 		tile.name = 'tile' + end;
	// 		const startY = positionY[start];
	// 		const endY = positionY[end];
	// 		await this.createAndStartAnimationAsync('yslide', tile, 'position.y', 60, 50, startY, endY);
	// 		this.tiles[end] = tileInfo;

	// 	});
	// }

	public tileNumFromName(tags: string) {
		const regex = /tile(\d+)/;
		const match = tags.match(regex)!;
		return +match[1];
	}
	public tokenNumFromName(tags: string) {
		const regex = /token(\d+)/;
		const match = tags.match(regex)!;
		return +match[1];
	}
}
