// import {
// 	AbstractMesh,
// 	ActionManager,
// 	Color3,
// 	Material,
// 	PBRMaterial,
// 	Scene,
// 	SceneLoader,
// 	StandardMaterial,
// 	Texture,
// 	TransformNode,
// } from '@babylonjs/core';
// import { TileMesh } from './tile';
// import { TileKey as TileMatKey, TokenKey as TokenMatKey, WildLife } from '../interfaces';
// type MaterialKey = 'red' | 'yellow' | 'none' | 'white';

// // type TextMeshKey =
// // 	| 'bear-text'
// // 	| 'elk-text'
// // 	| 'fox-text'
// // 	| 'hawk-text'
// // 	| 'salmon-text'
// // 	| 'cancel-text'
// // 	| 'clear-text'
// // 	| 'confirm-text'
// // 	| 'token,-text'
// // 	| 'tokens,-text'
// // 	| 'tokens-text';

// import { TokenMesh } from './token';

// export class Assets {
// 	private static instance: Assets;
// 	private originTile: AbstractMesh;
// 	private originTileEdge: AbstractMesh;
// 	private originToken: AbstractMesh;
// 	private originCancle: AbstractMesh;
// 	private originConfirm: AbstractMesh;
// 	private originClose: AbstractMesh;

// 	public readonly tileMat: Record<TileMatKey, PBRMaterial> = {} as Record<TileMatKey, PBRMaterial>;
// 	public readonly tokenMat: Record<TokenMatKey, PBRMaterial> = {} as Record<TokenMatKey, PBRMaterial>;
// 	public readonly mat: Record<MaterialKey, Material> = {} as Record<MaterialKey, Material>;
// 	// public readonly textMesh: Record<TextMeshKey, AbstractMesh> = {} as Record<TextMeshKey, AbstractMesh>;
// 	private constructor(private scene: Scene) {
// 		this.originTile = this.scene.getMeshById('tile')!;
// 		this.originTileEdge = this.scene.getMeshById('tile-edge')!;
// 		this.originToken = this.scene.getMeshById('token')!;
// 		this.originCancle = this.scene.getMeshById('cancel')!;
// 		this.originConfirm = this.scene.getMeshById('confirm')!;
// 		this.originClose = this.scene.getMeshById('close')!;
// 		(
// 			[
// 				'desert-lake',
// 				'desert-swamp',
// 				'desert',
// 				'forest-desert',
// 				'forest-lake',
// 				'forest-swamp',
// 				'lake-mountain',
// 				'mountain-desert',
// 				'mountain-forest',
// 				'mountain-swamp',
// 				'swamp-lake',
// 				'blank',
// 				'forest',
// 				'lake',
// 				'mountain',
// 				'swamp',
// 			] as TileMatKey[]
// 		).forEach((name) => {
// 			this.tileMat[name] = scene.getMaterialByName(name)! as PBRMaterial;
// 			this.tileMat[name].unlit = true;
// 		});

// 		(
// 			[
// 				'bear',
// 				'elk',
// 				'fox',
// 				'hawk',
// 				'salmon',
// 				'pinecone',
// 				'bear-active',
// 				'elk-active',
// 				'fox-active',
// 				'hawk-active',
// 				'salmon-active',
// 				'bear-inactive',
// 				'elk-inactive',
// 				'fox-inactive',
// 				'hawk-inactive',
// 				'salmon-inactive',
// 			] as TokenMatKey[]
// 		).forEach((name) => {
// 			this.tokenMat[name] = scene.getMaterialByName(name)! as PBRMaterial;
// 			this.tokenMat[name].unlit = true;
// 		});

// 		// (
// 		// 	[
// 		// 		'bear',
// 		// 		'elk',
// 		// 		'fox',
// 		// 		'hawk',
// 		// 		'salmon',
// 		// 		'cancel',
// 		// 		'clear',
// 		// 		'confirm',
// 		// 		'token,',
// 		// 		'tokens,',
// 		// 		'tokens',
// 		// 	] as TextMeshKey[]
// 		// ).forEach((name) => {
// 		// 	this.textMesh[name] = scene.getMeshById(name + '-text')!;
// 		// });
// 		const redMat = new StandardMaterial('red');
// 		redMat.emissiveColor = Color3.Red();

// 		const redMat2 = new StandardMaterial('red2');
// 		redMat2.emissiveColor = Color3.FromHexString('ED1B24');

// 		const yellowMat = new StandardMaterial('yellow');
// 		yellowMat.emissiveColor = Color3.Yellow();

// 		const noneMat = new StandardMaterial('none');
// 		noneMat.alpha = 0;

// 		const whiteMat = new StandardMaterial('white');
// 		whiteMat.emissiveColor = Color3.White();

// 		// const greenMat = new StandardMaterial('green');
// 		// greenMat.diffuseColor = Color3.Green();

// 		// const greenMat2 = new StandardMaterial('green2');
// 		// greenMat2.diffuseColor = Color3.FromHexString('3AFC21');

// 		// const burgundyMat = new StandardMaterial('burgundy');
// 		// burgundyMat.diffuseColor = Color3.FromHexString('890018');

