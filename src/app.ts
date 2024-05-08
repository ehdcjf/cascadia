import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/loaders/glTF';
import {
	Engine,
	Scene,
	Vector3,
	SceneLoader,
	EngineFactory,
	HemisphericLight,
	ArcRotateCamera,
	Tools,
	Viewport,
	Matrix,
} from '@babylonjs/core';

import * as BABYLON from '@babylonjs/core';
import { Board } from './board';
import { Pocket } from './pocket';
import { ActionManager } from './actionManager';
import { Inspector } from '@babylonjs/inspector';
(window as any).BABYLON = BABYLON;

// const H = 1.5;
// const W = Math.cos(Math.PI / 6);

class App {
	private scene!: Scene;
	private engine!: Engine;
	private board!: Board;
	private pocket!: Pocket;

	tilaAction!: ActionManager;

	constructor() {
		this.init();
	}

	private async init() {
		const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
		this.engine = (await EngineFactory.CreateAsync(canvas, undefined)) as Engine;

		await this.createScene();
		this.board = new Board(this.scene);
		this.pocket = new Pocket(this.scene);
		this.tilaAction = new ActionManager(this.scene, this.board, this.pocket);

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
		const light2 = new HemisphericLight('light2', new Vector3(0, 1, 0));

		Inspector.Show(this.scene, {});
		await this.loadAssetAsync();
		await this.scene.whenReadyAsync();
		this.engine.hideLoadingUI();
	}

	private async loadAssetAsync() {
		const assets = await SceneLoader.ImportMeshAsync('', './models/', 'cascadia.glb', this.scene);
		assets.meshes.forEach((mesh, _i) => {
			mesh.visibility = 0;
		});
	}
}

new App();
