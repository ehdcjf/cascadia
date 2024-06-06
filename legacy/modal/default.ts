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
import { Mediator } from '../mediator';
import { BaseModal, MediatorEventType, WildLife } from '../interfaces';
import { Select } from '../assets/select';

export class DefaultModal extends BaseModal {
	private _select: Select;
	constructor(private scene: Scene, parent: TransformNode, private mediator: Mediator) {
		super(parent);
		this._select = new Select([
			this.scene.getMeshById('undo')!.clone('undo', this.anchor)!,
			this.scene.getMeshById('replace')!.clone('replace', this.anchor)!,
			this.scene.getMeshById('nature')!.clone('nature', this.anchor)!,
		]);
		const undoAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {},
			new PredicateCondition(this._select.actionMangers[0], () => this.mediator.canUndo)
		);
		this._select.actionMangers[0].registerAction(undoAction);

		const replaceAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {},
			new PredicateCondition(this._select.actionMangers[1], () => false)
		);
		this._select.actionMangers[1].registerAction(replaceAction);

		const natureAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {},
			new PredicateCondition(this._select.actionMangers[2], () => false)
		);
		this._select.actionMangers[2].registerAction(natureAction);
		this.open();
	}

	open() {
		this._select.meshes[0]!.visibility = this.mediator.canUndo ? 1 : 0.3;
		this._select.meshes[1]!.visibility = this.mediator.duplicateThree ? 1 : 0.3;
		this._select.meshes[2]!.visibility = this.mediator.natureToken > 0 ? 1 : 0.3;

		super.open();
	}
}
