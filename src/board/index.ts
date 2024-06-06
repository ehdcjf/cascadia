import { TransformNode, Vector3 } from '@babylonjs/core';
import { Assets } from '../assets';
import { Mediator } from '../interfaces';
import { GameInfo } from '../gameInfo';
import { BoardTile } from './tile';

export class Board {
	private boardAnchor: TransformNode;
	private tiles = new Map<number, BoardTile>();
	constructor(
		private readonly assets: Assets,
		private readonly mediator: Mediator,
		private readonly gameInfo: GameInfo
	) {
		this.boardAnchor = assets.transformNode;
		this.boardAnchor.name = 'board-anchor';
	}

	private createTile(position: Vector3) {
		const id = this.tiles.size;
		const tile = this.assets.tile.clone(`board-${id}`, this.boardAnchor)!;
		const token = this.assets.token.clone(`token`, null)!;
		this.tiles.set(id, new BoardTile(tile, token, position));
	}
}
