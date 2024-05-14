import { AbstractMesh, Color3, Material, StandardMaterial, Tools, TransformNode, Vector3 } from '@babylonjs/core';
import { Scene } from './scene';

import { TileInfo, TileKey as TileMatKey, TokenKey as TokenMatKey, WildLife } from './interfaces';

export class Assets {
	public readonly tileMat: Record<TileMatKey, Material> = {} as Record<TileMatKey, Material>;
	public readonly tokenMat: Record<TokenMatKey, Material> = {} as Record<TokenMatKey, Material>;
	public readonly tokenEdgeMat: Record<'red' | 'yellow' | 'none', Material> = {} as Record<
		'red' | 'yellow' | 'none',
		Material
	>;
	// private readonly token: AbstractMesh;
	private readonly tile: AbstractMesh;
	private readonly token: AbstractMesh;
	constructor(scene: Scene) {
		const tile = scene.getMeshById('tile')!;
		tile.id = 'tile-origin';
		const token = scene.getMeshById('token')!;
		token.id = 'token-origin';
		tile.outlineColor = Color3.Black();
		tile.outlineWidth = 0.00001;
		tile.renderOutline = true;
		const tokenPosistion = [
			new Vector3(0, 0.11, 0),
			new Vector3(-0.2, 0.11, 0.2),
			new Vector3(0.2, 0.11, -0.2),
			new Vector3(0, 0.11, -0.3),
			new Vector3(-0.3 * Math.cos(Math.PI / 6), 0.11, 0.15),
			new Vector3(0.3 * Math.cos(Math.PI / 6), 0.11, 0.15),
		];
		const tileAnchor = new TransformNode('tile-anchor', scene);
		tileAnchor.parent = tile;
		tokenPosistion.forEach((pos, i) => {
			const emptyToken = token.clone(`plane`, tileAnchor)!;
			emptyToken.position = pos;
			emptyToken.scaling = new Vector3(0.5, 0.1, 0.5);
		});

		this.tile = tile;

		this.token = token;

		(
			[
				'desert-lake',
				'desert-swamp',
				'desert',
				'forest-desert',
				'forest-lake',
				'forest-swamp',
				'lake-mountain',
				'mountain-desert',
				'mountain-forest',
				'mountain-swamp',
				'swamp-lake',
				'blank',
				'forest',
				'lake',
				'mountain',
				'swamp',
			] as TileMatKey[]
		).forEach((name) => {
			this.tileMat[name] = scene.getMaterialByName(name)!;
		});

		(
			[
				'bear',
				'elk',
				'fox',
				'hawk',
				'salmon',
				'pinecone',
				'bear-active',
				'elk-active',
				'fox-active',
				'hawk-active',
				'salmon-active',
				'bear-inactive',
				'elk-inactive',
				'fox-inactive',
				'hawk-inactive',
				'salmon-inactive',
			] as TokenMatKey[]
		).forEach((name) => {
			this.tokenMat[name] = scene.getMaterialByName(name)!;
		});

		const redMat = new StandardMaterial('red-edge');
		redMat.diffuseColor = Color3.Red();

		const yellowMat = new StandardMaterial('yellow-edge');
		yellowMat.diffuseColor = Color3.Yellow();

		const noneMat = new StandardMaterial('none-edge');
		noneMat.alpha = 0;

		this.tokenEdgeMat = {
			red: redMat,
			yellow: yellowMat,
			none: noneMat,
		};
	}

	cloneTile(
		anchor: TransformNode,
		id: 'habitat' | 'blank' | 'tile',
		name: string,
		tileInfo: TileInfo,
		position: Vector3
	) {
		const tile = this.tile.clone(name, anchor)!;
		tile.id = id;
		const tileMatKey =
			tileInfo.habitats.length == 0 ? 'blank' : (tileInfo.habitats.join('-') as TileMatKey);
		tile.material = this.tileMat[tileMatKey];
		tile.position = position;
		tile.rotation = new Vector3(0, Tools.ToRadians(tileInfo.rotation), 0);
		const wildLifeSize = tileInfo.wildlife.length;
		const startIndex = (1 << (wildLifeSize - 1)) - 1;

		const wildLifeMeshes = tile.getChildMeshes();
		wildLifeMeshes.forEach((mesh) => mesh.setEnabled(false));
		tileInfo.wildlife.forEach((v: TokenMatKey, i) => {
			wildLifeMeshes[startIndex + i].material = this.tokenMat[v];
			wildLifeMeshes[startIndex + i].setEnabled(true);
		});

		tile.getChildTransformNodes()[0].rotation = new Vector3(0, -Tools.ToRadians(tileInfo.rotation), 0);
		tile.setEnabled(true);
		return tile;
	}

	cloneToken(anchor: TransformNode, id: string, name: string, mat: TokenMatKey, position: Vector3) {
		const token = this.token.clone(name, anchor)!;
		token.id = id;
		token.material = this.tokenMat[mat];
		token.position = position;
		token.setEnabled(true);
		return token;
	}
}