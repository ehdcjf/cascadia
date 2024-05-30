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
export class UseNatureTokenModal extends BaseModal {
	private _select: Select;
	private resolve: any;
	constructor(
		private scene: Scene,
		parent: TransformNode,
		protected mediator: Mediator,
		private gameInfo: GameInfo
	) {
		super(parent);

		const main = this.scene.getMeshById('use-nature-token')!;
		main.parent = this.anchor;
		main.position = new Vector3(0, 0, 10);
		main.scalingDeterminant = 0.3;
		main.renderingGroupId = 1;
		main.setEnabled(true);
		main.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
		this._select = new Select([
			Assets.getClose(this.anchor),
			this.scene.getMeshById('pick')!.clone('pick', this.anchor)!,
			this.scene.getMeshById('clear')!.clone('clear', this.anchor)!,
		]);

		const closeAction = new ExecuteCodeAction( // 아무것도 안하고 그냥 모달 닫기
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(0);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(
				this._select.actionMangers[0],
				() => this.gameInfo.state == GameState.WAIT
			)
		);

		const pickAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(1);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(
				this._select.actionMangers[1],
				() => this.gameInfo.state == GameState.WAIT
			)
		);
		const clearAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(2);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(
				this._select.actionMangers[2],
				() => this.gameInfo.state == GameState.WAIT
			)
		);

		this._select.actionMangers[0].registerAction(closeAction);
		this._select.actionMangers[1].registerAction(pickAction);
		this._select.actionMangers[2].registerAction(clearAction);

		this.close();
	}

	open() {
		super.open();
		return new Promise((resolve) => {
			this.resolve = resolve;
		});
	}
}
