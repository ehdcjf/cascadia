import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/loaders/glTF';
import { Inspector } from '@babylonjs/inspector';
import {
	ActionManager,
	ArcRotateCamera,
	Engine,
	EngineFactory,
	ExecuteCodeAction,
	HemisphericLight,
	PointerEventTypes,
	Scene,
	SceneLoader,
	Tools,
	Vector3,
	Viewport,
} from '@babylonjs/core';

class App {
	private engine!: Engine;
	private scene!: Scene;
	private inputMap: Record<string, boolean> = {};

	constructor() {
		this.init();
		Inspector.Show(this.scene, {});
	}

	private async init() {
		const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
		this.engine = (await EngineFactory.CreateAsync(canvas, undefined)) as Engine;

		await this.createScene();

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
		this.setupCamera();
		this.setupLight();
		await this.loadAssetAsync();
	}
	async loadAssetAsync() {
		const assets = await SceneLoader.ImportMeshAsync('', './models/', 'cascadia-final.glb', this.scene);
		assets.meshes.forEach((mesh) => {
			mesh.setEnabled(false);
		});
	}

	private setupCamera() {
		const boardCam = new ArcRotateCamera(
			'board-cam',
			Tools.ToRadians(90),
			Tools.ToRadians(0),
			16,
			Vector3.Zero(),
			this.scene
		);
		boardCam.upperBetaLimit = Tools.ToRadians(80);
		boardCam.lowerRadiusLimit = 11;
		boardCam.upperRadiusLimit = 60;
		boardCam.speed = 0.3;

		boardCam.attachControl(true);
		boardCam.viewport = new Viewport(0.2, 0, 0.8, 1);
		this.scene.activeCameras?.push(boardCam);

		const pocketCam = new ArcRotateCamera(
			'pocket-cam',
			Tools.ToRadians(90),
			Tools.ToRadians(90),
			10,
			new Vector3(100, 100, 100),
			this.scene
		);

		pocketCam.viewport = new Viewport(0, 0, 0.2, 1);
		this.scene.activeCameras?.push(pocketCam);

		// Viewport 두개로 나눠서
		// Pointer 움직일때마다
		// cameraToUseForPointers 변경해줘야함.
		this.scene.onPointerObservable.add((evt) => {
			if (evt.type == PointerEventTypes.POINTERMOVE) {
				if (this.scene.pointerX < window.innerWidth * 0.2) {
					this.scene.cameraToUseForPointers = pocketCam;
				} else {
					this.scene.cameraToUseForPointers = boardCam;
				}
			}
		});

		// 키보드로 board-camera 움직이기
		this.scene.actionManager = new ActionManager(this.scene);

		this.scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
				this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == 'keydown';
			})
		);

		this.scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
				this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == 'keydown';
			})
		);
		this.scene.onBeforeRenderObservable.add(() => {
			if (this.inputMap.w) {
				boardCam.setPosition(boardCam.position.subtract(new Vector3(0, 0, boardCam.speed)));
				boardCam.setTarget(boardCam.target.subtract(new Vector3(0, 0, boardCam.speed)));
			}
			if (this.inputMap.s) {
				boardCam.setPosition(boardCam.position.add(new Vector3(0, 0, boardCam.speed)));
				boardCam.setTarget(boardCam.target.add(new Vector3(0, 0, boardCam.speed)));
			}
			if (this.inputMap.d) {
				boardCam.setPosition(boardCam.position.subtract(new Vector3(boardCam.speed, 0, 0)));
				boardCam.setTarget(boardCam.target.subtract(new Vector3(boardCam.speed, 0, 0)));
			}
			if (this.inputMap.a) {
				boardCam.setPosition(boardCam.position.add(new Vector3(boardCam.speed, 0, 0)));
				boardCam.setTarget(boardCam.target.add(new Vector3(boardCam.speed, 0, 0)));
			}
			if (this.inputMap.o || this.inputMap[' ']) {
				boardCam.setPosition(new Vector3(0, 15, 0));
				boardCam.setTarget(Vector3.Zero());
			}
		});
	}

	private setupLight() {
		const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
		light.intensity = 0.3;
		const light2 = new HemisphericLight('light2', new Vector3(0, 1, 0));
	}
}

new App();
