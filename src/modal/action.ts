import {
	ActionManager,
	ExecuteCodeAction,
	PredicateCondition,
	Scene,
	Tags,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { Mediator } from '../mediator';
import { BaseModal, MediatorEventType } from '../interfaces';
import { Assets } from '../assets';
export class TileActionModal extends BaseModal {
	constructor(private scene: Scene, parent: TransformNode, private mediator: Mediator) {
		super(parent);

		[
			['action-cancel', -3, MediatorEventType.CANCEL_TILE],
			['action-confirm', -1, MediatorEventType.CONFIRM_TILE],
			['action-ccw', 1, MediatorEventType.ROTATE_TILE_CCW],
			['action-cw', 3, MediatorEventType.ROTATE_TILE_CW],
		].forEach((v) => {
			const [meshId, positionX, eventType] = v as [string, number, number];
			const actionButton = this.scene.getMeshById(meshId)!;

			actionButton.position = new Vector3(positionX, -3.5, 10);
			actionButton.renderingGroupId = 1;
			actionButton.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			actionButton.parent = this.anchor;
			actionButton.setEnabled(true);
			const actionManager = Assets.getActionManger();
			const condition = new PredicateCondition(actionManager, () => this.mediator.canTileAction());

			const action = new ExecuteCodeAction(
				ActionManager.OnPickDownTrigger,
				(evt) => {
					this.mediator.notifyObservers({ type: eventType });
				},
				condition
			);
			actionManager.registerAction(action);
			actionButton.actionManager = actionManager;
		});
		this.close();
	}

	open() {
		this.anchor.setEnabled(true);
	}

	close() {
		this.anchor.setEnabled(false);
	}
}
