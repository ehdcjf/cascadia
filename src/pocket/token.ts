import { ActionManager, ExecuteCodeAction, Observable } from '@babylonjs/core';

export class PocketToken extends Observable<any> {
	constructor() {
		super();

		const action = new ExecuteCodeAction(ActionManager.OnCenterPickTrigger, () => {});

		action.triggerOptions;
	}
}
