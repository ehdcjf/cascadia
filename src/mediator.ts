import { Observable, Scene } from '@babylonjs/core';
import { Board } from './board/index';
import { Pocket } from './pocket/index';
import { MODAL_TAG, MediatorEvent, PocketTokenInfo } from './interfaces';
import { GameInfo, GameState } from './gameInfo';
import { Modal } from './modal';
import { DefaultButtons } from './defaultButtons';
import { InfoUI } from './info';
import { ClearButton } from './clearButton';
import { TileScoring } from './score/tile';
export class GameManager {
	private board: Board;
	private pocket: Pocket;
	private modal: Modal;
	private defaultButton: DefaultButtons;
	private clearButton: ClearButton;
	private infoUI: InfoUI;
	private gameInfo: GameInfo;
	private mediator = new Observable<MediatorEvent>();
	constructor(scene: Scene) {
		this.gameInfo = new GameInfo();
		this.modal = new Modal(scene, this.mediator, this.gameInfo);
		this.pocket = new Pocket(scene, this.mediator, this.gameInfo);
		this.board = new Board(scene, this.mediator, this.gameInfo);
		this.infoUI = new InfoUI(scene, this.gameInfo);
		this.defaultButton = new DefaultButtons(scene, this.mediator, this.gameInfo);
		this.clearButton = new ClearButton(scene, this.gameInfo);

		this.mediator.add(async (eventData, _eventState) => {
			switch (eventData.type) {
				case 'INIT':
					break;
				case 'TURN_START': //DONE
					this.gameInfo.canPickTile = true;
					this.gameInfo.canDrawTile = false;
					this.gameInfo.canPickToken = false;
					this.gameInfo.canDrawToken = false;
					this.gameInfo.pocketTile = null;
					this.gameInfo.pocketToken = null;
					this.gameInfo.targetTileID = null;
					this.gameInfo.targetTokenID = null;
					this.gameInfo.canUndo = false;
					// this.endModal();
					this.board.clear();
					this.gameInfo.state = GameState.START;
					this.defaultButton.open();

					break;
				case 'CAN_REFILL': //DONE
					this.gameInfo.canRefill = true;
					this.gameInfo.duplicate = eventData.data;
					this.mediator.notifyObservers({ type: 'TURN_START' });
					break;
				case 'REPLACE': //DONE
					await this.duplicateThreeAction();
					break;
				case 'DUPLICATE_ALL': //DONE
					this.gameInfo.duplicate = eventData.data;
					this.startModal();
					await this.modal.open('DUPLICATE_ALL');
					this.endModal();
					this.pocket.duplicateRefill();
					break;
				case 'CANCEL_TILE': //DONE
					this.board.closeTileAction();
					this.board.cleanTile(this.gameInfo.targetTileID!);
					this.pocket.cleanAllTiles();
					// if (this.gameInfo.myToken) this.pocket.toggleToken(this.gameInfo.myToken, 1);
					this.mediator.notifyObservers({ type: 'TURN_START' });
					break;
				case 'ROTATE_TILE_CCW': //DONE
					this.board.rotateTile(this.gameInfo.targetTileID!, -60);
					break;
				case 'ROTATE_TILE_CW': //DONE
					this.board.rotateTile(this.gameInfo.targetTileID!, 60);
					break;
				case 'UNDO': //DONE
					this.gameInfo.state = GameState.WAIT;
					this.board.cleanTile(this.gameInfo.targetTileID!);
					this.pocket.cleanAllTiles();
					if (this.gameInfo.myToken) this.pocket.toggleToken(this.gameInfo.myToken, 1);
					this.mediator.notifyObservers({ type: 'TURN_START' });
					break;
				case 'USE_NATURE': // Nature Token 사용 버튼 눌렀을 때
					await this.useNature();
					break;

				case 'PICK_TILE': // 이거는 상태에  별 차이 없는 이벤트
					this.gameInfo.pocketTile = eventData.data;
					this.gameInfo.canDrawTile = true;
					break;

				case 'PUT_TILE':
					this.gameInfo.targetTileID = eventData.data;
					this.gameInfo.canDrawTile = false;
					this.gameInfo.canPickTile = false;
					this.gameInfo.state = GameState.WAIT;
					this.board.openTileAction();
					this.defaultButton.close();
					break;
				// 이거는 pinecone 사용할때
				case 'PICK_TOKEN':
					this.naturePickAnyToken(eventData.data);
					break;
				case 'PUT_TOKEN':
					this.gameInfo.state = GameState.WAIT;
					this.gameInfo.useRefill = false;
					this.gameInfo.canRefill = false;
					this.gameInfo.turnlefts -= 1;
					if (eventData.data.addNatureToken) {
						this.gameInfo.natureToken += 1;
					}
					this.infoUI.reset();
					const tileIndex = this.gameInfo.myTile!;
					const tokenIndex = this.gameInfo.myToken!;
					this.board.drawBlank(this.gameInfo.targetTileID!);

					if (this.gameInfo.turnlefts == 0) {
						this.calculate();
					} else {
						this.gameInfo.targetTileID = null;
						this.gameInfo.targetTokenID = null;
						this.gameInfo.pocketTile = null;
						this.gameInfo.pocketToken = null;
						this.pocket.processTile(tileIndex);
						this.pocket.processToken(tokenIndex);
					}
					break;
				case 'CONFIRM_TILE':
					await this.confirmTile();
					break;
				case 'NO_PLACEMENT':
					this.modal.open('NO_PLACEMENT');
					break;
			}
		});
		this.modal.open('BEAR_A');
	}

