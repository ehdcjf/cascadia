import { Observable, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { Assets } from '../assets/index';
import { BoardTile } from './tile';
import { Mediator } from '../mediator';
import { startingTiles } from '../data';
import { TileInfo } from '../interfaces';
import { TileMesh } from '../assets/tile';
const H = 1.5;
const W = Math.cos(Math.PI / 6);
export class Board {
	private boardAnchor: TransformNode;
	private tiles = new Map<string, BoardTile>();
	constructor(private scene: Scene, private mediator: Mediator) {
		this.boardAnchor = new TransformNode('board-anchor', this.scene);
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
			const tile = this.createTile(tileID, position, tileInfo);
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

	// confirmTile(tileID:string){
	// 	const neighbor =

	// }

	public cleanTile(id: string) {
		const targetTile = this.tiles.get(id)!;
		targetTile.clean();
	}

	public rotateTile(id: string, value: number) {
		const targetTile = this.tiles.get(id)!;
		targetTile.rotate(value);
	}

	private createTile(id: string, position: Vector3, tileInfo?: TileInfo) {
		const tile = new TileMesh(this.boardAnchor);
		return new BoardTile(tile, id, position, this.mediator, tileInfo);
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
