import { ActionManager, ExecuteCodeAction, Animation, Observable, Scene, Vector3, Tools } from '@babylonjs/core';
import { TokenMesh } from '../assets/token';
import { Mediator } from '../mediator';
const slideDownY = [-3, -1, 1, 3];
const materialState = ['none', 'active', 'inactive'] as ('none' | 'active' | 'inactive')[];
export class PocketToken {
	private _index: number = 4;
	private state: number = 0;
	constructor(private scene: Scene, private _tokenMesh: TokenMesh, mediator: Mediator) {
		this._tokenMesh.position = new Vector3(-1, 5, 0);
		this._tokenMesh.scalingDeterminant = 0.6;
		this._tokenMesh.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
		this._tokenMesh.actionManager.hoverCursor = 'default';
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
