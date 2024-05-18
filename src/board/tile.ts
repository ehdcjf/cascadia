import { ActionManager, ExecuteCodeAction, PredicateCondition, Vector3 } from '@babylonjs/core';
import { TileMesh } from '../assets/tile';
import { Mediator } from '../mediator';
import { MediatorEventType, TileInfo } from '../interfaces';

export class BoardTile {
	private rotation = 0;
	constructor(
		private _tileMesh: TileMesh,
		private _id: string,
		position: Vector3,
		private readonly mediator: Mediator,
		private _tileInfo: TileInfo | null = null
	) {
		this._tileMesh.position = position;
		this._tileMesh.renderEdges();
		this._tileMesh.actionManager.hoverCursor = 'default';

		if (this._tileInfo) {
			this._tileMesh.material = this._tileInfo;
			this.rotation = this._tileInfo.rotation;
		} else {
			const drawTileCondition = new PredicateCondition(this._tileMesh.actionManager, () =>
				this.mediator.canPaintTile()
			);

			const pickDownAction = new ExecuteCodeAction(
				ActionManager.OnPickDownTrigger,
				(_evt) => {
					console.log('down');

					this._tileMesh.actionManager.hoverCursor = 'default';
					this._tileMesh.actionManager.hoverCursor = 'default';
					const type = MediatorEventType.PUT_TILE;
					const data = this._id;
					this.mediator.notifyObservers({ type, data });
					// this.mediator.notifyObservers({ ...this.tileInfo, index: this.index });
				},
				drawTileCondition
			);
			this._tileMesh.actionManager.registerAction(pickDownAction);

			const pointerOverAction = new ExecuteCodeAction(
				ActionManager.OnPointerOverTrigger,
				(_evt) => {
					console.log('over');
					this._tileMesh.actionManager.hoverCursor = 'pointer';
					this._tileMesh.material = this.mediator.pocketTile!;
				},
				drawTileCondition
			);
			this._tileMesh.actionManager.registerAction(pointerOverAction);

			const pointerOutAction = new ExecuteCodeAction(
				ActionManager.OnPointerOutTrigger,
				(_evt) => {
					console.log('out');
					this._tileMesh.actionManager.hoverCursor = 'default';
					this._tileMesh.clean();
				},
				drawTileCondition
			);
			this._tileMesh.actionManager.registerAction(pointerOutAction);
		}
	}

	rotate(value: number) {
		let rotateY = this.rotation + value;
		if (Math.abs(rotateY) >= 360) rotateY %= 360;
		this._tileMesh.rotateY = rotateY;
		this.rotation = rotateY;
	}

	clean() {
		this._tileMesh.clean();
		this.rotation = 0;
	}

	confirm() {}
}
