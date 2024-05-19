import { ActionManager, Observable, Scene } from '@babylonjs/core';
import { Board } from './board/index';
import { Pocket } from './pocket/index';
import { MediatorEventType, MediatorEvent, PocketTileInfo, WildLife } from './interfaces';
import { GameInfo, GameState } from './gameInfo';
import { Modal } from './modal';
export class Mediator extends Observable<MediatorEvent> {
	private board: Board;
	private pocket: Pocket;
	private _gameInfo = new GameInfo();
	private modal: Modal;
	constructor(scene: Scene) {
		super();

		this.modal = new Modal(scene, this);
		this.board = new Board(scene, this);
		this.pocket = new Pocket(scene, this);
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
					this.gameState = GameState.TILE_ACTION;
					// 모달 띄우기
					this.modal.open('ACTION');
					break;
				case MediatorEventType.PUT_TOKEN:
					this.pocket.complete(
						this._gameInfo.pocketTile!.index,
						this._gameInfo.pocketToken!.index
					);
					this.board.confirmToken(
						this._gameInfo.targetTile!,
						this._gameInfo.pocketToken!.wildlife
					);
					this.board.drawBlank(this._gameInfo.targetTile!);
					this.initialize();
					break;
				case MediatorEventType.CANCEL_TILE:
					this.pocket.cleanAllTiles();
					this._gameInfo.pocketTile = null;
					const targetTile = this._gameInfo.targetTile!;
					this.board.cleanTile(targetTile);
					this._gameInfo.targetTile = null;
					this.modal.close('ACTION');
					this._gameInfo.state = GameState.PICK_TILE;
					break;
				case MediatorEventType.CONFIRM_TILE:
					this.modal.close('ACTION');
					const index = this._gameInfo.pocketTile!.index;
					this.pocket.selectTokenOnly(index, 1);
					const wildlife = this.pocket.getWildLife(index)!;
					this._gameInfo.pocketToken = { index: index, wildlife: wildlife };

					const isValidToken = this.board.checkValidToken(wildlife);
					if (isValidToken) {
						this.board.confirmTile(this._gameInfo.targetTile!);
						this.gameState = GameState.PUT_TOKEN;
					} else {
						this.board.faint();
						this.modal.open('NO_PLACEMENT');
						this.gameState = GameState.NO_PLACEMENT;
					}
					break;
				case MediatorEventType.ROTATE_TILE_CW:
					this.board.rotateTile(this._gameInfo.targetTile!, 60);
					break;
				case MediatorEventType.ROTATE_TILE_CCW:
					this.board.rotateTile(this._gameInfo.targetTile!, -60);
					break;
				case MediatorEventType.CANCEL_NO_PLACEMENT:
					this.modal.close('NO_PLACEMENT');
					this.board.clear();
					this.board.cleanTile(this._gameInfo.targetTile!);
					this.pocket.cleanAllTiles();
					this.pocket.toggleToken(this._gameInfo.pocketToken!.index, 1);
					this.initialize();
					break;
				case MediatorEventType.CONFIRM_NO_PLACEMENT:
					this.modal.close('NO_PLACEMENT');
					this.board.clear();
					this.board.confirmTile(this._gameInfo.targetTile!);
					this.pocket.complete(
						this._gameInfo.pocketTile!.index,
						this._gameInfo.pocketToken!.index,
						true
					);
					this.board.drawBlank(this._gameInfo.targetTile!);
					this.initialize();
					break;
				case MediatorEventType.DUPLICATE_THREE:
					break;
				case MediatorEventType.DUPLICATE_ALL:
					this.board.faint();
					this.gameState = GameState.DUPLICATE_ALL;
					this._gameInfo.duplicate = eventData.data;
					this.modal.open('DUPLICATE_ALL');
					break;
				case MediatorEventType.SUFFLE:
					this.board.clear();
					this.pocket.forcedShuffle(this.duplicate!);
					this.modal.close('DUPLICATE_ALL');
					this.modal.close('DUPLICATE_THREE');
					break;
				case MediatorEventType.VALID_TOKEN:
					this.gameState = GameState.PICK_TILE;
					break;
			}
		});
	}

	get gameState() {
		return this._gameInfo.state;
	}

	set gameState(value: GameState) {
		this._gameInfo.state = value;
	}

	public initialize() {
		this._gameInfo.pocketTile = null;
		this._gameInfo.pocketToken = null;
		this._gameInfo.targetTile = null;
		this._gameInfo.state = GameState.PICK_TILE;
	}

	public canPaintTile() {
		return this.gameState == GameState.PICK_TILE && this._gameInfo.pocketTile != null;
	}

	public canTileAction() {
		return this.gameState === GameState.TILE_ACTION && this._gameInfo.pocketTile != null;
	}

	public canPutToken(potentials: WildLife[] | null) {
		return (
			this.gameState === GameState.PUT_TOKEN &&
			this._gameInfo.pocketToken != null &&
			potentials != null &&
			potentials.includes(this._gameInfo.pocketToken.wildlife)
		);
	}

	public isNoPlacement() {
		return this.gameState === GameState.NO_PLACEMENT;
	}

	public isDuplicateState() {
		return this.gameState === GameState.DUPLICATE_THREE || this.gameState === GameState.DUPLICATE_ALL;
	}

	get pocketTile() {
		return this._gameInfo.pocketTile;
	}

	get wildlife() {
		return this._gameInfo.pocketToken?.wildlife;
	}

	get duplicate() {
		return this._gameInfo.duplicate;
	}

	get useNatureToken() {
		return this._gameInfo.useNatureToken;
	}

	get canUndo() {
		return this._gameInfo.canUndo;
	}

	get duplicateThree() {
		return this._gameInfo.duplicateThree;
	}

	get natureToken() {
		return this._gameInfo.natureToken;
	}
}
