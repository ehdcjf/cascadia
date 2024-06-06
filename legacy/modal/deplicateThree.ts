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
import { BaseModal, Mediator } from '../interfaces';
import { Select } from '../assets/select';
import { Assets } from '../assets';
import { GameInfo, GameState } from '../gameInfo';

export class DuplicateThreeModal extends BaseModal {
	private _select: Select;
	private resolve: any;
	constructor(
		private scene: Scene,
		parent: TransformNode,
		protected readonly mediator: Mediator,
		private readonly gameInfo: GameInfo
	) {
		super(parent);

		const main = this.scene.getMeshById('duplicate3')!;
		main.parent = this.anchor;
		main.position = new Vector3(0, 0, 10);
		main.scalingDeterminant = 0.3;
		main.renderingGroupId = 1;
		main.setEnabled(true);
		main.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
		this._select = new Select([Assets.getCancel(this.anchor), Assets.getConfirm(this.anchor)]);

		const cancelAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				this.close();
				this.resolve(false);
			},
			new PredicateCondition(
				this._select.actionMangers[0],
				() => this.gameInfo.state == GameState.WAIT
			)
		);

		const confirmAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				this.close();
				this.resolve(true);
			},
			new PredicateCondition(
				this._select.actionMangers[1],
				() => this.gameInfo.state == GameState.WAIT
			)
		);

		this._select.actionMangers[0].registerAction(cancelAction);
		this._select.actionMangers[1].registerAction(confirmAction);

		this.close();
	}

	open() {
		this.anchor.setEnabled(true);
		return new Promise((resolve) => {
			this.resolve = resolve;
		});
	}
}
