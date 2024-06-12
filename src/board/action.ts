import { ActionManager, ExecuteCodeAction, PredicateCondition, TransformNode } from '@babylonjs/core';
import { Assets } from '../assets';
import { GameInfo, GameState } from '../gameInfo';
import { Mediator } from '../interfaces';

export class TileActionButtons {
	private anchor!: TransformNode;
	constructor(assets: Assets, private readonly mediator: Mediator, private readonly gameInfo: GameInfo) {
		const positionX = {
			'action-cancel': -3,
			'action-cw': 1,
			'action-ccw': 3,
			'action-confirm': -1,
		};

		Object.entries(assets.tileAction).forEach((v) => {
			const [key, mesh] = v;
			mesh.setEnabled(true);
			const eventType = ('TILE_' + key.toUpperCase().replace('ACTION-', '')) as
				| 'TILE_CANCEL'
				| 'TILE_CONFIRM'
				| 'TILE_CW'
				| 'TILE_CCW';
			mesh.position.y -= 3.5;
			mesh.position.x += positionX[key as keyof typeof positionX];
			const actionManager = assets.actionManager;
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
			mesh.actionManager = actionManager;
			this.anchor = mesh.parent as TransformNode;
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
