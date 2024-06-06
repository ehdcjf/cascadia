import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/loaders/glTF';
import { Inspector } from '@babylonjs/inspector';
import {
	ActionManager,
	ArcRotateCamera,
	Color3,
	Color4,
	Engine,
	EngineFactory,
	ExecuteCodeAction,
	HemisphericLight,
	PointerEventTypes,
	Scene,
	SceneLoader,
	Tools,
	TransformNode,
	Vector3,
	Viewport,
} from '@babylonjs/core';
import { Assets } from './assets';
import { ScoringIcon } from './score/icon';
import { GameManager } from './gameManager';

class App {
	private engine!: Engine;
	private scene!: Scene;
	private inputMap: Record<string, boolean> = {};

	constructor() {
		this.init();
	}

	private async init() {
		const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
		this.engine = (await EngineFactory.CreateAsync(canvas, undefined)) as Engine;

		await this.createScene();
		// const assets = new Assets(this.scene);
		// await this.test();
		// new Game(assets);
		// const scoring = new Scoring(this.scene);
		await SceneLoader.ImportMeshAsync('', './models/', 'cascadia5.glb', this.scene);

		new GameManager(this.scene);

		await this.scene.whenReadyAsync();
		this.engine.hideLoadingUI();
		// const mediator = new GameManager(this.scene);
		// Inspector.Show(this.scene, {});
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
		this.scene.clearColor = Color4.FromColor3(Color3.FromHexString('#e8dcca'), 1);
		// await SceneLoader.ImportMeshAsync('', './model/', 'cascadia4.glb', this.scene);

		// 씬 배경  베이지 색으로

		// 조명 설정
		this.setLight();

		// 캠 설정
		const boardCam = this.createBoardCam();
		const pocketCam = this.createPocketCam();
		const scoringCam = this.createScoringCam();

		this.scene.activeCameras?.push(boardCam, pocketCam, scoringCam);

		// 화면에서 마우스 이동할 때 viewport에 따라 cameraToUseForPointers 변경하기위한 event listener
		this.scene.onPointerObservable.add((evt) => {
			if (evt.type == PointerEventTypes.POINTERMOVE) {
				if (this.scene.pointerX < window.innerWidth * 0.2) {
					this.scene.cameraToUseForPointers = pocketCam;
				} else if (this.scene.pointerX > window.innerWidth * 0.9) {
					this.scene.cameraToUseForPointers = scoringCam;
				} else {
					this.scene.cameraToUseForPointers = boardCam;
				}
			}

			// modalNode.rotationQuaternion = boardCam.rotationQuaternion.clone();
		});
	}

	private createBoardCam() {
		const cam = new ArcRotateCamera(
			'board-cam',
			Tools.ToRadians(90),
			Tools.ToRadians(0),
			16,
			Vector3.Zero(),
			this.scene
		);

		cam.upperBetaLimit = Tools.ToRadians(80);
		cam.lowerRadiusLimit = 11;
		cam.upperRadiusLimit = 60;
		cam.speed = 0.3;
		cam.attachControl(true);
		cam.viewport = new Viewport(0.2, 0, 0.7, 1);

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
				cam.setPosition(cam.position.subtract(new Vector3(0, 0, cam.speed)));
				cam.setTarget(cam.target.subtract(new Vector3(0, 0, cam.speed)));
			}
			if (this.inputMap.s) {
				cam.setPosition(cam.position.add(new Vector3(0, 0, cam.speed)));
				cam.setTarget(cam.target.add(new Vector3(0, 0, cam.speed)));
			}
			if (this.inputMap.d) {
				cam.setPosition(cam.position.subtract(new Vector3(cam.speed, 0, 0)));
				cam.setTarget(cam.target.subtract(new Vector3(cam.speed, 0, 0)));
			}
			if (this.inputMap.a) {
				cam.setPosition(cam.position.add(new Vector3(cam.speed, 0, 0)));
				cam.setTarget(cam.target.add(new Vector3(cam.speed, 0, 0)));
			}
			if (this.inputMap.o || this.inputMap[' ']) {
				cam.setPosition(new Vector3(0, 15, 0));
				cam.setTarget(Vector3.Zero());
			}
		});
		return cam;
	}

	private createPocketCam() {
		const cam = new ArcRotateCamera(
			'pocket-cam',
			Tools.ToRadians(90),
			Tools.ToRadians(90),
			10,
			new Vector3(100, 100, 100),

			this.scene
		);
		cam.viewport = new Viewport(0, 0, 0.2, 1);
		return cam;
	}

	private createScoringCam() {
		const cam = new ArcRotateCamera(
			'scoring-cam',
			Tools.ToRadians(90),
			Tools.ToRadians(90),
			10,
			new Vector3(-100, 100, -100),
			this.scene
		);
		cam.viewport = new Viewport(0.9, 0, 0.1, 1);

		return cam;
	}

	private setLight() {
		const light = new HemisphericLight('light', Vector3.Zero(), this.scene);
		light.intensity = 2.5;
	}

	private async test() {
		this.scene.clearColor = Color4.FromColor3(Color3.FromHexString('#f5f5dc'), 1);
		const assets = await SceneLoader.ImportMeshAsync('', './models/', 'cascadia5.glb', this.scene);
		// const light = new PointLight('ttt', new Vector3(0, 0, 0), this.scene);
		// const light2 = new PointLight('ttt', new Vector3(-100, 101, -100));
		// light2.intensity = 0.5;

		const light = new HemisphericLight('light', Vector3.Zero());
		light.intensity = 1;

		assets.meshes.forEach((mesh) => {
			mesh.visibility = 0;
			if (mesh.id == 'bo') {
				mesh.visibility = 1;
				mesh.position.z -= 2;
			}
			if (mesh.id === 'Card') {
				mesh.visibility = 1;
				console.log(mesh.scaling);
				mesh.position.z -= 2;
			}
			// mesh.setEnabled(false);
		});

		// bear?.setEnabled(false);
		// console.log(bear?.material.unlit);
	}
}

new App();
