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
	Camera,
	Color3,
	PBRMaterial,
	Scene,
	StandardMaterial,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import {
	ButtonMeshes,
	ButtonMeshesKey,
	CardMeshes,
	CardMeshesKey,
	ModalMeshes,
	ModalType,
	TileActionMeshes,
	buttonMeshes,
	cardMeshes,
	modalInfos,
	tileActionMeshes,
	TileActionMeshKey,
} from '../interfaces';
import { PocketTileMesh } from './pocketTile';
import { PocketTokenMesh } from './pocketToken';
import { BoardTileMesh } from './boardTile';

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
export type TileMatKey = (typeof tileMat)[number];
export type TileMat = Record<TileMatKey, PBRMaterial>;

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
export type TokenMatKey = (typeof tokenMat)[number];
type TokenMat = Record<TokenMatKey, PBRMaterial>;

const scoringIcon = ['rules', 'bear-score', 'elk-score', 'fox-score', 'hawk-score', 'salmon-score'] as const;
type ScoringIconMeshesKey = (typeof scoringIcon)[number];
type ScoringIcon = Record<ScoringIconMeshesKey, AbstractMesh>;

const infoMeshes = ['turn', 'pinecone', 'colons'] as const;
type InfoMeshesKey = (typeof infoMeshes)[number];
type InfoMeshes = Record<InfoMeshesKey, AbstractMesh>;

