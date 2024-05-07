import { Color3, Matrix, Scene, Tools, TransformNode, Vector3 } from '@babylonjs/core';
import { TileInfo, WildLife } from './interfaces';
import { tiles } from './data';
export class Pocket {
	tokens: WildLife[] = [];
	tiles: TileInfo[] = [];
	tfNode: TransformNode;
	nowTokens: WildLife[] = [];
	nowTiles: TileInfo[] = [];

	constructor(protected scene: Scene) {
		this.tfNode = new TransformNode('pocket-tf', this.scene);
		this.tfNode.position = new Vector3(100, 100, 100);
		this.setupTiles();
		this.setupTokens();
		for (let i = 0; i < 4; i++) {
			this.nowTokens.push(this.tokens.pop()!);
			this.nowTiles.push(this.tiles.pop()!);
		}
		this.nowTokens.forEach((wildlife, i) => {
			const tokenOrigin = this.scene.getMeshById(`${wildlife}-token`)!;
			const token = tokenOrigin.clone('token' + i, this.tfNode)!;
			token.visibility = 1;
			token.position.y += (i - 1.5) * 2;
			token.position.x -= 1;
			token.metadata = { type: 'token', wildlife: wildlife, line: i };
			token.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			token.scaling = new Vector3(0.6, 0.6, 0.6);
		});

		this.nowTiles.forEach((tileInfo, i) => {
			const habitatName = tileInfo.habitats.join('-');

			const tileMesh = this.scene.getMeshById(habitatName)!.clone(`nowtile${i}`, this.tfNode)!;
			tileMesh.id = 'readyTile';
			tileMesh.visibility = 1;
			tileMesh.position.y += (i - 1.5) * 2;
			tileMesh.position.x += 0.5;
			tileMesh.metadata = { type: 'tile', tileInfo: tileInfo, line: i };

			tileMesh.rotation = new Vector3(Tools.ToRadians(90), Tools.ToRadians(tileInfo.rotation), 0);
			tileMesh.scaling = new Vector3(0.7, 0.7, 0.7);
			tileMesh.renderOutline = true;
			tileMesh.outlineColor = new Color3(0, 0, 0);
			tileMesh.outlineWidth = 0;
			tileMesh.renderOverlay = true;
			tileMesh.overlayColor = Color3.Gray();
			tileMesh.overlayAlpha = 0.5;

			const tfNode = new TransformNode(`nowtile${i}-tf`, this.scene);
			const wildlife = tileInfo.wildlife.map((anim) => {
				const meshName = anim + '-plane';
				const planeMash = this.scene.getMeshById(meshName)!.clone(`wildlife`, tfNode)!;
				planeMash.position.y += 0.11;
				// planeMash.rotation = new Vector3(0, -Tools.ToRadians(thisStartingTile.rotation), 0);
				planeMash.visibility = 1;
				return planeMash;
			});

			tfNode.parent = tileMesh;
			tfNode.rotation = new Vector3(0, -Tools.ToRadians(tileInfo.rotation), 0);

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
		this.tokens = this.suffle(tokens);
	}

	protected setupTiles() {
		this.tiles = this.suffle(tiles);
	}

	protected suffle<T>(originArray: Array<T>): Array<T> {
		const array = originArray.slice(0);

		for (let i = array.length - 1; i > 0; i--) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			[array[i], array[randomIndex]] = [array[randomIndex], array[i]];
		}

		return array;
	}

	public getToken(index: number) {
		return this.nowTokens[index];
	}
	public getTile(index: number) {
		return this.nowTiles[index];
	}
}
