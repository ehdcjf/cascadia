import {
	ActionManager,
	ExecuteCodeAction,
	Observable,
	PredicateCondition,
	TransformNode,
	Vector3,
	Tools,
	Tags,
} from '@babylonjs/core';
import { SceneState } from './metadata';
import { Scene } from './scene';
import { Board } from './board';
import { Pocket } from './pocket';
import { ModalEvents } from './action';

export class Modal {
	readonly ACTION_TAG = 'ACTION';
	anchor: TransformNode;

	constructor(private scene: Scene, private readonly observable: Observable<ModalEvents>) {
		this.anchor = new TransformNode('modal-anchor', this.scene);
		this.anchor.parent = this.scene.getCameraByName('camera')!;

		// this.scene.registerBeforeRender(() => {
		// 	this.anchor.position.copyFrom(this.scene.getCameraByName('camera')!.position);
		// });
		this.setActionModal();
		// this.scene.meshes.forEach((mesh) => {
		// 	console.log(mesh.id);
		// });
	}

	private setActionModal() {
		[
			['action-cancel', -3, ModalEvents.TILE_CANCEL_ACTION],
			['action-confirm', -1, ModalEvents.TILE_CANCEL_ACTION],
			['action-ccw', 1, ModalEvents.TILE_CANCEL_ACTION],
			['action-cw', 3, ModalEvents.TILE_CANCEL_ACTION],
		].forEach((v) => {
			const [meshId, positionX, event] = v as [string, number, number];
			const actionButton = this.scene.getMeshById(meshId)!;
			Tags.EnableFor(actionButton);
			Tags.AddTagsTo(actionButton, this.ACTION_TAG);
			actionButton.position = new Vector3(positionX, -3.5, 10);
			actionButton.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			actionButton.parent = this.anchor;
			const actionManager = new ActionManager(this.scene);
			const action = new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (evt) => {
				this.observable.notifyObservers(event);
			});
			actionManager.registerAction(action);
			actionButton.actionManager = actionManager;
		});
	}

	public openActionModal() {
		this.scene.getMeshesByTags(this.ACTION_TAG).forEach((mesh) => {
			mesh.setEnabled(true);
		});
	}

	public closeActionModal() {
		this.scene.getMeshesByTags(this.ACTION_TAG).forEach((mesh) => {
			mesh.setEnabled(false);
		});
	}
}
