import { AbstractMesh, ArcRotateCamera, Vector3 } from '@babylonjs/core';
import { Assets } from '../assets';
import { CardMeshes, CardMeshesKey } from '../interfaces';

export class ScoringCard {
	private _card: CardMeshes;
	private now: CardMeshesKey | null = null;
	private boardCam: ArcRotateCamera;
	private originCamPosition?: Vector3;
	private originCamTarget?: Vector3;
	constructor(assets: Assets) {
		this._card = assets.card;
		this.boardCam = assets.boardCam as ArcRotateCamera;
	}

	open(key: CardMeshesKey) {
		if (this.now) {
			this._card[this.now!].setEnabled(false);
		}
		this.now = key;
		// this.originCamPosition = this.boardCam.position.clone();
		// this.originCamTarget = this.boardCam.target.clone();
		// this.boardCam.setPosition(new Vector3(0, 15, 0));
		// this.boardCam.setTarget(Vector3.Zero());
		// this.boardCam.detachControl();

		this._card['Card'].setEnabled(true);
		this._card[this.now!].setEnabled(true);
	}

	close() {
		// this.boardCam.attachControl();
		// this.boardCam.setPosition(this.originCamPosition!);
		// this.boardCam.setTarget(this.originCamTarget!);
		this._card['Card'].setEnabled(false);
		this._card[this.now!].setEnabled(false);
	}
}
