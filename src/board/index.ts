import { TransformNode, Vector3 } from '@babylonjs/core';
import { Assets } from '../assets';
import { Habitat, Mediator, Tile, WildLife } from '../interfaces';
import { GameInfo } from '../gameInfo';
import { BoardTile } from './tile';
import { startingTiles } from '../data';
import { TileActionButtons } from './action';
const H = 1.5;
const W = Math.cos(Math.PI / 6);
const rotationIndexes = {
	positive: [0, 60, 120, 180, 240, 300] as number[],
	negative: [0, -300, -240, -180, -120, -60] as number[],
} as const;
export class Board {
	private boardAnchor: TransformNode;
	private tileActions: TileActionButtons;
	public tiles = new Map<string, BoardTile>();
	constructor(
		private readonly assets: Assets,
		private readonly mediator: Mediator,
		private readonly gameInfo: GameInfo
	) {
		this.boardAnchor = assets.transformNode;
		this.boardAnchor.name = 'board-anchor';
		this.tileActions = new TileActionButtons(assets, mediator, gameInfo);
		this.setup();
	}

	private setup() {
		const randomStartingTileID = Math.floor(Math.random() * 5);
		const startingTile = startingTiles[randomStartingTileID];
		[
			[0, 0, 0],
			[0, 1, -1],
			[-1, 1, 0],
		].forEach(([q, r, s], i) => {
			const tileInfo = startingTile[i];
			const position = this.tileVectorFromQRS(q, r);
			const tileID = this.tileIDFromQRS(q, r, s);
			const tile = this.createTile(tileID, position);
			tile.drawTile(tileInfo.habitats, tileInfo.wildlife);
			tile.rotate(tileInfo.rotation);
			tile.confirmTile();
			this.tiles.set(tileID, tile);
		});

		[...this.tiles.keys()]
			.reduce((r, v, _i, a) => {
				const neighborhood = this.getNeighborhoodFromTileID(v);
				neighborhood.forEach((tileID) => {
					if (!a.includes(tileID)) r.add(tileID);
				});
				return r;
			}, new Set<string>())
			.forEach((tileID) => {
				const { q, r } = this.qrsFromTileID(tileID);
				const position = this.tileVectorFromQRS(q, r);
				const tile = this.createTile(tileID, position);
				this.tiles.set(tileID, tile);
			});
	}

	public faint() {
		this.boardAnchor.getChildMeshes(false).forEach((mesh) => {
			mesh.visibility = 0.2;
		});
	}

	public clear() {
		this.boardAnchor.getChildMeshes(false).forEach((mesh) => {
			mesh.visibility = 1;
		});
	}

	public openTileAction() {
		this.tileActions.open();
	}

	public closeTileAction() {
		this.tileActions.close();
	}

	public confirmTile(id: string) {
		const target = this.tiles.get(id)!;
		target.confirmTile();
	}

	public drawBlank(id: string) {
		this.getNeighborhoodFromTileID(id)
			.filter((tile) => !this.tiles.has(tile))
			.forEach((tileID) => {
				const { q, r } = this.qrsFromTileID(tileID);
				const position = this.tileVectorFromQRS(q, r);
				const tile = this.createTile(tileID, position);
				this.tiles.set(tileID, tile);
			});
	}

	public checkValidToken(wildlife: WildLife) {
		return [...this.tiles.values()]
			.reduce((r, v) => {
				v.wildlifes.forEach((wildlife) => r.add(wildlife));
				return r;
			}, new Set<WildLife>())
			.has(wildlife);
	}

	private createTile(id: string, position: Vector3) {
		const tileMesh = this.assets.boardTile;
		tileMesh.id = id;
		tileMesh.setAnchor(this.boardAnchor, position);
		return new BoardTile(tileMesh, this.mediator, this.gameInfo);
	}

	private tileVectorFromQRS(q: number, r: number) {
		const column = q + (r - (r & 1)) / 2;
		const row = r;
		const offset = row % 2 == 0 ? 0 : W;
		const x = offset + 2 * W * column;
		const z = row * H;
		return new Vector3(-x, 0, z);
	}

	public rotateTile(id: string, value: number) {
		const targetTile = this.tiles.get(id)!;
		targetTile.rotate(value);
	}

	public cleanTile(id: string) {
		const targetTile = this.tiles.get(id)!;
		targetTile.blank();
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
	private getNeighborhoodFromTileID(tileID: string) {
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

	private getRotationIndex(rotation: number) {
		if (rotation == 0) return 0;
		if (rotation >= 360) rotation %= 360;
		else if (rotation <= -360) rotation %= -360;
		const sign = Math.sign(rotation) != -1 ? 'positive' : 'negative';
		return rotationIndexes[sign].indexOf(rotation);
	}

	private getHabitatSides(habitats: Array<Habitat>, rotation: number): Array<Habitat> {
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

	getMapData() {
		const mapData = new Map<string, Tile>();
		let tileCount = 0;
		for (const [key, value] of this.tiles) {
			const tileData = value.tileInfo;
			if (tileData.state == 'tile') continue;
			const tile = {
				placedToken: tileData.placed,
				tileNum: tileCount++,
				habitats: tileData.habitats,
				wildlife: tileData.wildlifes,
				habitatSides: this.getHabitatSides(tileData.habitats, tileData.rotation),
				neighborhood: this.getNeighborhoodFromTileID(key),
				qrs: this.qrsFromTileID(key),
			};
			mapData.set(key, tile);
		}
		return mapData;
	}
}
