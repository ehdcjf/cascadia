import { Scene, TransformNode } from '@babylonjs/core';

import { BaseModal, MODAL_TAG, Mediator } from '../interfaces';
import { NoPlacementModal } from './noPlacement';

import { GameInfo } from '../gameInfo';
import { DuplicateThreeModal } from './deplicateThree';
import { DuplicateAllModal } from './deplicateAll';
import { PickTokenModal } from './pickToken';
import { PickTileModal } from './pickTile';
import { UseNatureTokenModal } from './useNatureToken';
import { NatureNoPlacementModal } from './noPlacementNature';
import { ClearTokenModal } from './clearToken';
import { BearScoringA } from './scoring/bear-a';

export class Modal {
	private _anchor: TransformNode;
	private modals: Record<MODAL_TAG, BaseModal> = {} as Record<MODAL_TAG, BaseModal>;

	constructor(private scene: Scene, private mediator: Mediator, private gameInfo: GameInfo) {
		this._anchor = new TransformNode('modal-anchor', this.scene);
		const cam = this.scene.getCameraByName('board-cam')!;
		this._anchor.parent = cam;
		this.modals['NO_PLACEMENT_NATURE'] = new NatureNoPlacementModal(
			this.scene,
			this._anchor,
			this.mediator,
			this.gameInfo
		);

		this.modals['CLEAR_TOKEN'] = new ClearTokenModal(
			this.scene,
			this._anchor,
			this.mediator,
			this.gameInfo
		);

		this.modals['NO_PLACEMENT'] = new NoPlacementModal(
			this.scene,
			this._anchor,
			this.mediator,
			this.gameInfo
		);

		this.modals['DUPLICATE_ALL'] = new DuplicateAllModal(
			this.scene,
			this._anchor,
			this.mediator,
			this.gameInfo
		);
		this.modals['DUPLICATE_THREE'] = new DuplicateThreeModal(
			this.scene,
			this._anchor,
			this.mediator,
			this.gameInfo
		);
		this.modals['PICK_TOKEN'] = new PickTokenModal(this.scene, this._anchor, this.mediator, this.gameInfo);

		this.modals['PICK_TILE'] = new PickTileModal(this.scene, this._anchor, this.mediator, this.gameInfo);

		this.modals['USE_NATURE'] = new UseNatureTokenModal(
			this.scene,
			this._anchor,
			this.mediator,
			this.gameInfo
		);

		// this.modals['BEAR_A'] = new BearScoringA(this.scene, this._anchor, this.mediator, this.gameInfo);
	}

	async open(tag: MODAL_TAG): Promise<any> {
		return this.modals[tag].open();
	}

	close(tag: MODAL_TAG) {
		return this.modals[tag].close();
	}
}
