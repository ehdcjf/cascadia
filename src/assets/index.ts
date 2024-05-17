import { AbstractMesh, Color3, Material, Scene, SceneLoader, StandardMaterial, TransformNode } from '@babylonjs/core';
import { TileMesh } from './tile';
import { TileKey as TileMatKey, TokenKey as TokenMatKey, WildLife } from '../interfaces';

export class Assets {
	private static instance: Assets;
	private originTile: AbstractMesh;
	private originTileEdge: AbstractMesh;
	private originToken: AbstractMesh;
	private boardCameraAnchor: TransformNode;
	private boardAnchor: TransformNode;
	private pocketAnchor: TransformNode;

	public readonly tileMat: Record<TileMatKey, Material> = {} as Record<TileMatKey, Material>;
	public readonly tokenMat: Record<TokenMatKey, Material> = {} as Record<TokenMatKey, Material>;
	public readonly edgeMat: Record<'red' | 'yellow' | 'none', Material> = {} as Record<
		'red' | 'yellow' | 'none',
		Material
	>;

	private constructor(private scene: Scene) {
		this.originTile = this.scene.getMeshById('tile')!;
		this.originTileEdge = this.scene.getMeshById('tile-edge')!;
		this.originToken = this.scene.getMeshById('token')!;
		this.boardCameraAnchor = new TransformNode('board-cam-anchor', this.scene);
		this.boardAnchor = new TransformNode('board-anchor', this.scene);
		this.pocketAnchor = new TransformNode('pocket-anchor', this.scene);
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

	public async setup(scene: Scene) {
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

	get tile(): TileMesh {
		const x = new TileMesh(this.scene, this.originTile, this.originTileEdge, this.originToken);
		x.anchor = this.boardAnchor;

		return x;
	}
}
