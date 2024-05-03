import { AbstractMesh, Scene, Tools, TransformNode, Vector3 } from '@babylonjs/core';
import { startingTiles } from './data';
import { Habitat, Tile, TileInfo, WildLife } from './interfaces';
import { TileScoring } from './score/tile';
const rotationIndexes = {
	positive: [0, 60, 120, 180, 240, 300],
	negative: [0, -300, -240, -180, -120, -60],
};

const H = 1.5;
const W = Math.cos(Math.PI / 6);

export class Board {
	// protected mapData: Map<string, MapItem> = new Map();
	protected mapData: Map<string, Tile> = new Map();
	protected possiblePath: Map<string, AbstractMesh> = new Map();
	tfNode: TransformNode;

	constructor(protected scene: Scene) {
		this.tfNode = new TransformNode('pocket-tf', this.scene);
		this.init();
		const x = new TileScoring(this.mapData);
	}

	init() {
		const N = 20;
		for (let q = -N; q <= N; q++) {
			const r1 = Math.max(-N, -q - N);
			const r2 = Math.min(N, -q + N);
			for (let r = r1; r <= r2; r++) {
				const s = -q - r;
				const tileID = this.tileIDFromQRS(q, r, s);
				const tileMesh = this.scene.getMeshById('beige')!.clone(tileID, this.tfNode)!;
				tileMesh.position = this.tileVectorFromQRS(q, r);
				// tileMesh.visibility = 1;
				// tileMesh.renderOutline = true;
				// tileMesh.outlineColor = new Color3(0, 0, 0);
				// tileMesh.outlineWidth = 0;
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
			this.drawPossiblePaths(targetTileID);
			this.setTile(thisStartingTile, targetTileID, thisStartingTile.rotation);
		});
	}

	drawHabitat(tileInfo: TileInfo, tileID: string, rotation = 0) {
		// UI
		const targetTileMesh = this.scene.getMeshByName(tileID)!;
		targetTileMesh.metadata = {
			wildLife: tileInfo.wildlife,
		};
		targetTileMesh.visibility = 1;

		const habitatName = tileInfo.habitats.join('-');
		const newMaterial = this.scene.getMeshById(habitatName)!.material!;
		targetTileMesh.material = newMaterial;
		targetTileMesh.rotation = new Vector3(0, Tools.ToRadians(rotation), 0);

		const tfNode = new TransformNode(`transform`, this.scene);
		const wildlifeMesh = tileInfo.wildlife.map((wildlife) => {
			const meshID = wildlife + '-plane';
			const planeMesh = this.scene.getMeshById(meshID)!.clone('wildlife', tfNode)!;
			planeMesh.position.y += 0.11;
			planeMesh.visibility = 1;
			return planeMesh;
		});

		if (wildlifeMesh.length == 2) {
			wildlifeMesh[0].position.x -= 0.15;
			wildlifeMesh[0].position.z += 0.15;
			wildlifeMesh[1].position.x += 0.15;
			wildlifeMesh[1].position.z -= 0.15;
		} else if (wildlifeMesh.length == 3) {
			wildlifeMesh[0].position.z -= 0.25;
			wildlifeMesh[1].position.z += 0.125;
			wildlifeMesh[1].position.x -= 0.25 * Math.cos(Math.PI / 6);
			wildlifeMesh[2].position.x += 0.25 * Math.cos(Math.PI / 6);
			wildlifeMesh[2].position.z += 0.125;
		}
		tfNode.parent = targetTileMesh;
		tfNode.rotation = new Vector3(0, -Tools.ToRadians(rotation), 0);
	}

	drawPossiblePaths(tileID: string) {
		this.getNeighborTileIDs(tileID).forEach((neighborTileID) => {
			const neighborMesh = this.scene.getMeshByName(neighborTileID)!;
			neighborMesh.visibility = 1;
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

	private setTile(tileInfo: TileInfo, tileID: string, rotation: number) {
		const tile: Tile = {
			tileNum: this.mapData.size + 1,
			placedToken: null,
			habitatSides: this.getHabitatSides(tileInfo.habitats, rotation),
			neighborhood: this.getNeighborTileIDs(tileID),
		};
		this.mapData.set(tileID, tile);
	}

	private setToken(wildLife: WildLife, tileID: string) {
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
			const q = matches[1];
			const r = matches[2];
			const s = matches[3];
			return [q, r, s].map(Number);
		} else {
			throw new Error('Tlqkf');
		}
	}

	private getNeighborTileIDs(tileID: string) {
		const [q, r, s] = this.qrsFromTileID(tileID);
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
