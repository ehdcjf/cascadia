import { ActionManager, Observable, Scene } from '@babylonjs/core';
import { Board } from './board/index';
import { Pocket } from './pocket/index';
import { PocketTileInfo } from './interfaces';
import { GameInfo, GameState } from './gameInfo';
export class Mediator {
	private pocketTileObservable: Observable<PocketTileInfo>;
	private pocketTokenObservable: Observable<any>;
	private tilePickObservable: Observable<any>;
	private tileOverObservable: Observable<any>;
	private tileOutObservable: Observable<any>;

	private board: Board;
	private pocket: Pocket;
	private gameInfo = new GameInfo();
	constructor(private scene: Scene) {
		this.pocketTileObservable = new Observable();
		this.pocketTokenObservable = new Observable();
		this.tilePickObservable = new Observable();
		this.tileOverObservable = new Observable();
		this.tileOutObservable = new Observable();

		this.board = new Board(this.scene, this.tilePickObservable, this.tileOverObservable, this.tileOutObservable);
		this.pocket = new Pocket(this.scene, this.pocketTileObservable, this.pocketTokenObservable);

		this.pocketTileObservable.add((eventData, _eventState) => {
			switch (this.gameInfo.state) {
				case GameState.PICK_TILE:
					this.gameInfo.pocketTile = eventData;
					this.pocket.selectOnly(eventData.index);
					break;
				default:
					return;
			}
		});

		this.boardObservable.add((_eventData, _eventState) => {
			ActionManager.OnPointerOutTrigger
			if(this.gameInfo.state==GameState.PICK_TILE && this.gameInfo.)


		});
	}
}
