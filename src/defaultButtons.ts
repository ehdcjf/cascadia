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
import { Select } from '../legacy/select';
import { GameInfo, GameState } from './gameInfo';

export class DefaultButtons {
	private _select: Select;
	private anchor: TransformNode;
	constructor(private scene: Scene, private readonly mediator: Mediator, private readonly gameInfo: GameInfo) {
		this.anchor = new TransformNode('modal-anchor', this.scene);
		const cam = this.scene.getCameraByName('board-cam')!;
		this.anchor.parent = cam;

		this._select = new Select([
			this.scene.getMeshById('undo')!.clone('undo', this.anchor)!,
			this.scene.getMeshById('replace')!.clone('replace', this.anchor)!,
			this.scene.getMeshById('nature')!.clone('nature', this.anchor)!,
		]);

		const undoDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				this._select.actionMangers[0].hoverCursor = 'default';
				this.mediator.notifyObservers({ type: 'UNDO' });
			},
			new PredicateCondition(
				this._select.actionMangers[0],
				() => this.gameInfo.state == GameState.START && this.gameInfo.canUndo
			)
		);
		const undoOverAction = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
			this._select.actionMangers[0].hoverCursor = this.gameInfo.canUndo ? 'pointer' : 'default';
		});
		const undoOutAction = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
			this._select.actionMangers[0].hoverCursor = 'default';
		});
		this._select.actionMangers[0].registerAction(undoDownAction);
		this._select.actionMangers[0].registerAction(undoOverAction);
		this._select.actionMangers[0].registerAction(undoOutAction);
		this._select.actionMangers[0].hoverCursor = 'default';

		const replaceDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				this._select.actionMangers[1].hoverCursor = 'default';
				this.mediator.notifyObservers({ type: 'REPLACE' });
				this.close();
			},
			new PredicateCondition(
				this._select.actionMangers[1],
				() =>
					this.gameInfo.state == GameState.START &&
					!this.gameInfo.useRefill &&
					this.gameInfo.canRefill
			)
		);
		const replaceOverAction = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
			this._select.actionMangers[1].hoverCursor =
				!this.gameInfo.useRefill && this.gameInfo.canRefill ? 'pointer' : 'default';
		});
		const replaceOutAction = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
			this._select.actionMangers[1].hoverCursor = 'default';
		});
		this._select.actionMangers[1].registerAction(replaceDownAction);
		this._select.actionMangers[1].registerAction(replaceOverAction);
		this._select.actionMangers[1].registerAction(replaceOutAction);
		this._select.actionMangers[1].hoverCursor = 'default';

		const natureDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				this._select.actionMangers[2].hoverCursor = 'default';

				this.mediator.notifyObservers({ type: 'USE_NATURE' });
				this.close();
			},
			new PredicateCondition(
				this._select.actionMangers[2],
				() =>
					this.gameInfo.state == GameState.START &&
					this.gameInfo.natureToken > 0 &&
					!this.gameInfo.targetTileID
			)
		);
		const natureOverAction = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
			this._select.actionMangers[1].hoverCursor =
				this.gameInfo.state == GameState.START &&
				this.gameInfo.natureToken > 0 &&
				!this.gameInfo.targetTileID
					? 'pointer'
					: 'default';
		});
		const natureOutAction = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
			this._select.actionMangers[1].hoverCursor = 'default';
		});
		this._select.actionMangers[2].registerAction(natureDownAction);
		this._select.actionMangers[2].registerAction(natureOverAction);
		this._select.actionMangers[2].registerAction(natureOutAction);
		this._select.actionMangers[2].hoverCursor = 'default';

		this.close();
	}

	open() {
		this._select.meshes[0]!.visibility =
			this.gameInfo.state == GameState.START && this.gameInfo.canUndo ? 1 : 0.3;
		this._select.meshes[1]!.visibility =
			this.gameInfo.state == GameState.START && !this.gameInfo.useRefill && this.gameInfo.canRefill
				? 1
				: 0.3;
		this._select.meshes[2]!.visibility =
			this.gameInfo.state == GameState.START && this.gameInfo.natureToken > 0 ? 1 : 0.3;
		this.anchor.setEnabled(true);
	}

	close() {
		this.anchor.setEnabled(false);
	}
}
