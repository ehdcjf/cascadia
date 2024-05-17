import { Observable, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { Assets } from '../assets/index';
import { BoardTile } from './tile';

export class Board {
	private boardAnchor: TransformNode;
	constructor(
		private scene: Scene,
		private pickObserverble: Observable<any>,
		private overObserverble: Observable<any>,
		private outObserverble: Observable<any>
	) {
		this.boardAnchor = new TransformNode('board-anchor', this.scene);
		this.setup();
	}

	private setup() {}

	private createTile(position: Vector3) {
		const tile = Assets.getInstance().tile;
		tile.anchor = this.boardAnchor;
		tile.position = position;
		return new BoardTile(tile);
	}
}