	private startModal() {
		this.gameInfo.state = GameState.WAIT;
		this.board.faint();
		this.defaultButton.close();
	}

	private endModal() {
		this.gameInfo.state = this.gameInfo.lastState;
		this.board.clear();
		this.defaultButton.open();
	}

	/**
	 * 토큰 3개 이상 중복시 주어지는 단 한번의 기회
	 */
	async duplicateThreeAction() {
		this.startModal();
		//모달 띄운다.
		const replaceToken = (await this.modal.open('DUPLICATE_THREE')) as boolean;

		// 토큰을 버리기로 결심한다면
		if (replaceToken) {
			// Refill은 단 한번만 할 수 있기 때문에 사용했다는거 표시하고
			this.gameInfo.useRefill = true;
			// 중복된 토큰 제거
			await this.pocket.duplicateRefill();
		}

		// 그게 아니면 그냥 모달 지움
		else {
			this.endModal();
		}
	}

	private async useNature() {
		this.startModal();
		const natureAction = (await this.modal.open('USE_NATURE')) as number;
		if (natureAction == 0) this.endModal();
		else {
			this.infoUI.reset();
			if (natureAction == 1) this.naturePickAnyAction();
			else if (natureAction == 2) this.clearAction();
		}
	}

	private async naturePickAnyAction() {
		this.gameInfo.natureToken -= 1;
		await this.modal.open('PICK_TILE');

		this.gameInfo.canPickTile = true;
		this.gameInfo.canDrawTile = false;
		this.gameInfo.canPickToken = false;
		this.gameInfo.canDrawToken = false;

		this.board.clear();
		this.defaultButton.open();
		this.gameInfo.state = GameState.NATURE_PICK_ANY;
	}

	/**
	 * 토큰을 선택하는 경우는 둘중 하나
	 *
	 * 1. NatureToken을 사용하여 Pick Any Tile/Token 할때
	 *
	 * 2. NatureToken을 사용하여 Clear Tokens 할때
	 *
	 *
	 * @param tokenInfo
	 */
	private async naturePickAnyToken(tokenInfo: PocketTokenInfo) {
		if (this.gameInfo.state == GameState.NATURE_CLEAR_TOKEN) {
			if (this.gameInfo.natureClear.has(tokenInfo.index)) {
				this.gameInfo.natureClear.delete(tokenInfo.index);
			} else {
				this.gameInfo.natureClear.add(tokenInfo.index);
			}
			this.pocket.toggleToken(tokenInfo.index, 2);
		} else if (this.gameInfo.state == GameState.NATURE_PICK_ANY) {
			this.gameInfo.pocketToken = tokenInfo;
			this.pocket.selectTokenOnly(tokenInfo.index, 1);
			const isVlidToken = this.board.checkValidToken(tokenInfo.wildlife);
			if (isVlidToken) {
				//계속 진행
				this.gameInfo.canPickTile = false;
				this.gameInfo.canDrawTile = false;
				this.gameInfo.canDrawToken = true;
				this.board.clear();
				this.defaultButton.open();
				// this.gameInfo.state = this.gameInfo.lastState;
			} else {
				this.gameInfo.canPickTile = false;
				this.gameInfo.canDrawTile = false;
				this.gameInfo.canPickToken = false;
				this.gameInfo.canDrawToken = false;
				this.startModal();
				const throwToken = (await this.modal.open('NO_PLACEMENT_NATURE')) as boolean;
				this.endModal();
				if (throwToken) this.throwToken();
				else this.undoNature();
			}
		}
	}

