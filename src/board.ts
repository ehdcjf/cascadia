import {
	AbstractMesh,
	ActionManager,
	Color3,
	Scene,
	StandardMaterial,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { startingTiles } from '../src2/data';
import { Habitat, Tile, TileInfo, TileKey, TokenKey, WildLife } from './interfaces';
import { TileScoring } from './score/tile';
import { MaterialManager } from './material';
const rotationIndexes = {
	positive: [0, 60, 120, 180, 240, 300],
	negative: [0, -300, -240, -180, -120, -60],
};

const H = 1.5;
const W = Math.cos(Math.PI / 6);

export class Board {
	// protected mapData: MapData = new Map();
	public mapData: Map<string, Tile> = new Map();
	protected possiblePath: Map<string, AbstractMesh> = new Map();
	public readonly anchor: TransformNode;

	constructor(protected scene: Scene, private readonly material: MaterialManager, private action: any) {
		this.anchor = new TransformNode('board-anchor', this.scene);
		this.init();
		// const x = new TileScoring(this.mapData);
	}

	private init() {
		const N = 20;
		const tile = this.scene.getMeshByName('tile')!;
		tile.overlayAlpha = 0.3;
		tile.overlayColor = Color3.Yellow();
		tile.outlineColor = Color3.Black();
		tile.outlineWidth = 0.00001;
		tile.renderOutline = true;
		const token = this.scene.getMeshByName('token')!;

		// const tileWrapper = this.scene.getMeshByName('tile-wrapper')!;
		// const redMat = new StandardMaterial('red-mat', this.scene);
		// redMat.diffuseColor = new Color3(1, 1, 0);
		// redMat.specularColor = new Color3(0, 0, 0);
		// tileWrapper.material = redMat;
		// tileWrapper.visibility = 1;
		// return;

		token.setEnabled(false);

		const tokenPosistion = [
			new Vector3(0, 0.11, 0),
			new Vector3(-0.15, 0.11, 0.15),
			new Vector3(0.15, 0.11, -0.15),
			new Vector3(0, 0.11, -0.25),
			new Vector3(-0.25 * Math.cos(Math.PI / 6), 0.11, 0.125),
			new Vector3(0.25 * Math.cos(Math.PI / 6), 0.11, 0.125),
		];
		for (let q = -N; q <= N; q++) {
			const r1 = Math.max(-N, -q - N);
			const r2 = Math.min(N, -q + N);
			for (let r = r1; r <= r2; r++) {
				const s = -q - r;
				const tileID = this.tileIDFromQRS(q, r, s);
				const blank = tile.clone(tileID, this.anchor)!;
				blank.id = 'blank';
				blank.position = this.tileVectorFromQRS(q, r);
				blank.visibility = 1;
				blank.material = this.material.tile.blank;
				const tileAnchor = new TransformNode(tileID, this.scene);
				tileAnchor.parent = blank;
				tokenPosistion.forEach((pos, i) => {
					const emptyToken = token.clone(tileID + `[${i}]`, tileAnchor)!;
					emptyToken.position = pos;
					emptyToken.scaling = new Vector3(0.4, 0.1, 0.4);
					emptyToken.visibility = 1;
				});
			}
		}
		this.setInitialTiles();
	}

	setInitialTiles() {
		const randomStartingTileID = Math.floor(Math.random() * 5);
		const startingTile = startingTiles[randomStartingTileID];
		[
			[0, 0, 0],
			[0, 1, -1],
			[-1, 1, 0],
		].forEach(([q, r, s], i) => {
			const thisStartingTile = startingTile[i];
			const targetTileID = this.tileIDFromQRS(q, r, s);
			this.drawHabitat(thisStartingTile, targetTileID, thisStartingTile.rotation);
			this.setTile(thisStartingTile, targetTileID, thisStartingTile.rotation);
		});
	}

	resetPossiblePathMaterial() {
		const blankMat = this.scene.getMeshById('blank')!.material;

		this.scene
			.getMeshesById('blank')
			.filter((v) => v.visibility == 1)
			.forEach((mesh) => {
				mesh.getChildren().forEach((chMesh) => chMesh.dispose());
				mesh.material = blankMat;
			});
	}

	drawHabitat(tileInfo: TileInfo, tileID: string, rotation = 0) {
		// UI
		const tile = this.scene.getMeshByName(tileID)!;

		// targetTileMesh.visibility = 1;

		const tileKey = tileInfo.habitats.join('-') as TileKey;
		tile.material = this.material.tile[tileKey];
		tile.rotation = new Vector3(0, Tools.ToRadians(rotation), 0);

		const wildLifeSize = tileInfo.wildlife.length;
		const startIndex = (1 << (wildLifeSize - 1)) - 1;

		const wildLifeMeshes = tile.getChildMeshes();
		wildLifeMeshes.forEach((mesh) => mesh.setEnabled(false));
		tileInfo.wildlife.forEach((v: TokenKey, i) => {
			// wildLifeMeshes[startIndex + i].setVerticesData(this.uvData.tokenIndex, this.uvData.token[v]);
			wildLifeMeshes[startIndex + i].material = this.material.token[v];
			wildLifeMeshes[startIndex + i].setEnabled(true);
		});

		tile.getChildTransformNodes()[0].rotation = new Vector3(0, -Tools.ToRadians(rotation), 0);

		tile.renderingGroupId = 0;
		tile.getChildMeshes().forEach((mesh) => {
			mesh.renderingGroupId = 0;
		});
	}

	public drawPossiblePaths(tileID: string) {
		this.getNeighborTileIDs(tileID).forEach((neighborTileID) => {
			if (!this.mapData.has(neighborTileID)) {
				const neighbor = this.scene.getMeshByName(neighborTileID)!;
				neighbor.renderOverlay = true;
			} else {
				console.log(neighborTileID);
			}
			// neighborMesh.renderingGroupId = 0;
		});
	}

	private getRotationIndex(rotation: number) {
		if (rotation >= 360) rotation %= 360;
		else if (rotation <= -360) rotation %= -360;
		const sign = Math.sign(rotation) != -1 ? 'positive' : 'negative';
		return rotationIndexes[sign].indexOf(rotation);
	}

	private getHabitatSides(habitats: Array<Habitat>, rotation: number) {
		const habitatSides = new Array(6);
		if (habitats.length == 1) {
			habitatSides.fill(habitats[0]);
		} else {
			const [h1, h2] = habitats;
			let currentHabitat = h1;
			let habitatIndex = this.getRotationIndex(rotation);

			for (let i = 0; i < 6; i++) {
				habitatSides[habitatIndex] = currentHabitat;
				habitatIndex++;
				if (habitatIndex == 6) habitatIndex = 0;
				if (i == 2) currentHabitat = h2;
			}
		}
		return habitatSides;
	}

	public setTile(tileInfo: TileInfo, tileID: string, rotation: number) {
		const mesh = this.scene.getMeshByName(tileID)!;
		mesh.id = 'habitat';
		mesh.metadata = tileInfo.wildlife;
		const tile: Tile = {
			tileNum: this.mapData.size + 1,
			placedToken: null,
			habaitats: tileInfo.habitats,
			wildlife: tileInfo.wildlife,
			habitatSides: this.getHabitatSides(tileInfo.habitats, rotation),
			neighborhood: this.getNeighborTileIDs(tileID),
			qrs: this.qrsFromTileID(tileID),
		};
		this.mapData.set(tileID, tile);
		this.drawPossiblePaths(tileID);
	}

	public setToken(wildLife: WildLife, tileID: string) {
		this.scene.getMeshByName(tileID)!.id = 'used-habitat';
		const tile = this.mapData.get(tileID)!;
		tile.placedToken = wildLife;
		this.mapData.set(tileID, tile);
	}

	private tileVectorFromQRS(q: number, r: number) {
		const column = q + (r - (r & 1)) / 2;
		const row = r;

		const offset = row % 2 == 0 ? 0 : W;
		const x = offset + 2 * W * column;
		const z = row * H;
		return new Vector3(x, 0, z);
	}
	private tileIDFromQRS(q: number, r: number, s: number) {
		return `tile[${q}][${r}][${s}]`;
	}

	private qrsFromTileID(tileID: string) {
		const regex = /tile\[(-?\d+)\]\[(-?\d+)\]\[(-?\d+)\]/;
		const matches = tileID.match(regex);
		if (matches) {
			return { q: +matches[1], r: +matches[2], s: +matches[3] };
		} else {
			throw new Error('Tlqkf');
		}
	}

	private getNeighborTileIDs(tileID: string) {
		const { q, r, s } = this.qrsFromTileID(tileID);
		return [
			[1, -1, 0], // NE
			[1, 0, -1], // E
			[0, 1, -1], // SE
			[-1, 1, 0], // SW
			[-1, 0, 1], // W
			[0, -1, 1], // NW
		].map((dir) => this.tileIDFromQRS(q + dir[0], r + dir[1], s + dir[2]));
	}
}
