import { ActionManager, Animation, ExecuteCodeAction, PredicateCondition } from '@babylonjs/core';
import { PocketTileMesh } from '../assets/pocketTile';
import { GameInfo } from '../gameInfo';
import { Mediator, TileInfo } from '../interfaces';
const slideDownY = [-3, -1, 1, 3];

export class PocketTile {
	public index: number = 4;
	constructor(
		private mesh: PocketTileMesh,
		public _tileInfo: TileInfo,
		private readonly mediator: Mediator,
		private readonly gameInfo: GameInfo
	) {
		this.mesh.draw(_tileInfo.habitats, _tileInfo.wildlife);

		const pickTileCondition = new PredicateCondition(
			this.mesh.actionManager,
			() => this.gameInfo.canPickTile
		);

		const pickDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			(_evt) => {
				console.log(_evt.meshUnderPointer!.name);
				this.mesh.actionManager.hoverCursor = 'default';
				const type = 'PICK_TILE';
				const data = { ...this._tileInfo, index: this.index };
				this.mediator.notifyObservers({ type, data });
			},
			pickTileCondition
		);
		this.mesh.actionManager.registerAction(pickDownAction);

		const pointerOverAction = new ExecuteCodeAction(
			ActionManager.OnPointerOverTrigger,
			(_evt) => {
				this.mesh.actionManager.hoverCursor = 'pointer';
			},
			pickTileCondition
		);
		this.mesh.actionManager.registerAction(pointerOverAction);

		const pointerOutAction = new ExecuteCodeAction(
			ActionManager.OnPointerOutTrigger,
			(_evt) => {
				this.mesh.actionManager.hoverCursor = 'default';
			},
			pickTileCondition
		);
		this.mesh.actionManager.registerAction(pointerOutAction);
	}

	async slideDown(destIndex: number) {
		this.index = destIndex;
		const src = this.mesh.position._y;
		const dest = slideDownY[destIndex];

		await Animation.CreateAndStartAnimation(
			'tile-slide-down',
			this.mesh,
			'position.y',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			src,
			dest,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			undefined,
			undefined,
			this.mesh.scene
		)!.waitAsync();
	}

	async slideLeft() {
		await Animation.CreateAndStartAnimation(
			'tile-slide-left',
			this.mesh,

			'position.x',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			0.5,
			2,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			undefined,
			undefined,
			this.mesh.scene
		)?.waitAsync();
		this.mesh.dispose();
	}

	async slideRight() {
		await Animation.CreateAndStartAnimation(
			'tile-slide-right',
			this.mesh,
			'position.x',
			60, // 1초에 10 프레임.
			50, // 총 50프레임이니까  5/6초 약 0.8초짜리 애니메이션
			0.5,
			-2,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			undefined,
			undefined,
			this.mesh.scene
		)?.waitAsync();
		this.mesh.dispose();
	}

	select() {
		this.mesh.select();
	}

	clean() {
		this.mesh.clean();
	}
}
