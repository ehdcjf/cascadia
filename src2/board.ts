import { Color3, Scene, Tools, TransformNode, Vector3 } from '@babylonjs/core';
import { Tile, TileInfo } from './interfaces';
import {
	getHabitatSides,
	getNeighborTileIDs,
	getNeighborTileIDsByQRS,
	qrsFromTileID,
	tileIDFromQRS,
	tileVectorFromQRS,
} from './utils';
import { startingTiles } from './data';

export class Board {
	public mapData = new Map<string, Tile>();
	public readonly anchor: TransformNode;

	constructor(private scene: Scene) {
		this.anchor = new TransformNode('board-anchor', this.scene);
		this.init();
	}

	private init() {
		// blank 채우기
		const blank = this.scene.getMeshById('blank')!;
		blank.overlayColor = Color3.Yellow();
		blank.overlayAlpha = 0.3;
		blank.setEnabled(true);

		const N = 20;
		for (let q = -N; q <= N; q++) {
			const r1 = Math.max(-N, -q - N);
			const r2 = Math.min(N, -q + N);
			for (let r = r1; r <= r2; r++) {
				const s = -q - r;
				const tileID = tileIDFromQRS(q, r, s);

				const tileMesh = blank.clone(tileID, this.anchor)!;

				tileMesh.position = tileVectorFromQRS(q, r);
				tileMesh.visibility = 1;
				// tileMesh.renderOutline = true;
				// tileMesh.outlineColor = new Color3(0, 0, 0);
				// tileMesh.outlineWidth = 0;
			}
		}

		// stating tile
		const startingTileID = Math.floor(Math.random() * 5);
		const startingTile = startingTiles[startingTileID];
		[
			[0, 0, 0],
			[0, 1, -1],
			[-1, 1, 0],
		].forEach(([q, r, s], i) => {
			const thisStartingTile = startingTile[i];
			const targetTileID = tileIDFromQRS(q, r, s);
			this.drawHabitat(thisStartingTile, targetTileID, thisStartingTile.rotation);
			this.setTile(thisStartingTile, targetTileID, thisStartingTile.rotation);
		});
		this.drawPossibleBlnk();
	}

	drawHabitat(tileInfo: TileInfo, tileID: string, rotation = 0) {
		// UI
		const targetTileMesh = this.scene.getMeshByName(tileID)!;

		const habitatName = tileInfo.habitats.join('-');
		/**
		 * Z-fighting
		 * 재질의 광원 반응 조정
		 * 투명도 및 반사
		 */
		const newMaterial = this.scene.getMeshById(habitatName)!.material!;
		targetTileMesh.material = newMaterial;
		targetTileMesh.rotation = new Vector3(0, Tools.ToRadians(rotation), 0);

		const anchor =
			targetTileMesh.getChildTransformNodes()[0] ?? new TransformNode(`tile-anchor`, this.scene);
		if (anchor.getChildMeshes().length == 0) {
			const wildlifeMesh = tileInfo.wildlife.map((wildlife) => {
				const meshID = wildlife + '-plane';
				const planeMesh = this.scene.getMeshById(meshID)!.clone('wildlife', anchor)!;
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
			anchor.parent = targetTileMesh;
		}
		anchor.rotation = new Vector3(0, -Tools.ToRadians(rotation), 0);

		targetTileMesh.renderingGroupId = 0;
		targetTileMesh.getChildMeshes().forEach((mesh) => {
			mesh.renderingGroupId = 0;
		});
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
			this.scene.getMeshByName(tileID)!.renderOverlay = true;
		}
	}
}
