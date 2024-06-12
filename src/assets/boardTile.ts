import { AbstractMesh, ActionManager, Tools, TransformNode, Vector3, Animation, Animatable } from '@babylonjs/core';
import { Assets, TileMatKey, TokenMatKey } from '.';
import { Habitat, WildLife } from '../interfaces';

export class BoardTileMesh {
	protected wildlifes: AbstractMesh[] = [];
	protected tileRootAnchor: TransformNode;
	protected tileAnchor: TransformNode;
	protected wildlifeAnchor: TransformNode;
	protected tile: AbstractMesh;
	protected token: AbstractMesh;
	protected tokenAnim?: Animatable;
	constructor(private assets: Assets) {
		this.tileRootAnchor = assets.transformNode;
		this.tileAnchor = assets.transformNode;
		this.tileAnchor.parent = this.tileRootAnchor;
		this.tileAnchor.name = 'board-tile-anchor';
		this.tile = assets.tile.clone('tile', this.tileAnchor)!;
		this.tile.actionManager = assets.actionManager;
		this.tile.setEnabled(true);

		this.token = assets.token.clone('placed-token', this.tileRootAnchor)!;
		this.token.position.y += 0.1;
		this.token.isPickable = false;

		const animationZ = new Animation(
			'sizeUpDown',
			'scaling.z',
			30,
			Animation.ANIMATIONTYPE_FLOAT,
			Animation.ANIMATIONLOOPMODE_CYCLE
		);

		const animationX = new Animation(
			'sizeUpDown',
			'scaling.x',
			30,
			Animation.ANIMATIONTYPE_FLOAT,
			Animation.ANIMATIONLOOPMODE_CYCLE
		);

		animationZ.setKeys([
			{ frame: 0, value: 1 },
			{ frame: 30, value: 1.3 },
		]);

		animationX.setKeys([
			{ frame: 0, value: 1 },
			{ frame: 30, value: 1.3 },
		]);

		this.token.animations = [animationZ, animationX];

		this.wildlifeAnchor = assets.transformNode;
		this.wildlifeAnchor.name = 'board-wildlife-anchor';
		this.wildlifeAnchor.parent = this.tileRootAnchor;

		[
			[0, 0.11, 0],
			[-0.2, 0.11, 0.2],
			[0.2, 0.11, -0.2],
			[0, 0.11, -0.3],
			[-0.3 * Math.cos(Math.PI / 6), 0.11, 0.15],
			[0.3 * Math.cos(Math.PI / 6), 0.11, 0.15],
		].forEach((pos, i) => {
			const token = assets.token.clone(`token-${i + 1}`, this.wildlifeAnchor)!;
			token.position = new Vector3(...pos);
			token.scaling = new Vector3(0.5, 0.1, 0.5);
			token.isPickable = false;
			this.wildlifes.push(token);
		});
	}

	set id(value: string) {
		this.tileRootAnchor.name = value;
	}

	get id() {
		return this.tileRootAnchor.name;
	}

	get position() {
		return this.tileRootAnchor.position;
	}

	get actionManager(): ActionManager {
		return this.tile.actionManager as ActionManager;
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

	cleanTile() {
		this.tile.material = this.assets.tileMat['blank'];
		this.tile.rotation = new Vector3(0, 0, 0);
		this.wildlifes.forEach((mesh) => mesh.setEnabled(false));
	}

	drawTile(habitats: Habitat[], wildlifes: WildLife[]) {
		const tileMatKey = habitats.join('-') as TileMatKey;
		this.tile.material = this.assets.tileMat[tileMatKey];
		const wildLifeSize = wildlifes.length;
		const startIndex = (1 << (wildLifeSize - 1)) - 1;

		this.wildlifes.forEach((mesh) => mesh.setEnabled(false));
		wildlifes.forEach((v: WildLife, i) => {
			this.wildlifes[startIndex + i].material = this.assets.tokenMat[v];
			this.wildlifes[startIndex + i].setEnabled(true);
		});
	}

	cleanToken() {
		this.token.setEnabled(false);
	}

	drawToken(wildlife: WildLife) {
		const tokenMatKey = (wildlife + '-active') as TokenMatKey;
		this.token.material = this.assets.tokenMat[tokenMatKey];
		this.token.setEnabled(true);
	}

	deletePotential() {
		this.wildlifes.forEach((mesh) => mesh.setEnabled(false));
	}

	rotate(value: number) {
		this.tile.rotation = new Vector3(0, Tools.ToRadians(value), 0);
	}

	playAnim() {
		this.tokenAnim = this.token._scene.beginAnimation(this.token, 0, 30, true);
	}

	stopAnim() {
		if (this.tokenAnim && this.tokenAnim!.paused == false) this.tokenAnim.pause();
		this.token.scaling.x = 1;
		this.token.scaling.z = 1;
	}
}
