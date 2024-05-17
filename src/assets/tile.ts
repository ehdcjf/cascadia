import { AbstractMesh, TransformNode, Vector3, Tools, ActionManager, Scene, ExecuteCodeAction } from '@babylonjs/core';
import { TileInfo, TileKey, TokenKey, WildLife } from '../interfaces';
import { Assets } from '.';
export class TileMesh {
	private _tile: AbstractMesh;
	private _edge: AbstractMesh;
	private _anchor: TransformNode;
	private _wildlife: AbstractMesh[] = [];

	constructor(scene: Scene, originTile: AbstractMesh, originTileEdge: AbstractMesh, originToken: AbstractMesh) {
		this._tile = originTile.clone('tile', null)!;
		this._tile.setEnabled(true);

		this._tile.actionManager = new ActionManager(scene);
		this._tile.scalingDeterminant = 2;
		this._anchor = new TransformNode('tile-anchor', scene);
		this.anchor.parent = this._tile;

		this._edge = originTileEdge.clone('edge', this.anchor)!;
		this._edge.material = Assets.getInstance().edgeMat['none'];
		this._edge.setEnabled(true);
		this._edge.isPickable = false;

		[
			[0, 0.11, 0],
			[-0.2, 0.11, 0.2],
			[0.2, 0.11, -0.2],
			[0, 0.11, -0.3],
			[-0.3 * Math.cos(Math.PI / 6), 0.11, 0.15],
			[0.3 * Math.cos(Math.PI / 6), 0.11, 0.15],
		].forEach((pos) => {
			const token = originToken.clone(`plane`, this._anchor)!;
			token.position = new Vector3(...pos);
			token.scaling = new Vector3(0.5, 0.1, 0.5);
			token.isPickable = false;
			this._wildlife.push(token);
		});
	}

	set anchor(tfNode: TransformNode) {
		this._tile.parent = tfNode;
	}

	set material(tileInfo: Omit<TileInfo, 'tileNum' | 'rotation'>) {
		const tileKey = tileInfo.habitats.join('-') as TileKey;
		this._tile.material = Assets.getInstance().tileMat[tileKey];
		const wildLifeSize = tileInfo.wildlife.length;
		const startIndex = (1 << (wildLifeSize - 1)) - 1;
		this._wildlife.forEach((mesh) => mesh.setEnabled(false));
		tileInfo.wildlife.forEach((v: WildLife, i) => {
			this._wildlife[startIndex + i].material = Assets.getInstance().tokenMat[v];
			this._wildlife[startIndex + i].setEnabled(true);
		});
	}

	get position() {
		return this._tile.position;
	}

	get actionManager(): ActionManager {
		return this._tile.actionManager as ActionManager;
	}

	set position(vec3: Vector3) {
		this._tile.position = vec3;
	}

	set rotation(vec3: Vector3) {
		// if (Math.abs(number) >= 360) number %= 360;
		this._tile.rotation = vec3;
	}

	set scalingDeterminant(value: number) {
		this._tile.scalingDeterminant = value;
	}

	set edge(color: 'yellow' | 'none') {
		this._edge.material = Assets.getInstance().edgeMat[color];
	}

	rotateY(number: number) {
		// if (Math.abs(number) >= 360) number %= 360;
		this._tile.rotation = new Vector3(0, Tools.ToRadians(number), 0);
		this._anchor.rotation = new Vector3(0, -Tools.ToRadians(number), 0);
	}

	public clean() {
		this._tile.material = Assets.getInstance().tileMat['blank'];
		this._wildlife.forEach((mesh) => mesh.setEnabled(false));
		this.rotateY(0);
	}

	public dispose() {
		this._tile.dispose();
	}
}
