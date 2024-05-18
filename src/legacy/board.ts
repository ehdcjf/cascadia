import {
	AbstractMesh,
	ActionManager,
	Color3,
	ExecuteCodeAction,
	Observable,
	PredicateCondition,
	StandardMaterial,
	StateCondition,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { Scene } from './scene';
import { startingTiles } from '../../src2/data';
import { Habitat, Tile, TileInfo, TileKey, TokenKey, WildLife } from '../interfaces';
import { TileScoring } from '../score/tile';
import { Assets } from '../assets';
import { SceneState } from './metadata';
import { ActionObserver, ModalEvents } from './observer';
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

	constructor(
		protected scene: Scene,
		private readonly assets: Assets,
		private readonly observer: ActionObserver
	) {
		this.anchor = new TransformNode('board-anchor', this.scene);
		this.init();
		// const x = new TileScoring(this.mapData);
	}

	private init() {
		const randomStartingTileID = Math.floor(Math.random() * 5);
		const startingTile = startingTiles[randomStartingTileID];
		[
			[0, 0, 0],
			[0, 1, -1],
			[-1, 1, 0],
		]
			.map(([q, r, s], i) => {
				const tileInfo = startingTile[i];
				const tileName = this.tileNameFromQRS(q, r, s);
				const tile = this.assets.cloneTile(
					this.anchor,
					'habitat',
					tileName,
					tileInfo,
					this.tileVectorFromQRS(q, r)
				);

				return { tileInfo, tileName };
			})
			.forEach((v) => {
				this.setTile(v.tileInfo, v.tileName, v.tileInfo.rotation);
			});
	}

	public setTile(tileInfo: TileInfo, tileName: string, rotation: number) {
		const habitat = this.scene.getMeshByName(tileName)!;
		habitat.id = 'habitat';
		////////////////////////////////////////
		const habitatAnchor = new TransformNode('habitat-anchor', this.scene)!;
		habitatAnchor.parent = habitat;
		habitatAnchor.rotation = new Vector3(0, -Tools.ToRadians(rotation), 0);

		const actionManager = new ActionManager(this.scene);
		actionManager.hoverCursor = 'default';
		habitat.actionManager = actionManager;

		const drawWildlifeCondition = new PredicateCondition(
			actionManager,
			() => this.scene.metadata.state == SceneState.PUT_TOKEN
		);

		const moveInAction = new ExecuteCodeAction(
			ActionManager.OnPointerOverTrigger,
			() => {
				const wildlife = this.scene.metadata.token as WildLife;
				const tokenKey = (wildlife + '-active') as TokenKey;
				if (tileInfo.wildlife.includes(wildlife)) {
					actionManager.hoverCursor = 'pointer';
					const token = this.assets.cloneToken(
						habitatAnchor,
						'wildlife',
						tokenKey,
						tokenKey,
						new Vector3(0, 0.11, 0)
					);
				}
			},
			drawWildlifeCondition
		);

		const moveOutAction = new ExecuteCodeAction(
			ActionManager.OnPointerOutTrigger,
			() => {
				actionManager.hoverCursor = 'default';
				habitatAnchor.getChildMeshes().forEach((mesh) => {
					mesh.dispose();
				});
			},
			drawWildlifeCondition
		);

		const pointerDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				actionManager.hoverCursor = 'default';
				this.setToken(tileName, this.scene.metadata.token!);
				this.scene.metadata.state = SceneState.PICK_TILE;
				this.scene.metadata.rotation = 0;
				this.scene.metadata.tile = null;
				this.scene.metadata.targetTile = null;
				this.scene.metadata.token = null;
				habitat.getChildTransformNodes()[0].dispose();
				habitat.actionManager = null;
			},
			drawWildlifeCondition
		);

		habitat.actionManager.registerAction(moveInAction);
		habitat.actionManager.registerAction(moveOutAction);
		habitat.actionManager.registerAction(pointerDownAction);

		///////////////////////////////////////////////////
		const tile: Tile = {
			tileNum: this.mapData.size + 1,
			placedToken: null,
			habaitats: tileInfo.habitats,
			wildlife: tileInfo.wildlife,
			habitatSides: this.getHabitatSides(tileInfo.habitats, rotation),
			neighborhood: this.getNeighborTileNames(tileName),
			qrs: this.qrsFromTileID(tileName),
		};
		this.mapData.set(tileName, tile);
		this.drawBlank(tileName);
	}

	private setToken(tileName: string, wildLife: WildLife) {
		const tile = this.mapData.get(tileName)!;
		tile.placedToken = wildLife;
		this.mapData.set(tileName, tile);
	}

	private getHabitatSides(habitats: Array<Habitat>, rotation: number) {
		if (rotation >= 360) rotation %= 360;
		else if (rotation <= -360) rotation %= -360;
		const sign = Math.sign(rotation) != -1 ? 'positive' : 'negative';
		const habitatSides = new Array(6);
		if (habitats.length == 1) {
			habitatSides.fill(habitats[0]);
		} else {
			const [h1, h2] = habitats;
			let currentHabitat = h1;
			let habitatIndex = rotationIndexes[sign].indexOf(rotation);

			for (let i = 0; i < 6; i++) {
				habitatSides[habitatIndex] = currentHabitat;
				habitatIndex++;
				if (habitatIndex == 6) habitatIndex = 0;
				if (i == 2) currentHabitat = h2;
			}
		}
		return habitatSides;
	}

	public paintBlank(tileName: string) {
		const tile = this.scene.getMeshByName(tileName)!;
		tile.id = 'blank';
		tile.rotation = new Vector3(0, 0, 0);
		tile.getChildMeshes().forEach((mesh) => {
			mesh.setEnabled(false);
		});
		tile.getChildTransformNodes()[0].rotation = new Vector3(0, 0, 0);
	}

	public paintHabitat(tileName: string, tileInfo: TileInfo, rotation = 0) {
		const tile = this.scene.getMeshByName(tileName)!;

		tile.id = 'habitat';

		const tileMatKey = tileInfo.habitats.join('-') as TileKey;
		tile.material = this.assets.tileMat[tileMatKey];
		tile.rotation = new Vector3(0, Tools.ToRadians(rotation), 0);

		const wildLifeSize = tileInfo.wildlife.length;
		const startIndex = (1 << (wildLifeSize - 1)) - 1;

		const wildLifeMeshes = tile.getChildMeshes();
		wildLifeMeshes.forEach((mesh) => mesh.setEnabled(false));
		tileInfo.wildlife.forEach((v: TokenKey, i) => {
			wildLifeMeshes[startIndex + i].material = this.assets.tokenMat[v];
			wildLifeMeshes[startIndex + i].setEnabled(true);
		});
		tile.getChildTransformNodes()[0].rotation = new Vector3(0, -Tools.ToRadians(rotation), 0);
		// tile.renderingGroupId = 0;
		// tile.getChildMeshes().forEach((mesh) => {
		// 	mesh.renderingGroupId = 0;
		// });
	}

	// public paintHabitat(tileName: string, tileInfo: TileInfo, rotation = 0) {
	// 	const tile = this.scene.getMeshByName(tileName)!;
	// 	tile.id = 'habitat';

	// 	const tileMatKey = tileInfo.habitats.join('-') as TileKey;
	// 	tile.material = this.assets.tileMat[tileMatKey];
	// 	tile.rotation = new Vector3(0, Tools.ToRadians(rotation), 0);

	// 	const wildLifeSize = tileInfo.wildlife.length;
	// 	const startIndex = (1 << (wildLifeSize - 1)) - 1;

	// 	const wildLifeMeshes = tile.getChildMeshes();
	// 	wildLifeMeshes.forEach((mesh) => mesh.setEnabled(false));
	// 	tileInfo.wildlife.forEach((v: TokenKey, i) => {
	// 		wildLifeMeshes[startIndex + i].material = this.assets.tokenMat[v];
	// 		wildLifeMeshes[startIndex + i].setEnabled(true);
	// 	});
	// 	tile.getChildTransformNodes()[0].rotation = new Vector3(0, -Tools.ToRadians(rotation), 0);
	// 	// tile.renderingGroupId = 0;
	// 	// tile.getChildMeshes().forEach((mesh) => {
	// 	// 	mesh.renderingGroupId = 0;
	// 	// });
	// }

	private drawBlank(tileName: string) {
		this.getNeighborTileNames(tileName).forEach((neighbor) => {
			if (!this.scene.getMeshByName(neighbor)) {
				const { q, r } = this.qrsFromTileID(neighbor);
				const blank = this.assets.cloneTile(
					this.anchor,
					'blank',
					neighbor,
					{ habitats: [], wildlife: [], rotation: 0, tileNum: '' },
					this.tileVectorFromQRS(q, r)
				);
				const actionManager = new ActionManager(this.scene);
				blank.actionManager = actionManager;

				const drawHabitatCondition = new PredicateCondition(
					actionManager,
					() =>
						this.scene.metadata.state == SceneState.PICK_TILE &&
						!!this.scene.metadata.tile
				);

				// const drawBlankCondition = new PredicateCondition(
				// 	actionManager,
				// 	() => this.scene.metadata.state == SceneState.PICK_TILE
				// );

				const moveInAction = new ExecuteCodeAction(
					ActionManager.OnPointerOverTrigger,
					() => {
						actionManager.hoverCursor = 'pointer';
						const tileInfo = this.scene.metadata.tile!;
						const tileKey = tileInfo.habitats.join('-') as TileKey;
						blank.material = this.assets.tileMat[tileKey];

						const wildLifeSize = tileInfo.wildlife.length;
						const startIndex = (1 << (wildLifeSize - 1)) - 1;

						const wildLifeMeshes = blank.getChildMeshes();
						wildLifeMeshes.forEach((mesh) => mesh.setEnabled(false));
						tileInfo.wildlife.forEach((v: TokenKey, i) => {
							const mesh = wildLifeMeshes[startIndex + i];
							mesh.material = this.assets.tokenMat[v];
							mesh.setEnabled(true);
							mesh.isPickable = false;
						});
					},
					drawHabitatCondition
				);

				const moveOutAction = new ExecuteCodeAction(
					ActionManager.OnPointerOutTrigger,
					() => {
						actionManager.hoverCursor = 'default';

						blank.material = this.assets.tileMat['blank'];
						blank.getChildMeshes().forEach((mesh) => mesh.setEnabled(false));
					},
					drawHabitatCondition
				);

				const pointerDownAction = new ExecuteCodeAction(
					ActionManager.OnPickDownTrigger,
					() => {
						actionManager.hoverCursor = 'default';
						this.scene.metadata.state = SceneState.TILE_ACTION;
						this.scene.metadata.targetTile = blank;
						this.observer.modal.notifyObservers(ModalEvents.OPEN_TILE_ACTION);
					},
					drawHabitatCondition
				);

				actionManager.hoverCursor = 'default';
				blank.actionManager.registerAction(moveInAction);
				blank.actionManager.registerAction(moveOutAction);
				blank.actionManager.registerAction(pointerDownAction);
			}
		});
	}

	private tileVectorFromQRS(q: number, r: number) {
		const column = q + (r - (r & 1)) / 2;
		const row = r;

		const offset = row % 2 == 0 ? 0 : W;
		const x = offset + 2 * W * column;
		const z = row * H;
		return new Vector3(x, 0, z);
	}
	private tileNameFromQRS(q: number, r: number, s: number) {
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

	private getNeighborTileNames(tileID: string) {
		const { q, r, s } = this.qrsFromTileID(tileID);
		return [
			[1, -1, 0], // NE
			[1, 0, -1], // E
			[0, 1, -1], // SE
			[-1, 1, 0], // SW
			[-1, 0, 1], // W
			[0, -1, 1], // NW
		].map((dir) => this.tileNameFromQRS(q + dir[0], r + dir[1], s + dir[2]));
	}
}
