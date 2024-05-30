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
import { BaseModal, Mediator, WildLife } from '../interfaces';
import { Select } from '../assets/select';
import { Assets } from '../assets';
import { GameInfo, GameState } from '../gameInfo';
export class NatureNoPlacementModal extends BaseModal {
	private wildlife: Record<WildLife, AbstractMesh> = {} as Record<WildLife, AbstractMesh>;
	private _select: Select;
	private resolve: any;
	constructor(
		private scene: Scene,
		parent: TransformNode,
		protected mediator: Mediator,
		private gameInfo: GameInfo
	) {
		super(parent);
		const main = this.scene.getMeshById('nature-no-valid-placement')!;
		main.parent = this.anchor;
		main.position = new Vector3(0, 0, 10);
		main.scalingDeterminant = 0.3;
		main.renderingGroupId = 1;
		main.setEnabled(true);
		main.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));

		(['bear', 'elk', 'salmon', 'fox', 'hawk'] as WildLife[]).forEach((wildlife) => {
			const mesh = this.scene.getMeshById(wildlife + '-token-text')!;
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
				if (this.resolve) {
					this.resolve(false);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(
				this._select.actionMangers[0],
				() => this.gameInfo.state == GameState.WAIT
			)
		);

		const confirmAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(true);
					this.resolve = null;
					this.close();
				}
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
		const wildlife = this.gameInfo.pocketToken!.wildlife;
		for (const key in this.wildlife) {
			if (key == wildlife) this.wildlife[key].setEnabled(true);
			else this.wildlife[key as WildLife].setEnabled(false);
		}
		super.open();

		return new Promise((resolve) => {
			this.resolve = resolve;
		});
	}
}
