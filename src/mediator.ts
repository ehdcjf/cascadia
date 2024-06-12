import { Color4, Matrix, Observable, PointerEventTypes, Scene, Viewport } from '@babylonjs/core';
import { Board } from './board/index';
import { Pocket } from './pocket/index';
import { MediatorEvent, PocketTokenInfo, ScoringTypes, ScoringWildlife, WildLife } from './interfaces';
import { GameInfo, GameState } from './gameInfo';
import { DefaultButtons } from './defaultButtons';
import { InfoUI } from './info';
import { ClearButton } from './clearButton';
import { Assets } from './assets';
import { Modals } from './modal';
import { ScoringCard } from './score';
import { TileScoring } from './calculate/tile';
import { TokenScoring } from './calculate/token';
export class GameManager {
	private board: Board;
	private pocket: Pocket;
	private modal: Modals;
	private defaultButton: DefaultButtons;
	private clearButton: ClearButton;
	private infoUI: InfoUI;
	private gameInfo: GameInfo;
	private mediator = new Observable<MediatorEvent>();
	asset: Assets;
	scoringCard: ScoringCard;
	tokenScore?: TokenScoring;
	constructor(
		private scene: Scene,
		private scoreType: ScoringTypes = {
			Bear: 'A',
			Elk: 'A',
			Fox: 'A',
			Hawk: 'A',
			Salmon: 'A',
		}
	) {
		this.gameInfo = new GameInfo();
		this.asset = new Assets(scene);
		this.modal = new Modals(this.asset, this.gameInfo);
		this.pocket = new Pocket(this.asset, this.mediator, this.gameInfo);
		this.board = new Board(this.asset, this.mediator, this.gameInfo);
		this.infoUI = new InfoUI(this.asset, this.gameInfo);

		this.scoringCard = new ScoringCard(this.asset, this.mediator, this.scoreType);
		this.defaultButton = new DefaultButtons(this.asset, this.mediator, this.gameInfo);
		this.clearButton = new ClearButton(this.asset, this.gameInfo);
		this.mediator.add(async (eventData, _eventState) => {
			switch (eventData.type) {
				case 'SHOW_SCORING_CARD':
					this.openScoringCard(eventData.data);
					break;
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
					await this.modal.open('ALL_DULPLICATE_TOKEN', eventData.data);
					this.endModal();
					this.pocket.duplicateRefill();
					break;
				case 'TILE_CANCEL': //DONE
					this.board.closeTileAction();
					this.board.cleanTile(this.gameInfo.targetTileID!);
					this.pocket.cleanAllTiles();
					// if (this.gameInfo.myToken) this.pocket.toggleToken(this.gameInfo.myToken, 1);
					this.mediator.notifyObservers({ type: 'TURN_START' });
					break;
				case 'TILE_CCW': //DONE
					this.board.rotateTile(this.gameInfo.targetTileID!, -60);
					break;
				case 'TILE_CW': //DONE
					this.board.rotateTile(this.gameInfo.targetTileID!, 60);
					break;
				case 'UNDO':
					this.gameInfo.state = GameState.WAIT;
					this.board.cleanTile(this.gameInfo.targetTileID!);
					this.pocket.cleanAllTiles();
					this.pocket.cleanAllToken();
					this.mediator.notifyObservers({ type: 'TURN_START' });
					break;
				case 'USE_NATURE': // Nature Token 사용 버튼 눌렀을 때
					await this.useNature();
					break;
				//[x]: 타일 선택
				case 'PICK_TILE': // 이거는 상태에  별 차이 없는 이벤트
					this.gameInfo.pocketTile = eventData.data;
					this.gameInfo.canDrawTile = true;
					this.pocket.tileSelect(eventData.data.index);
					break;
				//[x]: 타일 액션 시작
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
					this.gameInfo.targetTileID = null;
					this.gameInfo.targetTokenID = null;
					this.gameInfo.pocketTile = null;
					this.gameInfo.pocketToken = null;
					this.gameInfo.canDrawTile = false;
					this.gameInfo.canDrawToken = false;
					if (this.gameInfo.turnlefts == 0) {
						this.calculate();
					} else {
						this.pocket.processTile(tileIndex);
						this.pocket.processToken(tokenIndex);
					}
					break;
				case 'TILE_CONFIRM':
					await this.confirmTile();
					break;
				case 'TOTAL_SCORE':
					this.scoringCard.total();
					this.board.tiles.forEach((mesh) => {
						mesh.stopAnim();
					});
					break;
				case 'NO_PLACEMENT':
					this.modal.open('NO_VALID_PLACEMENT');
					break;
			}
		});

		this.scene.onPointerObservable.add((event) => {
			/// ScoringIcon

			if (
				this.gameInfo.state == GameState.SCORING_CARD &&
				event.type == PointerEventTypes.POINTERDOWN
			) {
				const boardRay = this.scene.createPickingRay(
					this.scene.pointerX,
					this.scene.pointerY,
					Matrix.Identity(),
					this.scene.getCameraByName('board-cam')
				);

				const scoringRay = this.scene.createPickingRay(
					this.scene.pointerX,
					this.scene.pointerY,
					Matrix.Identity(),
					this.scene.getCameraByName('scoring-cam')
				);

				const hitCard = this.scene.pickWithRay(boardRay, (mesh) => {
					return mesh && mesh.name == 'card';
				})!;

				const hitIcon = this.scene.pickWithRay(scoringRay, (mesh) => {
					return mesh && mesh.name == 'scoring-icon';
				})!;

				if (hitIcon.hit) {
					this.openScoringCard(hitIcon.pickedMesh!.metadata);
				} else if (!hitCard.hit) {
					this.closeScoringCard();
				}
			}
		});
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
		const replaceToken = (await this.modal.open(
			'THREE_DULPLICATE_TOKEN',
			this.gameInfo.duplicate!
		)) as boolean;

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
		const natureAction = (await this.modal.open('USE_NATURE_TOKEN')) as number;
		if (natureAction == 0) this.endModal();
		else {
			this.infoUI.reset();
			if (natureAction == 1) this.naturePickAnyAction();
			else if (natureAction == 2) this.clearAction();
		}
	}

