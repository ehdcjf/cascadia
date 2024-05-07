import '@babylonjs/core/Debug/debugLayer';
import { Inspector } from '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';

import {
	Engine,
	Scene,
	Vector3,
	FreeCamera,
	SceneLoader,
	EngineFactory,
	HemisphericLight,
	ArcRotateCamera,
	Tools,
	AbstractMesh,
	Color3,
	AssetContainer,
	RenderingManager,
	AssetsManager,
	Viewport,
	Color4,
	Matrix,
} from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

import * as BABYLON from '@babylonjs/core';
import { Board } from './board';
import { Pocket } from './pocket';
import { TileInfo } from './interfaces';
import { TileActions } from './tileAction';
(window as any).BABYLON = BABYLON;

const H = 1.5;
const W = Math.cos(Math.PI / 6);

class App {
	private scene!: Scene;
	private engine!: Engine;
	private board!: Board;
	private pocket!: Pocket;
	private srcTile: TileInfo | null = null;
	private destTile: string | null = null;
	subScene!: Scene;
	tilaAction!: TileActions;

	constructor() {
		this.init();
	}

	private async init() {
		const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
		this.engine = (await EngineFactory.CreateAsync(canvas, undefined)) as Engine;

		await this.createScene();
		this.board = new Board(this.scene);
		this.pocket = new Pocket(this.scene);
		this.tilaAction = new TileActions(this.scene);
		this.setPointerDownEvent();
		this.setPointerMoveEvent();
		this.engine.runRenderLoop(() => {
			if (this.scene) this.scene.render();
		});
		window.addEventListener('resize', () => {
			this.engine.resize();
		});
	}

	private async createScene() {
		this.engine.displayLoadingUI();
		this.scene = new Scene(this.engine);

		const camera = new ArcRotateCamera(
			'camera',
			Tools.ToRadians(90),
			Tools.ToRadians(0),
			16,
			Vector3.Zero(),
			this.scene
		);
		camera.upperBetaLimit = Tools.ToRadians(80);
		camera.lowerRadiusLimit = 5;
		camera.upperRadiusLimit = 40;
		const camera2 = new ArcRotateCamera(
			'camera2',
			Tools.ToRadians(90),
			Tools.ToRadians(90),
			10,
			new Vector3(100, 100, 100),
			this.scene
		);

		camera.attachControl(true);
		camera.viewport = new Viewport(0.2, 0, 0.8, 1);
		camera2.viewport = new Viewport(0, 0, 0.2, 1);

		this.scene.activeCameras?.push(camera);
		this.scene.activeCameras?.push(camera2);
		this.scene.cameraToUseForPointers = camera;
		camera.layerMask = 0xffffff0f;

		// this.subScene.activeCamera = camera2;

		const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
		light.intensity = 0.3;
		const light2 = new HemisphericLight('light2', new Vector3(0, 1, 0), this.subScene);

		// Inspector.Show(this.scene, {});
		await this.loadAssetAsync();
		await this.scene.whenReadyAsync();
		this.engine.hideLoadingUI();
	}

	private async loadAssetAsync() {
		const assets = await SceneLoader.ImportMeshAsync('', './models/', 'cascadia.glb', this.scene);
		assets.meshes.forEach((mesh, i) => {
			mesh.visibility = 0;
			console.log(mesh.id);
		});
	}

	private setPointerDownEvent() {
		this.scene.onPointerDown = (evt, pickInfo) => {
			const ray = this.scene.createPickingRay(
				this.scene.pointerX,
				this.scene.pointerY,
				Matrix.Identity(),
				this.scene.getCameraById('camera2')
			);

			const boardRay = this.scene.createPickingRay(
				this.scene.pointerX,
				this.scene.pointerY,
				Matrix.Identity(),
				this.scene.getCameraById('camera')
			);

			const hitToken = this.scene.pickWithRay(ray, (mesh) => {
				return mesh && mesh?.metadata?.type == 'token';
			});

			const hitTile = this.scene.pickWithRay(ray, (mesh) => {
				return mesh && mesh?.metadata?.type == 'tile';
			});

			const hitBlank = this.scene.pickWithRay(boardRay, (mesh) => {
				return mesh && mesh.id == 'blank' && mesh.visibility == 1;
			});

			if (hitToken?.hit && hitToken.pickedMesh) {
				const pickedMesh = hitToken.pickedMesh;
				pickedMesh.visibility = 1;
			}

			if (hitTile?.hit && hitTile.pickedMesh) {
				this.board.resetPossiblePathMaterial();
				const tiles = this.scene.getMeshesById('readyTile');
				tiles.forEach((tile) => {
					tile.renderOverlay = true;
				});
				hitTile.pickedMesh.renderOverlay = false;
				this.srcTile = hitTile.pickedMesh?.metadata.tileInfo;
				// this.board.showPossiblePathRay();
			}

			if (hitBlank?.hit && hitBlank.pickedMesh && this.srcTile) {
				this.board.resetPossiblePathMaterial();
				this.destTile = hitBlank.pickedMesh.name;
				this.board.drawHabitat(this.srcTile, this.destTile, 0);
			}
		};
	}

	private setPointerMoveEvent() {
		this.scene.onPointerMove = (evt, pickInfo) => {
			const ray = this.scene.createPickingRay(
				this.scene.pointerX,
				this.scene.pointerY,
				Matrix.Identity(),
				this.scene.getCameraById('camera')
			);

			const hitTile = this.scene.pickWithRay(ray, (mesh) => {
				return mesh && mesh.id == 'blank' && mesh.visibility == 1;
			});

			if (!hitTile?.hit && !this.destTile) {
				this.board.resetPossiblePathMaterial();
			} else if (hitTile?.hit && hitTile.pickedMesh && this.srcTile && this.destTile == null) {
				this.board.resetPossiblePathMaterial();
				this.board.drawHabitat(this.srcTile, hitTile.pickedMesh.name);
			} else {
			}
		};
	}
}

new App();
