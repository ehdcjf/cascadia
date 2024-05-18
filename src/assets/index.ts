import {
	AbstractMesh,
	ActionManager,
	Color3,
	Material,
	Scene,
	SceneLoader,
	StandardMaterial,
	TransformNode,
} from '@babylonjs/core';
import { TileMesh } from './tile';
import { TileKey as TileMatKey, TokenKey as TokenMatKey, WildLife } from '../interfaces';
type EdgeMatKey = 'red' | 'yellow' | 'none';
import { TokenMesh } from './token';

export class Assets {
	private static instance: Assets;
	private originTile: AbstractMesh;
	private originTileEdge: AbstractMesh;
	private originToken: AbstractMesh;

	public readonly tileMat: Record<TileMatKey, Material> = {} as Record<TileMatKey, Material>;
	public readonly tokenMat: Record<TokenMatKey, Material> = {} as Record<TokenMatKey, Material>;
	public readonly edgeMat: Record<EdgeMatKey, Material> = {} as Record<EdgeMatKey, Material>;

	private constructor(private scene: Scene) {
		this.originTile = this.scene.getMeshById('tile')!;
		this.originTileEdge = this.scene.getMeshById('tile-edge')!;
		this.originToken = this.scene.getMeshById('token')!;
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

		this.edgeMat = {
			red: redMat,
			yellow: yellowMat,
			none: noneMat,
		};
	}

	public static async setup(scene: Scene) {
		if (!Assets.instance) {
			const assets = await SceneLoader.ImportMeshAsync('', './models/', 'cascadia-final.glb', scene);
			assets.meshes.forEach((mesh) => {
				mesh.setEnabled(false);
			});
			Assets.instance = new Assets(scene);
		}
	}

	public static getInstance(): Assets {
		return Assets.instance;
	}

	// getTile(anchor: TransformNode): TileMesh {
	// 	return new TileMesh(this.scene, this.originTile, this.originTileEdge, this.originToken, anchor);
	// }

	public static getTransformNode(name = 'anchor') {
		return new TransformNode(name, Assets.instance.scene);
	}

	public static getActionManger() {
		return new ActionManager(Assets.instance.scene);
	}

	public static getTile(anchor: TransformNode) {
		return Assets.instance.originTile.clone('tile', anchor)!;
	}

	public static getTilEdge(anchor: TransformNode) {
		return Assets.instance.originTileEdge.clone('tile-edge', anchor)!;
	}

	public static getToken(anchor: TransformNode) {
		return Assets.instance.originTile.clone('token', anchor)!;
	}

	public static getTokenMat(key: TokenMatKey) {
		return Assets.instance.tokenMat[key];
	}
	public static getTileMat(key: TileMatKey) {
		return Assets.instance.tileMat[key];
	}

	public static getEdgeMat(key: EdgeMatKey) {
		return Assets.instance.edgeMat[key];
	}
}
