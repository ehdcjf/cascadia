import {
	AbstractMesh,
	ActionManager,
	Color3,
	Engine,
	ExecuteCodeAction,
	Material,
	PBRMaterial,
	PredicateCondition,
	Scene,
	Tags,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { Mediator } from '../mediator';
import { BaseModal, MediatorEventType, WildLife } from '../interfaces';
import { Select } from '../assets/select';
import { Assets } from '../assets';
export class NoPlacementModal extends BaseModal {
	private wildlife: Record<WildLife, AbstractMesh> = {} as Record<WildLife, AbstractMesh>;
	private _select: Select;
	constructor(private scene: Scene, parent: TransformNode, private mediator: Mediator) {
		super(parent);

		const main = this.scene.getMeshById('no-valid-placement')!;
		main.parent = this.anchor;
		main.position = new Vector3(0, 0, 10);
		main.scalingDeterminant = 0.3;
		main.renderingGroupId = 1;
		main.setEnabled(true);
		main.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));

		(['bear', 'elk', 'salmon', 'fox', 'hawk'] as WildLife[]).forEach((wildlife) => {
			const mesh = this.scene.getMeshById('no-valid-placement-' + wildlife)!;
			mesh.parent = this.anchor;
			mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			mesh.position = new Vector3(0, 0, 10);
			mesh.scalingDeterminant = 0.3;
			mesh.renderingGroupId = 1;
			this.wildlife[wildlife] = mesh;
		});

		this._select = new Select([Assets.getCancel(this.anchor), Assets.getConfirm(this.anchor)]);

		const cancelAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				this.mediator.notifyObservers({ type: MediatorEventType.CANCEL_NO_PLACEMENT });
			},
			new PredicateCondition(this._select.actionMangers[0], () => this.mediator.isNoPlacement())
		);

		const confirmAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				this.mediator.notifyObservers({ type: MediatorEventType.CONFIRM_NO_PLACEMENT });
			},
			new PredicateCondition(this._select.actionMangers[1], () => this.mediator.isNoPlacement())
		);

		this._select.actionMangers[0].registerAction(cancelAction);
		this._select.actionMangers[1].registerAction(confirmAction);

		this.close();
	}

	open() {
		const wildlife = this.mediator.wildlife;
		for (const key in this.wildlife) {
			if (key == wildlife) this.wildlife[key].setEnabled(true);
			else this.wildlife[key as WildLife].setEnabled(false);
		}
		super.open();
	}
}
