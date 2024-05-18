import { ActionManager, Observable, Scene } from '@babylonjs/core';
import { Board } from './board/index';
import { Pocket } from './pocket/index';
import { MediatorEventType, MediatorEvent, PocketTileInfo } from './interfaces';
import { GameInfo, GameState } from './gameInfo';
import { Modal } from './modal';
export class Mediator extends Observable<MediatorEvent> {
	private board: Board;
	private pocket: Pocket;
	private _gameInfo = new GameInfo();
	private modal: Modal;
	constructor(scene: Scene) {
		super();

		this.board = new Board(scene, this);
		this.pocket = new Pocket(scene, this);
		this.modal = new Modal(scene, this);
		this.add((eventData, _eventState) => {
			switch (eventData.type) {
				case MediatorEventType.SELECT_TILE:
					this._gameInfo.pocketTile = eventData.data;
					this.pocket.selectTile(eventData.data.index);
					break;
				case MediatorEventType.SELECT_TOKEN:
					break;
				case MediatorEventType.PUT_TILE:
					this._gameInfo.targetTile = eventData.data;
					this._gameInfo.state = GameState.TILE_ACTION;
					// 모달 띄우기
					this.modal.show('ACTION');
					break;
				case MediatorEventType.PUT_TOKEN:
					break;
				case MediatorEventType.CANCEL_TILE:
					this.pocket.cleanAllTiles();
					this._gameInfo.pocketTile = null;
					const targetTile = this._gameInfo.targetTile!;
					this.board.cleanTile(targetTile);
					this._gameInfo.targetTile = null;
					this.modal.hide('ACTION');
					this._gameInfo.state = GameState.PICK_TILE;
					break;
				case MediatorEventType.CONFIRM_TILE:
					this.modal.hide('ACTION');
					// this._gameInfo.state = GameState.;
					break;
				case MediatorEventType.ROTATE_TILE_CW:
					this.board.rotateTile(this._gameInfo.targetTile!, 60);
					break;
				case MediatorEventType.ROTATE_TILE_CCW:
					this.board.rotateTile(this._gameInfo.targetTile!, -60);
					break;
			}

			// console.log(eventData);
			// console.log(_eventState);
			// // this.scene.hoverCursor = 'default';
		});

		// this.add((eventData, _eventState) => {
		// 	this.scene.hoverCursor = 'default';
		// }, POINTER_MASK.POINTER_OUT);

		// this.add((eventData, _eventState) => {
		// 	console.log('xxxx');
		// 	console.log(this.scene.hoverCursor);
		// 	this.scene.hoverCursor = 'pointer';
		// }, POINTER_MASK.POINTER_OVER);

		// this.boardObservable.add((_eventData, _eventState) => {
		// 	ActionManager.OnPointerOutTrigger
		// 	if(this.gameInfo.state==GameState.PICK_TILE && this.gameInfo.)

		// });
	}

	get gameState() {
		return this._gameInfo.state;
	}

	public canPaintTile() {
		return this.gameState == GameState.PICK_TILE && this._gameInfo.pocketTile != null;
	}

	public canTileAction() {
		return this.gameState === GameState.TILE_ACTION && this._gameInfo.pocketTile != null;
	}

	get pocketTile() {
		return this._gameInfo.pocketTile;
	}
}
