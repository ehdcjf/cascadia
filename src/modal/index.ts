import { Scene, TransformNode } from '@babylonjs/core';
import { Mediator } from '../mediator';
import { BaseModal, WildLife } from '../interfaces';
import { TileActionModal } from './action';
import { NoPlacementModal } from './impossible';
import { DuplicateAllModal } from './deplicateAll';
import { DuplicateThreeModal } from './deplicateThree';
import { DefaultModal } from './default';
import { InfoModal } from './info';

export const MODAL_TAG = {
	DEFAULT: 'DEFAULT',
	ACTION: 'ACTION',
	DUPLICATE_THREE: 'DUPLICATE_THREE',
	DUPLICATE_ALL: 'DUPLICATE_ALL',
	NO_PLACEMENT: 'NO_PLACEMENT',
};

type MODAL_TAG = keyof typeof MODAL_TAG;

export class Modal {
	private _anchor: TransformNode;
	private modals: Record<MODAL_TAG, BaseModal> = {} as Record<MODAL_TAG, BaseModal>;
	constructor(private scene: Scene, private mediator: Mediator) {
		this._anchor = new TransformNode('modal-anchor', this.scene);
		this._anchor.parent = this.scene.getCameraByName('board-cam');

		new InfoModal(this.scene, this._anchor, this.mediator);
		this.modals['DEFAULT'] = new DefaultModal(this.scene, this._anchor, this.mediator);
		this.modals['ACTION'] = new TileActionModal(this.scene, this._anchor, this.mediator);
		this.modals['NO_PLACEMENT'] = new NoPlacementModal(this.scene, this._anchor, this.mediator);
		this.modals['DUPLICATE_ALL'] = new DuplicateAllModal(this.scene, this._anchor, this.mediator);
		this.modals['DUPLICATE_THREE'] = new DuplicateThreeModal(this.scene, this._anchor, this.mediator);
	}

	open(tag: MODAL_TAG) {
		this.modals[tag].open();
	}

	close(tag: MODAL_TAG) {
		this.modals[tag].close();
	}

	closeAll() {
		Object.values(this.modals).forEach((modal) => modal.close());
	}
}
