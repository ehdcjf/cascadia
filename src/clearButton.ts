import {
	AbstractMesh,
	ActionManager,
	ExecuteCodeAction,
	PredicateCondition,
	Scene,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { GameManager } from './mediator';
import { Mediator } from './interfaces';
import { Select } from './assets/select';
import { GameInfo, GameState } from './gameInfo';

export class ClearButton {
	private _select: Select;
	private anchor: TransformNode;
	private resolve: any;
	constructor(private scene: Scene, private readonly gameInfo: GameInfo) {
		this.anchor = new TransformNode('modal-anchor', this.scene);
		const cam = this.scene.getCameraByName('board-cam')!;
		this.anchor.parent = cam;

		this._select = new Select([this.scene.getMeshById('clear')!.clone('clear', this.anchor)!]);

		const natureDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				this._select.actionMangers[0].hoverCursor = 'default';
				this.close();
				if (this.resolve) {
					this.resolve();
				}
			},
			new PredicateCondition(
				this._select.actionMangers[0],
				() =>
					this.gameInfo.state == GameState.NATURE_CLEAR_TOKEN &&
					this.gameInfo.natureClear.size > 0
			)
		);
		const natureOverAction = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
			this._select.actionMangers[0].hoverCursor =
				this.gameInfo.state == GameState.NATURE_CLEAR_TOKEN &&
				this.gameInfo.natureClear.size > 0
					? 'pointer'
					: 'not-allowed';
		});
		const natureOutAction = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
			this._select.actionMangers[0].hoverCursor = 'default';
		});
		this._select.actionMangers[0].registerAction(natureDownAction);
		this._select.actionMangers[0].registerAction(natureOverAction);
		this._select.actionMangers[0].registerAction(natureOutAction);
		this._select.actionMangers[0].hoverCursor = 'default';
		this.close();
	}

	open() {
		this.anchor.setEnabled(true);
		return new Promise((resolve) => {
			this.resolve = resolve;
		});
	}

	close() {
		this.anchor.setEnabled(false);
	}
}