// 		// const elkMat = new StandardMaterial('elk');
// 		// elkMat.diffuseColor = Color3.FromHexString('B48340');

// 		// const foxMat = new StandardMaterial('fox');
// 		// foxMat.diffuseColor = Color3.FromHexString('F3960B');

// 		// const hawkMat = new StandardMaterial('hawk');
// 		// hawkMat.diffuseColor = Color3.FromHexString('71B5DA');

// 		// const salmonMat = new StandardMaterial('salmon');
// 		// salmonMat.diffuseColor = Color3.FromHexString('ED463E');

// 		this.mat = {
// 			red: redMat,
// 			yellow: yellowMat,
// 			none: noneMat,
// 			white: whiteMat,
// 			// red2: redMat2,
// 			// green: greenMat,
// 			// green2: greenMat2,
// 			// burgundyMat: burgundyMat,
// 			// bear: bearMat,
// 			// elk: elkMat,
// 			// fox: foxMat,
// 			// hawk: hawkMat,
// 			// salmon: salmonMat,
// 		};
// 	}

// 	public static async setup(scene: Scene) {
// 		if (!Assets.instance) {
// 			const assets = await SceneLoader.ImportMeshAsync('', './models/', 'cascadia4.glb', scene);
// 			(scene.getMaterialById('palette2') as PBRMaterial).unlit = true;
// 			assets.meshes.forEach((mesh) => {
// 				mesh.setEnabled(false);
// 				console.log(mesh.id);
// 			});

// 			Assets.instance = new Assets(scene);
// 		}
// 	}

// 	public static getInstance(): Assets {
// 		return Assets.instance;
// 	}

// 	// getTile(anchor: TransformNode): TileMesh {
// 	// 	return new TileMesh(this.scene, this.originTile, this.originTileEdge, this.originToken, anchor);
// 	// }

// 	public static getTransformNode(name = 'anchor') {
// 		return new TransformNode(name, Assets.instance.scene);
// 	}

// 	public static getActionManger() {
// 		return new ActionManager(Assets.instance.scene);
// 	}

// 	public static getTile(anchor: TransformNode) {
// 		return Assets.instance.originTile.clone('tile', anchor)!;
// 	}

// 	public static getTilEdge(anchor: TransformNode) {
// 		return Assets.instance.originTileEdge.clone('tile-edge', anchor)!;
// 	}

// 	public static getToken(anchor: TransformNode) {
// 		return Assets.instance.originToken.clone('token', anchor)!;
// 	}

// 	public static getCancel(anchor: TransformNode) {
// 		return Assets.instance.originCancle.clone('cancel', anchor)!;
// 	}
// 	public static getConfirm(anchor: TransformNode) {
// 		return Assets.instance.originConfirm.clone('confirm', anchor)!;
// 	}
// 	public static getClose(anchor: TransformNode) {
// 		return Assets.instance.originClose.clone('close', anchor)!;
// 	}

// 	public static getTokenMat(key: TokenMatKey) {
// 		return Assets.instance.tokenMat[key];
// 	}
// 	public static getTileMat(key: TileMatKey) {
// 		return Assets.instance.tileMat[key];
// 	}

// 	public static getMat(key: MaterialKey) {
// 		return Assets.instance.mat[key];
// 	}
// }

