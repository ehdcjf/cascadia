import { Observable } from '@babylonjs/core';
export enum ModalEvents {
	OPEN_TILE_ACTION,
	TILE_CANCEL_ACTION,
	TILE_CONFIRM_ACTION,
	TILE_ROTATE_CCW_ACTION,
	TILE_ROTATE_CW_ACTION,
}
export class ActionObserver {
	public board = new Observable();
	public pocket = new Observable();
	public modal = new Observable<ModalEvents>();
}
