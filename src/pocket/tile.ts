import {
	AbstractMesh,
	ActionManager,
	Animation,
	ExecuteCodeAction,
	Observable,
	PredicateCondition,
	Scene,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { MediatorEventType, PocketTileInfo, TileInfo } from '../interfaces';
import { TileMesh } from '../assets/tile';
import type { Mediator } from '../mediator';
import { GameState } from '../gameInfo';

const slideDownY = [-3, -1, 1, 3];
export class PocketTile {
	private _index: number = 4;
	constructor(
		private scene: Scene,
		private _tileMesh: TileMesh,
		private _tileInfo: TileInfo,
		private readonly mediator: Mediator
	) {
		this._tileMesh.position = new Vector3(0.5, 5, 0);
		this._tileMesh.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
		this._tileMesh.scalingDeterminant = 0.7;
		this._tileMesh.material = _tileInfo;
		this._tileMesh.actionManager.hoverCursor = 'default';
		const pickTileCondition = new PredicateCondition(
			this._tileMesh.actionManager,
			() => this.mediator.gameState == GameState.PICK_TILE
		);

		const pickDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			(_evt) => {
				this._tileMesh.actionManager.hoverCursor = 'default';
				const type = MediatorEventType.SELECT_TILE;
				const data = { ...this._tileInfo, index: this._index };
				this.mediator.notifyObservers({ type, data });
			},
			pickTileCondition
		);
		this._tileMesh.actionManager.registerAction(pickDownAction);

		const pointerOverAction = new ExecuteCodeAction(
			ActionManager.OnPointerOverTrigger,
			(_evt) => {
				this._tileMesh.actionManager.hoverCursor = 'pointer';
			},
			pickTileCondition
		);
		this._tileMesh.actionManager.registerAction(pointerOverAction);

		const pointerOutAction = new ExecuteCodeAction(
			ActionManager.OnPointerOutTrigger,
			(_evt) => {
				this._tileMesh.actionManager.hoverCursor = 'default';
			},
			pickTileCondition
		);
		this._tileMesh.actionManager.registerAction(pointerOutAction);
	}

	get index() {
		return this._index;
	}

	get tileInfo() {
		return this._tileInfo;
	}

	// 아래로 내려가는 애니메이션 작동
	async slideDown(destIndex: number) {
		this._index = destIndex;
		const src = this._tileMesh.position.y;
		const dest = slideDownY[destIndex];
		await Animation.CreateAndStartAnimation(
			'tile-slide-down',
			this._tileMesh,
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
			this._tileMesh,
			'position.x',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			0.5,
			2,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			undefined,
			undefined,
			this.scene
		)?.waitAsync();
		this._tileMesh.dispose();
	}

	async slideRight() {
		await Animation.CreateAndStartAnimation(
			'tile-slide-right',
			this._tileMesh,
			'position.x',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			0.5,
			-2,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			undefined,
			undefined,
			this.scene
		)?.waitAsync();
		this._tileMesh.dispose();
	}

	showEdge() {
		this._tileMesh.edge = 'yellow';
	}

	hideEdge() {
		this._tileMesh.edge = 'none';
	}
}