import {
	AbstractMesh,
	ActionManager,
	BoundingInfo,
	Color3,
	Color4,
	Engine,
	PBRMaterial,
	Scene,
	StandardMaterial,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { CardMeshes, CardMeshesKey, cardMeshes } from '../interfaces';
import { Tile } from './tile';

const meshes = ['tile', 'tile-edge', 'token'] as const;
type MainMeshesKey = (typeof meshes)[number];
type MainMeshes = Record<MainMeshesKey, AbstractMesh>;

// const scoringIcon = ['bear-plane', 'elk-plane', 'fox-plane', 'hawk-plane', 'salmon-plane'] as const;
// type MainMeshesKey = (typeof meshes)[number];
// type MainMeshes = Record<MainMeshesKey, AbstractMesh>;

const tileMat = [
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
] as const;
type TileMatKey = (typeof tileMat)[number];
type TileMat = Record<TileMatKey, PBRMaterial>;

const tokenMat = [
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
] as const;
type TokenMatKey = (typeof tokenMat)[number];
type TokenMat = Record<TokenMatKey, PBRMaterial>;

const buttonMeshes = [
	'action-cancel',
	'action-ccw',
	'action-cw',
	'action-confirm',
	'calculate',
	'cancel',
	'clear',
	'confirm',
	'instructions',
	'nature',
	'pick',
	'replace',
	'undo',
] as const;
type ButtonMeshesKey = (typeof buttonMeshes)[number];
type ButtonMeshes = Record<ButtonMeshesKey, AbstractMesh>;

// const cardMeshes = [
// 	'Card',
// 	'BearA',
// 	'BearB',
// 	'BearC',
// 	'BearD',
// 	'ElkA',
// 	'ElkB',
// 	'ElkC',
// 	'ElkD',
// 	'FoxA',
// 	'FoxB',
// 	'FoxC',
// 	'FoxD',
// 	'HawkA',
// 	'HawkB',
// 	'HawkC',
// 	'HawkD',
// 	'SalmonA',
// 	'SalmonB',
// 	'SalmonC',
// 	'SalmonD',
// ] as const;
// type CardMeshesKey = (typeof cardMeshes)[number];
// type CardMeshes = Record<CardMeshesKey, AbstractMesh>;

const scoringIcon = ['bear-score', 'elk-score', 'fox-score', 'hawk-score', 'salmon-score'] as const;
type ScoringIconMeshesKey = (typeof scoringIcon)[number];
type ScoringIcon = Record<ScoringIconMeshesKey, AbstractMesh>;

type NumberMeshes = Record<number, AbstractMesh>;

export class Assets {
	private _meshes: MainMeshes = {} as MainMeshes;
	private _buttonMeshes: ButtonMeshes = {} as ButtonMeshes;
	private _cardMesh: CardMeshes = {} as CardMeshes;
	private _tokenMat: TokenMat = {} as TokenMat;
	private _tileMat: TileMat = {} as TileMat;
	private _numberMeshes: NumberMeshes = {};
	private _scoringIcon: ScoringIcon = {} as ScoringIcon;
	constructor(private scene: Scene) {
		// __root__ 제외 전부 setEnable false 로 설정해주고.

		const scoringCardAnchor = new TransformNode('scoring-card-anchor', this.scene);
		scoringCardAnchor.parent = this.boardCam;
		scoringCardAnchor.position = new Vector3(0, 0, 10);
		// scoringCardAnchor.rotate(new Vector3(1, 0, 0), Tools.ToRadians(270));

		for (const mesh of this.scene.meshes) {
			mesh.setEnabled(false);
			if (mesh.id == '__root__') mesh.setEnabled(true);
			// tile, edge, token
			else if (meshes.includes(mesh.id as MainMeshesKey)) {
				this._meshes[mesh.id as MainMeshesKey] = mesh;
			}
			// number mesh;
			else if (Number.isInteger(mesh.id) && Number(mesh.id) >= 0 && Number(mesh.id) <= 20) {
				this._numberMeshes[Number(mesh.id)] = mesh;
			}
			// button mesh;
			else if (buttonMeshes.includes(mesh.id as ButtonMeshesKey)) {
				this._buttonMeshes[mesh.id as ButtonMeshesKey] = mesh;
			}
			// card mesh;
			else if (cardMeshes.includes(mesh.id as CardMeshesKey)) {
				// mesh.scalingDeterminant = 0.5;
				// mesh.renderingGroupId = 1;
				// mesh.name = 'card';
				mesh.scaling.y *= -1;
				// mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(75));
				// mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
				// mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
				// mesh.rotate(new Vector3(0, 0, 1), Tools.ToRadians(-90));
				// mesh.material!.alphaMode = Engine.ALPHA_ADD;
				mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
				mesh.name = 'card';
				mesh.parent = scoringCardAnchor;
				// mesh.rotate(new Vector3(0, 0, 1), Tools.ToRadians(180));

				this._cardMesh[mesh.id as CardMeshesKey] = mesh;
			}
			// scoring icon;
			else if (scoringIcon.includes(mesh.id as ScoringIconMeshesKey)) {
				this._scoringIcon[mesh.id as ScoringIconMeshesKey] = mesh;
			}
		}

		for (const material of this.scene.materials) {
			if (tileMat.includes(material.id as TileMatKey)) {
				this._tileMat[material.id as TileMatKey] = material as PBRMaterial;
			} else if (tokenMat.includes(material.id as TokenMatKey)) {
				this._tokenMat[material.id as TokenMatKey] = material as PBRMaterial;
			}
		}

		const yellowMat = new StandardMaterial('yellow');
		yellowMat.emissiveColor = Color3.Yellow();

		this._meshes['tile-edge'].material = yellowMat;
		this._meshes['tile-edge'].visibility = 0;

		const x = new Tile(this.tile, this.token, this.tileEdge, this._tileMat, this._tokenMat);
	}
	// 자주쓰이는 메시 가져오기
	get actionManager() {
		return new ActionManager(this.scene);
	}

	get card() {
		return this._cardMesh;
	}

	get tile() {
		const tile = this._meshes['tile'].clone('tile',null);
		const anchor = this.transformNode;
		anchor.parent = tile;
		const edge =



		return this._meshes.tile;
	}

	get tileEdge() {
		return this._meshes['tile-edge'];
	}

	get scoringIcon() {
		return this._scoringIcon;
	}

	get scoringCard() {
		return this._cardMesh;
	}

	get token() {
		return this._meshes.token;
	}

	get transformNode() {
		return new TransformNode('tf', this.scene);
	}

	get background() {
		return this.scene.clearColor;
	}

	get boardCam() {
		return this.scene.getCameraByName('board-cam');
	}

	get scoringCam() {
		return this.scene.getCameraByName('scoring-cam');
	}
}
