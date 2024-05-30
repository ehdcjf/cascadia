import {
	ActionManager,
	ExecuteCodeAction,
	Animation,
	Observable,
	Scene,
	Vector3,
	Tools,
	PredicateCondition,
} from '@babylonjs/core';
import { TokenMesh } from '../assets/token';
import { GameManager } from '../mediator';
import { Mediator } from '../interfaces';
import { GameInfo, GameState } from '../gameInfo';
const slideDownY = [-3, -1, 1, 3];
const materialState = ['none', 'active', 'inactive'] as ('none' | 'active' | 'inactive')[];
export class PocketToken {
	private _index: number = 4;
	private state: number = 0;
	constructor(
		private scene: Scene,
		private _tokenMesh: TokenMesh,
		private readonly mediator: Mediator,
		private readonly gameInfo: GameInfo
	) {
		this._tokenMesh.position = new Vector3(-1, 5, 0);
		this._tokenMesh.scalingDeterminant = 0.6;
		this._tokenMesh.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
		this._tokenMesh.actionManager.hoverCursor = 'default';

		const pickTileCondition = new PredicateCondition(
			this._tokenMesh.actionManager,
			() => this.gameInfo.canPickToken
		);

		const pickDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			(_evt) => {
				this._tokenMesh.actionManager.hoverCursor = 'default';
				const type = 'PICK_TOKEN';
				const data = { wildlife: this.wildlife!, index: this._index };
				this.mediator.notifyObservers({ type, data });
			},
			pickTileCondition
		);
		this._tokenMesh.actionManager.registerAction(pickDownAction);

		const pointerOverAction = new ExecuteCodeAction(
			ActionManager.OnPointerOverTrigger,
			(_evt) => {
				this._tokenMesh.actionManager.hoverCursor = 'pointer';
			},
			pickTileCondition
		);
		this._tokenMesh.actionManager.registerAction(pointerOverAction);

		const pointerOutAction = new ExecuteCodeAction(
			ActionManager.OnPointerOutTrigger,
			(_evt) => {
				this._tokenMesh.actionManager.hoverCursor = 'default';
			},
			pickTileCondition
		);
		this._tokenMesh.actionManager.registerAction(pointerOutAction);
	}

	get index() {
		return this._index;
	}

	get wildlife() {
		return this._tokenMesh.wildlife;
	}

	toggle(value: number) {
		this.state = value == 0 ? 0 : this.state ^ value;
		this._tokenMesh.material = materialState[this.state];
	}

	dispose() {
		this._tokenMesh.dispose();
	}

	async slideDown(destIndex: number) {
		this._index = destIndex;
		const src = this._tokenMesh.position._y;
		const dest = slideDownY[destIndex];
		await Animation.CreateAndStartAnimation(
			'tile-slide-down',
			this._tokenMesh,
			'position.y',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			src,
			dest,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			undefined,
			undefined,
			this.scene
		)!.waitAsync();
	}

	async slideLeft() {
		await Animation.CreateAndStartAnimation(
			'tile-slide-left',
			this._tokenMesh,
			'position.x',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			-1,
			2,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			undefined,
			undefined,
			this.scene
		)?.waitAsync();
		this._tokenMesh.dispose();
	}

	async slideRight() {
		await Animation.CreateAndStartAnimation(
			'tile-slide-right',
			this._tokenMesh,
			'position.x',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			-1,
			-2,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			undefined,
			undefined,
			this.scene
		)?.waitAsync();
		this._tokenMesh.dispose();
	}
}
