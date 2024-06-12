import { AbstractMesh, ActionManager, ExecuteCodeAction, PredicateCondition, TransformNode } from '@babylonjs/core';
import { Mediator } from './interfaces';
import { GameInfo, GameState } from './gameInfo';
import { Assets } from './assets';

export class DefaultButtons {
	private anchor: TransformNode;
	private undo: AbstractMesh;
	private replace: AbstractMesh;
	private nature: AbstractMesh;

	constructor(assets: Assets, private readonly mediator: Mediator, private readonly gameInfo: GameInfo) {
		this.anchor = assets.transformNode;
		this.anchor.name = 'default-button-anchor';
		this.anchor.parent = assets.modalAnchor;
		this.undo = assets.buttonMeshes['undo'].clone('undo', this.anchor)!;
		this.undo.position.x -= 2.5;
		this.undo.setEnabled(true);
		this.replace = assets.buttonMeshes['replace'].clone('replace', this.anchor)!;
		this.replace.setEnabled(true);
		this.nature = assets.buttonMeshes['nature'].clone('nature', this.anchor)!;
		this.nature.position.x += 2.5;
		this.nature.setEnabled(true);

		const undoActionManger = assets.actionManager;
		this.undo.actionManager = undoActionManger;
		const undoDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				undoActionManger.hoverCursor = 'default';
				this.mediator.notifyObservers({ type: 'UNDO' });
			},
			new PredicateCondition(
				undoActionManger,
				() => this.gameInfo.state == GameState.START && this.gameInfo.canUndo
			)
		);
		const undoOverAction = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
			undoActionManger.hoverCursor = this.gameInfo.canUndo ? 'pointer' : 'default';
		});

		const undoOutAction = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
			undoActionManger.hoverCursor = 'default';
		});

		this.undo.actionManager.registerAction(undoDownAction);
		this.undo.actionManager.registerAction(undoOverAction);
		this.undo.actionManager.registerAction(undoOutAction);
		this.undo.actionManager.hoverCursor = 'default';

		const replaceActionManger = assets.actionManager;

		const replaceDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				replaceActionManger.hoverCursor = 'default';
				this.mediator.notifyObservers({ type: 'REPLACE' });
				this.close();
			},
			new PredicateCondition(
				replaceActionManger,
				() =>
					this.gameInfo.state == GameState.START &&
					!this.gameInfo.useRefill &&
					this.gameInfo.canRefill
			)
		);
		const replaceOverAction = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
			replaceActionManger.hoverCursor =
				!this.gameInfo.useRefill && this.gameInfo.canRefill ? 'pointer' : 'default';
		});
		const replaceOutAction = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
			replaceActionManger.hoverCursor = 'default';
		});
		replaceActionManger.registerAction(replaceDownAction);
		replaceActionManger.registerAction(replaceOverAction);
		replaceActionManger.registerAction(replaceOutAction);
		replaceActionManger.hoverCursor = 'default';
		this.replace.actionManager = replaceActionManger;

		const natureActionManger = assets.actionManager;

		const natureDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				natureActionManger.hoverCursor = 'default';

				this.mediator.notifyObservers({ type: 'USE_NATURE' });
				this.close();
			},
			new PredicateCondition(
				natureActionManger,
				() =>
					this.gameInfo.state == GameState.START &&
					this.gameInfo.natureToken > 0 &&
					!this.gameInfo.targetTileID
			)
		);
		const natureOverAction = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
			natureActionManger.hoverCursor =
				this.gameInfo.state == GameState.START &&
				this.gameInfo.natureToken > 0 &&
				!this.gameInfo.targetTileID
					? 'pointer'
					: 'default';
		});
		const natureOutAction = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
			natureActionManger.hoverCursor = 'default';
		});

		natureActionManger.registerAction(natureDownAction);
		natureActionManger.registerAction(natureOverAction);
		natureActionManger.registerAction(natureOutAction);
		natureActionManger.hoverCursor = 'default';
		this.nature.actionManager = natureActionManger;
		this.close();
	}

	open() {
		this.undo.visibility = this.gameInfo.state == GameState.START && this.gameInfo.canUndo ? 1 : 0.3;
		this.replace.visibility =
			this.gameInfo.state == GameState.START && !this.gameInfo.useRefill && this.gameInfo.canRefill
				? 1
				: 0.3;
		this.nature.visibility =
			this.gameInfo.state == GameState.START && this.gameInfo.natureToken > 0 ? 1 : 0.3;
		this.anchor.setEnabled(true);
	}

	close() {
		this.anchor.setEnabled(false);
	}
}
