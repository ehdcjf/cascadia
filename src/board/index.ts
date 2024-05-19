import { Observable, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { Assets } from '../assets/index';
import { BoardTile } from './tile';
import { Mediator } from '../mediator';
import { startingTiles } from '../data';
import { TileInfo, WildLife } from '../interfaces';
import { TileMesh } from '../assets/tile';
const H = 1.5;
const W = Math.cos(Math.PI / 6);
export class Board {
	private boardAnchor: TransformNode;
	private tiles = new Map<string, BoardTile>();
	constructor(private scene: Scene, private mediator: Mediator) {
		this.boardAnchor = new TransformNode('board-anchor', this.scene);
		this.setup();
		// this.faint();
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
			tile.paint(tileInfo);
			tile.rotate(tileInfo.rotation);
			tile.setHabitat();
			this.tiles.set(tileID, tile);
		});

		[...this.tiles.keys()]
			.reduce((r, v, i, a) => {
				const neighborhood = this.getNeighborhoodFromTileID(v);
				neighborhood.forEach((tileID) => {
					if (!a.includes(tileID)) r.add(tileID);
				});
				return r;
			}, new Set<string>())
			.forEach((tileID) => {
				const { q, r, s } = this.qrsFromTileID(tileID);
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

	confirmTile(tileID: string) {
		const target = this.tiles.get(tileID)!;
		target.setHabitat();
	}

	confirmToken(id: string, wildlife: WildLife) {
		const targetTile = this.tiles.get(id)!;
		targetTile.placedToken = wildlife;
		targetTile.wildlife = [];
	}

	public cleanTile(id: string) {
		const targetTile = this.tiles.get(id)!;
		targetTile.clean();
	}

	public drawBlank(id: string) {
		this.getNeighborhoodFromTileID(id)
			.filter((tile) => !this.tiles.has(tile))
			.forEach((tileID) => {
				const { q, r, s } = this.qrsFromTileID(tileID);
				const position = this.tileVectorFromQRS(q, r);
				const tile = this.createTile(tileID, position);
				this.tiles.set(tileID, tile);
			});
	}

	public rotateTile(id: string, value: number) {
		const targetTile = this.tiles.get(id)!;
		targetTile.rotate(value);
	}

	public checkValidToken(wildlife: WildLife) {
		return [...this.tiles.values()]
			.reduce((r, v) => {
				v.wildlife.forEach((wildlife) => r.add(wildlife));
				return r;
			}, new Set<WildLife>())
			.has(wildlife);
	}

	private createTile(id: string, position: Vector3) {
		const tile = new TileMesh(this.boardAnchor);
		return new BoardTile(tile, id, position, this.mediator);
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
}
