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
export class DuplicateAllModal extends BaseModal {
	private wildlife: Record<WildLife, AbstractMesh> = {} as Record<WildLife, AbstractMesh>;
	private _select: Select;
	constructor(private scene: Scene, parent: TransformNode, private mediator: Mediator) {
		super(parent);

		const main = this.scene.getMeshById('all-duplicate-token')!;
		main.parent = this.anchor;
		main.position = new Vector3(0, 0, 10);
		main.scalingDeterminant = 0.3;
		main.renderingGroupId = 1;
		main.setEnabled(true);
		main.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));

		(['bear', 'elk', 'salmon', 'fox', 'hawk'] as WildLife[]).forEach((wildlife) => {
			const mesh = this.scene.getMeshById('all-duplicate-token-' + wildlife)!;
			mesh.parent = this.anchor;
			mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			mesh.position = new Vector3(0, 0, 10);
			mesh.scalingDeterminant = 0.3;
			mesh.renderingGroupId = 1;
			this.wildlife[wildlife] = mesh;
		});

		this._select = new Select([Assets.getClose(this.anchor)]);
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

	open() {
		const wildlife = this.mediator.duplicate!;
		for (const key in this.wildlife) {
			if (key == wildlife) this.wildlife[key].setEnabled(true);
			else this.wildlife[key as WildLife].setEnabled(false);
		}
		super.open();
	}
}
