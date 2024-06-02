import {
	ActionManager,
	Color3,
	ExecuteCodeAction,
	HemisphericLight,
	PBRMaterial,
	PointLight,
	PredicateCondition,
	Scene,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { BaseModal, Mediator, WildLife } from '../../interfaces';
import { Select } from '../../assets/select';
import { Assets } from '../../assets';
import { GameInfo, GameState } from '../../gameInfo';
export class BearScoringA extends BaseModal {
	private _select: Select;
	private resolve: any;
	constructor(
		private scene: Scene,
		parent: TransformNode,
		protected mediator: Mediator,
		private gameInfo: GameInfo
	) {
		super(parent);

		const main = this.scene.getMeshById('test')!;
		main.setEnabled(true);
		main.parent = this.anchor;
		main.position = new Vector3(0, 0, 10);
		main.scalingDeterminant = 0.4;
		main.renderingGroupId = 1;
		// main.rotate(new Vector3(1, 0, 0), Tools.ToRadians(40));

		(main.material as PBRMaterial).disableDepthWrite = true;
		(main.material as PBRMaterial).unlit = true;

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
	}

	open() {
		super.open();
		return new Promise<void>((resolve) => {
			this.resolve = resolve;
		});
	}
}