	private async undoNature() {
		// 토큰 선택 취소
		this.pocket.toggleToken(this.gameInfo.pocketToken!.index, 1);
		this.gameInfo.pocketToken = null;
		this.gameInfo.canPickTile = false;
		this.gameInfo.canDrawTile = false;
		this.gameInfo.canPickToken = true;
		this.gameInfo.canDrawToken = false;
	}

	private async confirmTile() {
		// 일단 버튼 지우고
		this.board.closeTileAction();
		// 타일 관련 행위 못하게 막고
		this.gameInfo.canDrawTile = false;
		this.gameInfo.canPickTile = false;

		if (this.gameInfo.lastState == GameState.NATURE_PICK_ANY) {
			//  PICK ANY 일떄
			this.board.faint();
			await this.modal.open('PICK_TOKEN');
			this.board.clear();

			this.gameInfo.canPickToken = true;
			this.gameInfo.canUndo = true;

			this.board.confirmTile(this.gameInfo.targetTileID!);
			this.gameInfo.state = this.gameInfo.lastState;
			this.defaultButton.open();
		}
		// 보통의 경우
		// 선택된 타일과 같은 행에 있는 토큰을 자동으로 선택
		else {
			this.gameInfo.canPickToken = false;
			const index = this.gameInfo.pocketTile!.index;
			const wildlife = this.pocket.getWildLife(index)!;
			this.gameInfo.pocketToken = { index, wildlife };

			const hasVlidPlacement = this.board.checkValidToken(wildlife);
			if (hasVlidPlacement) {
				//계속 진행
				this.pocket.selectTokenOnly(index, 1);
				this.gameInfo.canDrawToken = true;
				this.gameInfo.canUndo = true;
				this.board.confirmTile(this.gameInfo.targetTileID!);
				this.gameInfo.state = this.gameInfo.lastState;
				this.defaultButton.open();
			} else {
				this.gameInfo.canPickTile = false;
				this.gameInfo.canDrawTile = false;
				this.gameInfo.canPickToken = false;
				this.gameInfo.canDrawToken = false;
				await this.noPlacement();
			}
		}
	}

	private async throwToken() {
		this.gameInfo.state = GameState.WAIT;
		this.gameInfo.useRefill = false;
		this.gameInfo.canRefill = false;
		this.gameInfo.turnlefts -= 1;
		this.infoUI.reset();
		const tileIndex = this.gameInfo.myTile!;
		const tokenIndex = this.gameInfo.myToken!;
		this.board.drawBlank(this.gameInfo.targetTileID!);
		this.board.confirmTile(this.gameInfo.targetTileID!);
		if (this.gameInfo.turnlefts == 0) {
			this.calculate();
		} else {
			this.gameInfo.targetTileID = null;
			this.gameInfo.targetTokenID = null;
			this.gameInfo.pocketTile = null;
			this.gameInfo.pocketToken = null;
			this.pocket.processTile(tileIndex);
			this.pocket.processToken(tokenIndex, true);
		}
	}

	private async noPlacement() {
		this.startModal();
		const throwToken = (await this.modal.open('NO_PLACEMENT')) as boolean;
		this.endModal();
		if (throwToken) {
			this.board.drawBlank(this.gameInfo.targetTileID!);
			await this.throwToken();
		} else {
			this.mediator.notifyObservers({ type: 'UNDO' });
		}
	}

	private async clearAction() {
		this.gameInfo.natureToken -= 1;
		await this.modal.open('CLEAR_TOKEN');
		this.gameInfo.canPickTile = false;
		this.gameInfo.canDrawTile = false;
		this.gameInfo.canPickToken = true;
		this.gameInfo.canDrawToken = false;
		this.gameInfo.state = GameState.NATURE_CLEAR_TOKEN;
		this.board.clear();
		await this.clearButton.open();
		const shouldThrow = [...this.gameInfo.natureClear];
		this.gameInfo.natureClear.clear();
		await this.pocket.natureClear(shouldThrow);
	}

	private calculate() {
		const mapData = this.board.getMapData();
		const tileScore = new TileScoring(mapData);
		console.log(tileScore.getScore());
	}

	// private async naturePickTile() {
	// 	this.startModal();
	// 	await this.modal.open('PICK_TILE');
	// 	this.gameInfo.canPickTile = true;
	// 	this.endModal();
	// }

	// private async natureConfirmTile() {
	// 	this.startModal();
	// 	await this.modal.open('PICK_TOKEN');
	// 	this.gameInfo.canPickTile = false;
	// 	this.gameInfo.canDrawTile = false;
	// 	this.gameInfo.canPickToken = true;
	// 	this.endModal();
	// }
}

