import { Scene as _Scene, Engine } from '@babylonjs/core';
import { ScenMatadata } from './metadata';

export class Scene extends _Scene {
	metadata: ScenMatadata;
	constructor(engien: Engine) {
		super(engien);
		this.metadata = new ScenMatadata();
	}
}
