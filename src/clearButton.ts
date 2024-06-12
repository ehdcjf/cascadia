import { AbstractMesh, ActionManager, ExecuteCodeAction, PredicateCondition, TransformNode } from '@babylonjs/core';
import { GameInfo, GameState } from './gameInfo';
import { Assets } from './assets';

export class ClearButton {
	private clear: AbstractMesh;
	private anchor: TransformNode;
	private resolve: any;
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		this.anchor = assets.transformNode;
		this.anchor.name = 'clear-button-anchor';
		this.anchor.parent = assets.modalAnchor;

		this.clear = assets.buttonMeshes['clear'].clone('clear', this.anchor)!;
		this.clear.setEnabled(true);

		const clearActionManger = assets.actionManager;

		const clearDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				clearActionManger.hoverCursor = 'default';
				this.close();
				if (this.resolve) {
					this.resolve();
				}
			},
			new PredicateCondition(
				clearActionManger,
				() =>
					this.gameInfo.state == GameState.NATURE_CLEAR_TOKEN &&
					this.gameInfo.natureClear.size > 0
			)
		);
		const clearOverAction = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
			clearActionManger.hoverCursor =
				this.gameInfo.state == GameState.NATURE_CLEAR_TOKEN &&
				this.gameInfo.natureClear.size > 0
					? 'pointer'
					: 'not-allowed';
		});

		const clearOutAction = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
			clearActionManger.hoverCursor = 'default';
		});

		clearActionManger.registerAction(clearDownAction);
		clearActionManger.registerAction(clearOverAction);
		clearActionManger.registerAction(clearOutAction);
		clearActionManger.hoverCursor = 'default';
		this.clear.actionManager = clearActionManger;

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
