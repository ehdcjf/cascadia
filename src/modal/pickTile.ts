import {
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
export class PickTileModal extends BaseModal {
	private _select: Select;
	private resolve: any;
	constructor(
		private scene: Scene,
		parent: TransformNode,
		protected mediator: Mediator,
		private gameInfo: GameInfo
	) {
		super(parent);

		const main = this.scene.getMeshById('nature-turn-tile')!;
		main.parent = this.anchor;
		main.position = new Vector3(0, 0, 10);
		main.scalingDeterminant = 0.3;
		main.renderingGroupId = 1;
		main.setEnabled(true);
		main.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));

		this._select = new Select([Assets.getClose(this.anchor)]);
		const closeAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve();
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(
				this._select.actionMangers[0],
				() => this.gameInfo.state == GameState.WAIT
			)
		);
		this._select.actionMangers[0].registerAction(closeAction);
		this.close();
	}

	open() {
		super.open();
		return new Promise<void>((resolve) => {
			this.resolve = resolve;
		});
	}
}
