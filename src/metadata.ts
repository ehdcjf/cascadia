export enum SceneState {
	TEMP,
	TEMP2,
	TEMP3,
}

export class ScenMatadata {
	private _state: SceneState;
	constructor() {
		this._state = SceneState.TEMP;
	}

	get state() {
		return this._state;
	}

	set state(value: SceneState) {
		this._state = value;
	}
}
