import { AbstractMesh, ActionManager, Tools, TransformNode, Vector3 } from '@babylonjs/core';
import { Assets, TokenMatKey } from '.';

export class PocketTokenMesh {
	private tokenAnchor: TransformNode;
	private tokenMesh: AbstractMesh;

	constructor(private readonly assets: Assets) {
		this.tokenAnchor = assets.transformNode;
		this.tokenAnchor.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
		this.tokenAnchor.scalingDeterminant = 0.7;
		this.tokenMesh = assets.token.clone('token', this.tokenAnchor)!;
		this.tokenMesh.setEnabled(true);
		this.tokenMesh.actionManager = assets.actionManager;
	}

	get actionManager(): ActionManager {
		return this.tokenMesh.actionManager as ActionManager;
	}

	get position() {
		return this.tokenAnchor.position;
	}

	get scene() {
		return this.tokenAnchor._scene;
	}

	setAnchor(value: TransformNode, position: Vector3) {
		this.tokenAnchor.parent = value;
		this.tokenAnchor.position = position;
	}

	draw(key: TokenMatKey) {
		this.tokenMesh.material = this.assets.tokenMat[key];
	}

	dispose() {
		this.tokenAnchor.dispose();
	}
}