	private async naturePickAnyAction() {
		this.gameInfo.natureToken -= 1;
		await this.modal.open('NATURE_PICK_ANY_TILE');

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
			this.pocket.tokenInactiveToggle(tokenInfo.index);
		} else if (this.gameInfo.state == GameState.NATURE_PICK_ANY) {
			this.gameInfo.pocketToken = tokenInfo;
			this.pocket.tokenActiveOnly(tokenInfo.index);

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
				const throwToken = (await this.modal.open(
					'NATURE_NO_VALID_PLACEMENT',
					tokenInfo.wildlife
				)) as boolean;
				this.endModal();
				if (throwToken) this.throwToken();
				else this.undoNature();
			}
		}
	}

	private async undoNature() {
		// 토큰 선택 취소
		this.pocket.cleanAllToken();
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
			await this.modal.open('NATURE_PICK_ANY_TOKEN');
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
				this.pocket.tokenActiveOnly(index);
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
				await this.noPlacement(wildlife);
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

	private async noPlacement(wildlife: WildLife) {
		this.startModal();
		const throwToken = (await this.modal.open('NO_VALID_PLACEMENT', wildlife)) as boolean;
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
		await this.modal.open('NATURE_CLEAR_TOKEN');
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

	private async calculate() {
		this.gameInfo.state = GameState.CALCULATE;
		const mapData = this.board.getMapData();
		this.infoUI.dispose();
		this.defaultButton.close();
		this.scoringCard.total();

		this.asset.pocketCam.viewport = new Viewport(0, 0, 0.3, 1);
		this.asset.boardCam.viewport = new Viewport(0.3, 0, 0.6, 1);
		this.asset.scoringCam.viewport = new Viewport(0.9, 0, 0.1, 1);
		this.pocket.dispose();
		const tileScore = new TileScoring(mapData).getScore();
		this.tokenScore = new TokenScoring(mapData, this.scoreType);

		const wildlifeScore = [
			this.gameInfo.natureToken,
			this.tokenScore.bear.score,
			this.tokenScore.elk.score,
			this.tokenScore.fox.score,
			this.tokenScore.hawk.score,
			this.tokenScore.salmon.score,
		];

		const habitatScore = [
			tileScore.mountain.largestSet.length,
			tileScore.forest.largestSet.length,
			tileScore.desert.largestSet.length,
			tileScore.swamp.largestSet.length,
			tileScore.lake.largestSet.length,
		];

		this.scoringCard.end(wildlifeScore, habitatScore);
	}

	private setBackground(color: 'beige' | 'gray') {
		switch (color) {
			case 'beige':
				this.scene.clearColor = Color4.FromHexString('#e8dcca');
				break;
			case 'gray':
				this.scene.clearColor = Color4.FromHexString('#8c979a');
				break;
		}
	}

	private openScoringCard(wildlife: ScoringWildlife) {
		if (this.gameInfo.state == GameState.CALCULATE) {
			const key = wildlife.toLocaleLowerCase();
			const tokens = this.tokenScore![key as keyof TokenScoring].tiles.flat();
			for (const [key, tile] of this.board.tiles) {
				if (tokens.includes(key)) tile.playAnim();
				else tile.stopAnim();
			}
		} else {
			this.modal.hide();
			this.gameInfo.state = GameState.SCORING_CARD;
			this.setBackground('gray');
		}
		this.scoringCard.open(wildlife);
	}

	private closeScoringCard() {
		this.gameInfo.state = this.gameInfo.lastState;
		this.setBackground('beige');
		this.scoringCard.close();
		this.modal.show();
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
