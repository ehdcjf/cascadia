import { Scene, TransformNode } from '@babylonjs/core';
import { Mediator } from '../mediator';
import { BaseModal } from '../interfaces';
import { TileActionModal } from './action';

export const MODAL_TAG = {
	ACTION: 'ACTION',
	DUP3: 'DUP3',
};

type MODAL_TAG = keyof typeof MODAL_TAG;

export class Modal {
	private _anchor: TransformNode;
	private modals: Record<MODAL_TAG, BaseModal> = {} as Record<MODAL_TAG, BaseModal>;
	constructor(private scene: Scene, private mediator: Mediator) {
		this._anchor = new TransformNode('modal-anchor', this.scene);
		this._anchor.parent = this.scene.getCameraByName('board-cam');
		this.modals['ACTION'] = new TileActionModal(this.scene, this._anchor, this.mediator);
	}

	show(tag: MODAL_TAG) {
		this.modals[tag].show();
	}

	hide(tag: MODAL_TAG) {
		this.modals[tag].hide();
	}
}
