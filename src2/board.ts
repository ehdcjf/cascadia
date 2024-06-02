import { Color3, Mesh, Scene, Tags, Tools, TransformNode, Vector3, VertexBuffer } from '@babylonjs/core';
import { Habitat, Tile, TileInfo, TileKey } from './interfaces';
import {
	getHabitatSides,
	getNeighborTileIDs,
	getNeighborTileIDsByQRS,
	qrsFromTileID,
	sleep,
	tileIDFromQRS,
	tileVectorFromQRS,
} from './utils';
import { startingTiles } from './data';
import { UVData } from './assets';

export class Board {
	public mapData = new Map<string, Tile>();
	public readonly anchor: TransformNode;

	constructor(private scene: Scene, private uvData: UVData) {
		this.anchor = new TransformNode('board-anchor', this.scene);
		this.init();
	}

	private async init() {
		// blank 채우기
		const tile = this.scene.getMeshById('tile')!;

		tile.overlayColor = Color3.Yellow();
		tile.overlayAlpha = 0.3;
		// tile.setEnabled(true);

		const token = this.scene.getMeshById('token')!;
		const tokenPosistion = [
			new Vector3(0, 0.11, 0),
			new Vector3(-0.15, 0.11, 0.15),
			new Vector3(0.15, 0.11, -0.15),
			new Vector3(0, 0.11, -0.25),
			new Vector3(-0.25 * Math.cos(Math.PI / 6), 0.11, 0.125),
			new Vector3(0.25 * Math.cos(Math.PI / 6), 0.11, 0.125),
		];

		const N = 20;
		for (let q = -N; q <= N; q++) {
			const r1 = Math.max(-N, -q - N);
			const r2 = Math.min(N, -q + N);
			for (let r = r1; r <= r2; r++) {
				const s = -q - r;
				const tileID = tileIDFromQRS(q, r, s);

				const blank = tile.clone(tileID, this.anchor)! as Mesh;
				blank.makeGeometryUnique();
				const tileAnchor = new TransformNode(tileID, this.scene);
				tileAnchor.parent = blank;

				tokenPosistion.forEach((pos, i) => {
					const emptyToken = token.clone(tileID + `[${i}]`, tileAnchor) as Mesh;
					emptyToken.makeGeometryUnique();
					emptyToken.position = pos;
					emptyToken.scaling = new Vector3(0.4, 0.1, 0.4);
					emptyToken.visibility = 1;
					emptyToken.setEnabled(false);
				});

				// blank.bakeCurrentTransformIntoVertices();
				blank.setVerticesData(this.uvData.tileIndex, this.uvData.tile['blank']);
				blank.position = tileVectorFromQRS(q, r);
				// blank.visibility = 1;
				// tileMesh.renderOutline = true;
				// tileMesh.outlineColor = new Color3(0, 0, 0);
				// tileMesh.outlineWidth = 0;
			}
		}

		// stating tile
		const startingTileID = Math.floor(Math.random() * 5);
		const startingTile = startingTiles[startingTileID];
		const startingPosition = [
			[0, 0, 0],
			[0, 1, -1],
			[-1, 1, 0],
		];
		for (let i = 0; i < 3; i++) {
			const [q, r, s] = startingPosition[i];
			const thisStartingTile = startingTile[i];
			const targetTileID = tileIDFromQRS(q, r, s);
			this.drawHabitat(thisStartingTile, targetTileID, thisStartingTile.rotation);
			this.setTile(thisStartingTile, targetTileID, thisStartingTile.rotation);
		}

		this.drawPossibleBlnk();
	}

	drawHabitat(tileInfo: TileInfo, tileID: string, rotation = 0) {
		// UI
		const tile = this.scene.getMeshByName(tileID)!;
		tile.visibility = 1;
		const habitatName = tileInfo.habitats.join('-') as TileKey;

		/**
		 * 일부 타일이 z-index가 낮아지는 현상
		 * Z-fighting
		 * 재질의 광원 반응 조정
		 * 투명도 및 반사
		 * =>>>> rendering group 때문임.
		 */

		tile.setVerticesData(this.uvData.tileIndex, this.uvData.tile[habitatName]);

		tile.rotation = new Vector3(0, Tools.ToRadians(rotation), 0);

		const wildLifeSize = tileInfo.wildlife.length;
		const startIndex = (1 << (wildLifeSize - 1)) - 1;

		const wildLifeMeshes = tile.getChildMeshes();
		wildLifeMeshes.forEach((mesh) => mesh.setEnabled(false));
		tileInfo.wildlife.forEach((v, i) => {
			wildLifeMeshes[startIndex + i].setVerticesData(this.uvData.tokenIndex, this.uvData.token[v]);
			wildLifeMeshes[startIndex + i].setEnabled(true);
		});
		tile.getChildTransformNodes()[0].rotation = new Vector3(0, -Tools.ToRadians(rotation), 0);
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
			habitatSides: getHabitatSides(tileInfo.habitats, rotation),
			neighborhood: getNeighborTileIDs(tileID),
			qrs: qrsFromTileID(tileID),
		};
		this.mapData.set(tileID, tile);
	}

	public drawPossibleBlnk() {
		const possible = new Set<string>();
		const habitats = [...this.mapData.values()];
		habitats.forEach((habitat) => {
			const { q, r, s } = habitat.qrs;
			getNeighborTileIDsByQRS(q, r, s).forEach((neighbor) => {
				if (!this.mapData.has(neighbor)) possible.add(neighbor);
			});
		});

		for (const tileID of possible) {
			// this.scene.getMeshByName(tileID)!.material = potentialMat;
			const neighbor = this.scene.getMeshByName(tileID)!;
			neighbor.visibility = 1;
			neighbor.setVerticesData(this.uvData.tileIndex, this.uvData.tile['blank']);
			// neighbor.renderOverlay = true;
		}
	}
}
