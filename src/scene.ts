import { Scene as _Scene, ActionManager, Engine } from '@babylonjs/core';
import { ScenMatadata } from './metadata';

export class Scene extends _Scene {
	metadata: ScenMatadata;
	constructor(engien: Engine) {
		super(engien);
		this.metadata = new ScenMatadata();
		this.actionManager = new ActionManager(this);
	}
}
