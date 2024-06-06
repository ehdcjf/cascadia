import { Color4, Matrix, Observable, PointerEventTypes, Scene } from '@babylonjs/core';
import { Assets } from './assets';
import { ScoringIcon } from './score/icon';
import { CardMeshesKey, MediatorEvent, ScoringWildlife } from './interfaces';
import { GameInfo, GameState } from './gameInfo';
import { ScoringCard } from './score/card';

export class GameManager {
	private mediator = new Observable<MediatorEvent>();
	private _asset: Assets;
	private gameInfo = new GameInfo();
	private scoringCard: ScoringCard;
	constructor(private scene: Scene) {
		this._asset = new Assets(this.scene);

		new ScoringIcon(this.mediator, this.gameInfo, this._asset);
		this.scoringCard = new ScoringCard(this._asset);
		this.mediator.add(async (eventData, _eventState) => {
			switch (eventData.type) {
				case 'SHOW_SCORING_CARD':
					this.openScoringCard(eventData.data);
					break;
				case 'START':
			}
		});

		this.scene.onPointerObservable.add((event) => {
			/// ScoringIcon

			if (
				this.gameInfo.state == GameState.SCORING_CARD &&
				event.type == PointerEventTypes.POINTERDOWN
			) {
				const boardRay = this.scene.createPickingRay(
					this.scene.pointerX,
					this.scene.pointerY,
					Matrix.Identity(),
					this.scene.getCameraByName('board-cam')
				);

				const scoringRay = this.scene.createPickingRay(
					this.scene.pointerX,
					this.scene.pointerY,
					Matrix.Identity(),
					this.scene.getCameraByName('scoring-cam')
				);

				const hitCard = this.scene.pickWithRay(boardRay, (mesh) => {
					return mesh && mesh.name == 'card';
				})!;

				const hitIcon = this.scene.pickWithRay(scoringRay, (mesh) => {
					return mesh && mesh.name == 'scoring-icon';
				})!;

				if (hitIcon.hit) {
					this.openScoringCard(hitIcon.pickedMesh!.metadata);
				} else if (!hitCard.hit) {
					this.closeScoringCard();
				}
			}
		});
	}

	private setBackground(color: 'beige' | 'gray') {
		switch (color) {
			case 'beige':
				this.scene.clearColor = Color4.FromHexString('#e8dcca');
				break;
			case 'gray':
				this.scene.clearColor = Color4.FromHexString('#8c979a');
				break;
		}
	}

	private openScoringCard(wildlife: ScoringWildlife) {
		this.gameInfo.state = GameState.SCORING_CARD;
		this.setBackground('gray');
		const cardMeshKey = (wildlife + 'A') as CardMeshesKey;
		this.scoringCard.open(cardMeshKey);
	}

	private closeScoringCard() {
		this.gameInfo.state = this.gameInfo.lastState;
		this.setBackground('beige');
		this.scoringCard.close();
	}
}
