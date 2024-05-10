import { Scene } from '@babylonjs/core';
import { Board } from './board';
import { Pocket } from './pocket';

export class Actions {
	constructor(private scene: Scene, private board: Board, private pocket: Pocket) {}
}