type NumberMeshes = Record<number, AbstractMesh>;
type FinalScoreMeshes = Record<'tile' | 'token' | 'finalscore' | 'points' | 'totalIcon', AbstractMesh>;
export class Assets {
	private _meshes: MainMeshes = {} as MainMeshes;
	private _buttonMeshes: ButtonMeshes = {} as ButtonMeshes;
	private _cardMesh: CardMeshes = {} as CardMeshes;
	private _tokenMat: TokenMat = {} as TokenMat;
	private _tileMat: TileMat = {} as TileMat;
	private _numberMeshes: NumberMeshes = {};
	private _scoringIcon: ScoringIcon = {} as ScoringIcon;
	private _infoMeshs: InfoMeshes = {} as InfoMeshes;
	private _modalMeshes: ModalMeshes = {} as ModalMeshes;
	private _tileActionMeshes: TileActionMeshes = {} as TileActionMeshes;
	private _modalAnchor: TransformNode;
	private _fianlScoreMesh: FinalScoreMeshes = {} as FinalScoreMeshes;
	private cams: Record<'board' | 'scoring' | 'pocket', Camera>;
	constructor(public scene: Scene) {
		// __root__ 제외 전부 setEnable false 로 설정해주고.
		this.cams = {
			board: this.scene.getCameraByName('board-cam')!,
			pocket: this.scene.getCameraByName('pocket-cam')!,
			scoring: this.scene.getCameraByName('scoring-cam')!,
		};
		const scoringCardAnchor = new TransformNode('scoring-card-anchor', this.scene);
		scoringCardAnchor.parent = this.boardCam;
		scoringCardAnchor.position = new Vector3(0, 0, 10);
		// scoringCardAnchor.rotate(new Vector3(1, 0, 0), Tools.ToRadians(270));

		this._modalAnchor = new TransformNode('modal-anchor', this.scene);
		this._modalAnchor.parent = this.boardCam;
		this._modalAnchor.position = new Vector3(0, 0, 10);

		const tileActionAnchor = new TransformNode('tile-action-anchor', this.scene);
		tileActionAnchor.parent = this.modalAnchor;

		Object.keys(modalInfos).forEach((v) => {
			const subModalAnchor = this.transformNode;
			subModalAnchor.name = v;
			subModalAnchor.id = v;
			subModalAnchor.parent = this.modalAnchor;

			const buttonAnchor = this.transformNode;
			buttonAnchor.name = 'button-anchor';
			buttonAnchor.parent = subModalAnchor;
			this._modalMeshes[v as ModalType] = subModalAnchor;
		});

		for (const mesh of this.scene.meshes) {
			mesh.setEnabled(false);

			if (mesh.id == '__root__') mesh.setEnabled(true);
			// tile, edge, token
			else if (['tokenw', 'tileh', 'final-score', 'points', 'total-score'].includes(mesh.id)) {
				if (mesh.id == 'tokenw') {
					this._fianlScoreMesh.token = mesh;
				} else if (mesh.id == 'tileh') {
					this._fianlScoreMesh.tile = mesh;
				} else if (mesh.id == 'final-score') {
					this._fianlScoreMesh.finalscore = mesh;
				} else if (mesh.id == 'points') {
					this._fianlScoreMesh.points = mesh;
				} else if (mesh.id == 'total-score') {
					this._fianlScoreMesh.totalIcon = mesh;
				}
			} else if (meshes.includes(mesh.id as MainMeshesKey)) {
				this._meshes[mesh.id as MainMeshesKey] = mesh;
			}
			// number mesh;
			else if (
				!mesh.id.includes('+') &&
				Number.isInteger(+mesh.id) &&
				Number(mesh.id) >= 0 &&
				Number(mesh.id) <= 20
			) {
				mesh.renderingGroupId = 1;

				this._numberMeshes[Number(mesh.id)] = mesh;
			}
			// button mesh;
			else if (buttonMeshes.includes(mesh.id as ButtonMeshesKey)) {
				mesh.renderingGroupId = 1;
				mesh.scaling.y *= -1;
				mesh.position = new Vector3(0, -3.5, 0);
				mesh.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
				mesh.scalingDeterminant = 0.2;
				mesh.isBlocker = true;
				mesh.setEnabled(false);
				this._buttonMeshes[mesh.id as ButtonMeshesKey] = mesh;
			}
			// card mesh;
			else if (cardMeshes.includes(mesh.id as CardMeshesKey)) {
				mesh.scaling.y *= -1;
				mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
				mesh.name = 'card';
				mesh.parent = scoringCardAnchor;
				this._cardMesh[mesh.id as CardMeshesKey] = mesh;
			}
			// scoring icon;
			else if (scoringIcon.includes(mesh.id as ScoringIconMeshesKey)) {
				mesh.renderingGroupId = 1;
				this._scoringIcon[mesh.id as ScoringIconMeshesKey] = mesh;
			}
			// info
			else if (infoMeshes.includes(mesh.id as InfoMeshesKey)) {
				mesh.renderingGroupId = 1;
				this._infoMeshs[mesh.id as InfoMeshesKey] = mesh;
			}
			// tile action
			else if (tileActionMeshes.includes(mesh.id as TileActionMeshKey)) {
				mesh.renderingGroupId = 1;
				mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
				mesh.parent = tileActionAnchor;
				this._tileActionMeshes[mesh.id as TileActionMeshKey] = mesh;
			}

			const modalInfo = Object.entries(modalInfos).filter((v) => mesh.id.startsWith(v[1].main))[0];
			if (modalInfo) {
				mesh.renderingGroupId = 1;
				mesh.scalingDeterminant = 0.3;
				mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
				mesh.setEnabled(true);

				const type = modalInfo[0];
				const subModalAnchor = this._modalMeshes[type as ModalType];

				if (mesh.id == modalInfo[1].main) {
					mesh.name = 'main';
					mesh.parent = subModalAnchor;
				} else {
					const wildlifes = ['bear', 'elk', 'fox', 'salmon', 'hawk'];
					mesh.name = wildlifes.filter((v) => mesh.id.includes(v))[0];
					mesh.parent = subModalAnchor;
				}
			}
		}

		for (const key in this._modalMeshes) {
			const tf = this._modalMeshes[key as ModalType];
			tf.setEnabled(false);
		}

		for (const material of this.scene.materials) {
			(material as PBRMaterial).unlit = true;
			if (tileMat.includes(material.id as TileMatKey)) {
				this._tileMat[material.id as TileMatKey] = material as PBRMaterial;
			} else if (tokenMat.includes(material.id as TokenMatKey)) {
				this._tokenMat[material.id as TokenMatKey] = material as PBRMaterial;
			}
		}

		const yellowMat = new StandardMaterial('yellow');
		yellowMat.diffuseColor = Color3.Yellow();
		yellowMat.emissiveColor = Color3.Yellow();

		this._meshes['tile-edge'].material = yellowMat;
		this._meshes['tile-edge'].visibility = 0;
	}
	// 자주쓰이는 메시 가져오기
	get actionManager() {
		return new ActionManager(this.scene);
	}

	get card() {
		return this._cardMesh;
	}

	get pocketTile() {
		return new PocketTileMesh(this);
	}

	get pocketToken() {
		return new PocketTokenMesh(this);
	}

	get boardTile() {
		return new BoardTileMesh(this);
	}

	get tileAction() {
		return this._tileActionMeshes;
	}

	get tile() {
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

	get numbers() {
		return this._numberMeshes;
	}

	get infoMeshes() {
		return this._infoMeshs;
	}

	get buttonMeshes() {
		return this._buttonMeshes;
	}

	get modalMeshes() {
		return this._modalMeshes;
	}

	get transformNode() {
		return new TransformNode('tf', this.scene);
	}

	get tileMat() {
		return this._tileMat;
	}

	get tokenMat() {
		return this._tokenMat;
	}

	get background() {
		return this.scene.clearColor;
	}

	get boardCam() {
		return this.cams.board;
	}

	get scoringCam() {
		return this.cams.scoring;
	}

	get pocketCam() {
		return this.cams.pocket;
	}

	get modalAnchor() {
		return this._modalAnchor;
	}

	get finalScoreMesh() {
		return this._fianlScoreMesh;
	}
}