// case MediatorEventType.END:
// 	this.gameState = GameState.READY;
// 	this.useRefill = false;
// 	this.canRefill = false;
// 	this.turnLefts = this.turnLefts - 1;
// 	if (eventData.data.addNatureToken) {
// 		this.natureToken += 1;
// 	}
// 	this.info.reset();
// 	if (this.turnLefts == 0) {
// 		this.notifyObservers({ type: MediatorEventType.CALCULATE });
// 	} else {
// 		const tileIndex = this.myTile!;
// 		const tokenIndex = this.myToken!;
// 		this.pocket.processTile(tileIndex);
// 		this.pocket.processToken(tokenIndex);
// 		this.board.drawBlank(this.targetTileID!);
// 		this.targetTileID = null;
// 		this.targetTokenID = null;
// 		this.pocketTile = null;
// 		this.pocketToken = null;
// 	}
// 	break;

// case MediatorEventType.DUPLICATE_ALL:
// 	this.duplicate = eventData.data;
// 	await this.modal.open('DUPLICATE_ALL');
// 	this.pocket.duplicateRefill();
// 	break;
// case MediatorEventType.DUPLICATE_THREE:
// 	this.canRefill = true;
// 	this.duplicate = eventData.data;
// 	this.notifyObservers({ type: MediatorEventType.START });
// 	break;
// case MediatorEventType.PICK_TILE:
// 	this.pocketTile = eventData.data;
// 	this.canDrawTile = true;
// 	this.pocket.highlightTile(eventData.data.index);
// 	break;
// case MediatorEventType.PUT_TILE:
// 	this.targetTileID = eventData.data;
// 	this.gameState = GameState.TILE_ACTION;
// 	this.canDrawTile = false;
// 	this.canPickTile = false;
// 	this.modal.open('ACTION');
// 	this.defaultButton.close();
// 	break;
// case MediatorEventType.PICK_TOKEN:
// 	this.pocketToken = eventData.data;
// 	this.canDrawToken = true;
// 	break;
// case MediatorEventType.PUT_TOKEN:
// 	break;
// case MediatorEventType.CANCEL_TILE:
// 	this.canUndo = false;
// 	this.notifyObservers({ type: MediatorEventType.UNDO });
// 	this.modal.close('ACTION');
// 	this.defaultButton.open();
// 	break;
// case MediatorEventType.CONFIRM_TILE:
// 	this.canDrawTile = false;
// 	this.canPickTile = false;

// 	this.modal.close('ACTION');

// 	if (this.useNature) {
// 		this.canPickToken = true;
// 		this.canUndo = true;
// 		// picktoken 모달 띄우기
// 		// await this.modal.open();
// 	} else {
// 		this.canPickToken = false;
// 		const index = this.pocketTile!.index;
// 		const wildlife = this.pocket.getWildLife(index)!;
// 		this.pocketToken = { index, wildlife };
// 		const isVlidToken = this.board.checkValidToken(wildlife);
// 		if (isVlidToken) {
// 			this.pocket.selectTokenOnly(index, 1);
// 			this.canDrawToken = true;
// 			this.canUndo = true;
// 			this.board.confirmTile(this.targetTileID!);
// 		} else {
// 			this.canPickTile = false;
// 			this.canDrawTile = false;
// 			this.canPickToken = false;
// 			this.canDrawToken = false;
// 			this.notifyObservers({ type: MediatorEventType.NO_PLACEMENT });
// 		}
// 	}

// 	// this.defaultButton.open();

// 	this.notifyObservers({ type: MediatorEventType.MODAL_CLOSE });

// 	break;

// case MediatorEventType.ROTATE_TILE_CW:
// 	this.board.rotateTile(this.targetTileID!, 60);
// 	break;
// case MediatorEventType.ROTATE_TILE_CCW:
// 	this.board.rotateTile(this.targetTileID!, -60);
// 	break;
// case MediatorEventType.NO_PLACEMENT:
// 	this.modal.open('NO_PLACEMENT');
// 	break;
// case MediatorEventType.REPLACE:
// 	this.modal.open('DUPLICATE_THREE');
// 	break;
// case MediatorEventType.REFILL:

// case MediatorEventType.THROW_TOKEN:

// case MediatorEventType.USE_NATURE:
// 	this.modal.open('USE_NATURE');
// 	break;
// case MediatorEventType.MODAL_OPEN:
// 	this.board.faint();
// 	this.gameState = GameState.WAIT;
// 	this.defaultButton.close();
// 	break;
// case MediatorEventType.MODAL_CLOSE:
// 	this.board.clear();
// 	this.gameState = GameState.START;
// 	this.defaultButton.open();
// 	break;
