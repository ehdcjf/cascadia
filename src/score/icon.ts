import {
	Action,
	ActionManager,
	ExecuteCodeAction,
	PredicateCondition,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { Assets } from '../assets';
import { Mediator, ScoringWildlife } from '../interfaces';
import { GameInfo, GameState } from '../gameInfo';

export class ScoringIcon {
	constructor(private readonly mediator: Mediator, private readonly gameInfo: GameInfo, assets: Assets) {
		const icon = assets.scoringIcon;
		const anchor = assets.transformNode;
		anchor.name = 'scoring-anchor';
		anchor.parent = assets.scoringCam;
		anchor.position.z += 10;

		Object.entries(icon).forEach((v, i) => {
			const [name, mesh] = v;
			const wildlife = name.split('-')[0];
			const type = (String.fromCharCode(wildlife.charCodeAt(0) - 32) +
				wildlife.substring(1)) as ScoringWildlife;
			mesh.position = new Vector3(0, (2 - i) * 1.5, 0);
			mesh.scalingDeterminant = 0.5;
			mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			mesh.rotate(new Vector3(0, 0, 1), Tools.ToRadians(180));
			mesh.parent = anchor;
			mesh.name = 'scoring-icon';
			mesh.metadata = type;
			mesh.setEnabled(true);
			//TODO: scoring card 띄우면 안되는 상황이 있으니 그거 확인해야함.
			const actionManager = assets.actionManager;
			actionManager.hoverCursor = 'default';
			const showScoringCardAction = new ExecuteCodeAction(
				ActionManager.OnPickTrigger,
				(_evt) => {
					this.mediator.notifyObservers({
						type: 'SHOW_SCORING_CARD',
						data: type,
					});
				},
				new PredicateCondition(
					actionManager,
					() => this.gameInfo.state != GameState.SCORING_CARD
				)
			);
			actionManager.registerAction(showScoringCardAction);

			const iconOverAction = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, (_evt) => {
				actionManager.hoverCursor = 'pointer';
			});
			actionManager.registerAction(iconOverAction);

			const iconOutAction = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, (_evt) => {
				actionManager.hoverCursor = 'default';
			});
			actionManager.registerAction(iconOutAction);
			mesh.actionManager = actionManager;
		});
	}
}
