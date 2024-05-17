import {
	AbstractMesh,
	ActionManager,
	Animation,
	ExecuteCodeAction,
	Observable,
	Scene,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { PocketTileInfo, TileInfo } from '../interfaces';
import { TileMesh } from '../assets/tile';

const slideDownY = [-3, -1, 1, 3];
export class PocketTile {
	private _index: number = 4;
	constructor(
		private tileMesh: TileMesh,
		private _tileInfo: TileInfo,
		private readonly observable: Observable<PocketTileInfo>
	) {
		this.tileMesh.position = new Vector3(0.5, 5, 0);
		this.tileMesh.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
		this.tileMesh.scalingDeterminant = 0.7;
		this.tileMesh.material = _tileInfo;
		const pickDownAction = new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (_evt) => {
			this.observable.notifyObservers({ ...this.tileInfo, index: this.index });
		});
		this.tileMesh.actionManager.registerAction(pickDownAction);
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
		const src = this.tileMesh.position.y;
		const dest = slideDownY[destIndex];
		await Animation.CreateAndStartAnimation(
			'tile-slide-down',
			this.tileMesh,
			'position.y',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			src,
			dest,
			Animation.ANIMATIONLOOPMODE_CONSTANT
		)?.waitAsync();
	}

	async slideLeft() {
		await Animation.CreateAndStartAnimation(
			'tile-slide-left',
			this.tileMesh,
			'position.x',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			0.5,
			2,
			Animation.ANIMATIONLOOPMODE_CONSTANT
		)?.waitAsync();
		this.tileMesh.dispose();
	}

	async slideRight() {
		await Animation.CreateAndStartAnimation(
			'tile-slide-right',
			this.tileMesh,
			'position.x',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			0.5,
			-2,
			Animation.ANIMATIONLOOPMODE_CONSTANT
		)?.waitAsync();
		this.tileMesh.dispose();
	}

	showEdge() {
		this.tileMesh.edge = 'yellow';
	}

	hideEdge() {
		this.tileMesh.edge = 'none';
	}
}
