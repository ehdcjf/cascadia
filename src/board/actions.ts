import {
	ActionManager,
	ExecuteCodeAction,
	PBRMaterial,
	PredicateCondition,
	Scene,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { GameManager } from '../mediator';
import { BaseModal, Mediator } from '../interfaces';
import { Assets } from '../assets';
import { GameInfo, GameState } from '../gameInfo';
export class TileAction {
	anchor: any;
	constructor(private scene: Scene, private mediator: Mediator, private readonly gameInfo: GameInfo) {
		const cam = this.scene.getCameraByName('board-cam')!;
		this.anchor = Assets.getTransformNode('board-tile-anchor');
		this.anchor.parent = cam;

		[
			['action-cancel', -3, 'CANCEL_TILE'],
			['action-confirm', -1, 'CONFIRM_TILE'],
			['action-ccw', 1, 'ROTATE_TILE_CCW'],
			['action-cw', 3, 'ROTATE_TILE_CW'],
		].forEach((v) => {
			const [meshId, positionX, eventType] = v as [
				string,
				number,
				'CANCEL_TILE' | 'CONFIRM_TILE' | 'ROTATE_TILE_CCW' | 'ROTATE_TILE_CW'
			];
			const actionButton = this.scene.getMeshById(meshId)!;

			actionButton.position = new Vector3(positionX, -3.5, 10);
			actionButton.renderingGroupId = 1;
			actionButton.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			actionButton.parent = this.anchor;
			actionButton.setEnabled(true);
			(actionButton.material as PBRMaterial).unlit = true;
			const actionManager = Assets.getActionManger();
			const condition = new PredicateCondition(
				actionManager,
				() => this.gameInfo.state == GameState.WAIT
			);

			const action = new ExecuteCodeAction(
				ActionManager.OnPickDownTrigger,
				(_evt) => {
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
