import { AbstractMesh, ActionManager, Tools, TransformNode, Vector3 } from '@babylonjs/core';
import { Assets, TileMatKey } from '.';
import { Habitat, WildLife } from '../interfaces';

export class PocketTileMesh {
	protected wildlifes: AbstractMesh[] = [];
	protected tileRootAnchor: TransformNode;
	protected tileMesh: AbstractMesh;
	protected edge: AbstractMesh;
	constructor(private assets: Assets) {
		this.tileRootAnchor = assets.transformNode;
		this.tileRootAnchor.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
		this.tileRootAnchor.scalingDeterminant = 0.7;
		const tileAnchor = assets.transformNode;
		tileAnchor.parent = this.tileRootAnchor;
		this.tileMesh = assets.tile.clone('tile', tileAnchor)!;
		this.tileMesh.setEnabled(true);
		this.tileMesh.actionManager = assets.actionManager;

		this.edge = assets.tileEdge.clone('edge', this.tileRootAnchor)!;
		this.edge.setEnabled(true);

		const wildlifeAnchor = assets.transformNode;
		wildlifeAnchor.parent = this.tileRootAnchor;

		[
			[0, 0.11, 0],
			[-0.2, 0.11, 0.2],
			[0.2, 0.11, -0.2],
			[0, 0.11, -0.3],
			[-0.3 * Math.cos(Math.PI / 6), 0.11, 0.15],
			[0.3 * Math.cos(Math.PI / 6), 0.11, 0.15],
		].forEach((pos) => {
			const token = assets.token.clone('token', wildlifeAnchor)!;
			token.position = new Vector3(...pos);
			token.scaling = new Vector3(0.5, 0.1, 0.5);
			token.isPickable = false;
			this.wildlifes.push(token);
		});
	}

	get position() {
		return this.tileRootAnchor.position;
	}

	get actionManager(): ActionManager {
		return this.tileMesh.actionManager as ActionManager;
	}

	setAnchor(value: TransformNode, position: Vector3) {
		this.tileRootAnchor.parent = value;
		this.tileRootAnchor.position = position;
	}

	dispose() {
		this.tileRootAnchor.dispose();
	}

	get scene() {
		return this.tileRootAnchor._scene;
	}

	draw(habitats: Habitat[], wildlifes: WildLife[]) {
		const tileMatKey = habitats.join('-') as TileMatKey;
		this.tileMesh.material = this.assets.tileMat[tileMatKey];
		const wildLifeSize = wildlifes.length;
		const startIndex = (1 << (wildLifeSize - 1)) - 1;
		this.wildlifes.forEach((mesh) => mesh.setEnabled(false));
		wildlifes.forEach((v: WildLife, i) => {
			this.wildlifes[startIndex + i].material = this.assets.tokenMat[v];
			this.wildlifes[startIndex + i].setEnabled(true);
		});
	}

	select() {
		this.edge.visibility = 1;
	}

	clean() {
		this.edge.visibility = 0;
	}
}
