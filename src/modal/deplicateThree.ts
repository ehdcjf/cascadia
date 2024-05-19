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
import { Assets } from '../assets';
export class DuplicateThreeModal extends BaseModal {
	private _select: Select;
	constructor(private scene: Scene, parent: TransformNode, private mediator: Mediator) {
		super(parent);

		const main = this.scene.getMeshById('3-duplicate-token')!;
		main.parent = this.anchor;
		main.position = new Vector3(0, 0, 10);
		main.scalingDeterminant = 0.3;
		main.renderingGroupId = 1;
		main.setEnabled(true);
		main.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));

		this._select = new Select([
			Assets.getClose(this.anchor),
			this.scene.getMeshById('replace')!.clone('replace', this.anchor)!,
		]);
		const closeAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				this.mediator.notifyObservers({ type: MediatorEventType.SUFFLE });
			},
			new PredicateCondition(this._select.actionMangers[0], () => this.mediator.isDuplicateState())
		);
		this._select.actionMangers[0].registerAction(closeAction);
		this.close();
	}
}
