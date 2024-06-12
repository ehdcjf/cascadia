import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/loaders/glTF';
// import { Inspector } from '@babylonjs/inspector';
import {
	ActionManager,
	ArcRotateCamera,
	Color3,
	Color4,
	Engine,
	EngineFactory,
	ExecuteCodeAction,
	PBRMaterial,
	PointerEventTypes,
	Scene,
	SceneLoader,
	Tools,
	TransformNode,
	Vector3,
	Viewport,
} from '@babylonjs/core';
import { GameManager } from './mediator';
import { ScoringType, ScoringTypes } from './interfaces';

class App {
	private engine!: Engine;
	private scene!: Scene;
	private inputMap: Record<string, boolean> = {};
	private scene2!: Scene;

	constructor() {
		this.init();
	}

	private async init() {
		const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
		this.engine = (await EngineFactory.CreateAsync(canvas, undefined)) as Engine;

		// await this.createScene();
		// const assets = new Assets(this.scene);
		// await this.test();
		// new Game(assets);
		// const scoring = new Scoring(this.scene);

		await this.createReadyScene();

		// new GameManager(this.scene);

		window.addEventListener('resize', () => {
			this.engine.resize();
		});
	}

	private async createReadyScene() {
		this.engine.displayLoadingUI();
		this.scene2 = new Scene(this.engine);
		this.scene2.clearColor = Color4.FromColor3(Color3.FromHexString('#e8dcca'), 1);
		await SceneLoader.ImportMeshAsync('', './models/', 'cascadia-ready.glb', this.scene2);
		this.scene2.materials.forEach((v) => {
			(v as PBRMaterial).unlit = true;
		});

		this.scene2.meshes.forEach((v) => {
			v.setEnabled(false);
			v.isPickable = false;
		});

		new ArcRotateCamera(
			'board-cam',
			Tools.ToRadians(90),
			Tools.ToRadians(0),
			16,
			Vector3.Zero(),
			this.scene2
		);

		const levels = [
			['A', 'A', 'A', 'A', 'A', 80, [11, -4]],
			['B', 'B', 'B', 'B', 'B', 80, [6, -4]],
			['C', 'C', 'C', 'C', 'C', 80, [1, -4]],
			['D', 'D', 'D', 'D', 'D', 80, [-4, -4]],
			// ['D', 'D', 'D', 'D', 'D', 80, [-9, -4]],
		];

		const anchor = new TransformNode(`level-anchor`, this.scene2);

		const bear = this.scene2.getMeshById('bear')!.clone('bear-clone', anchor)!;
		bear.setEnabled(true);
		bear.position.x += 2.4;
		const elk = this.scene2.getMeshById('elk')!.clone('elk-clone', anchor)!;
		elk.setEnabled(true);
		elk.position.x += 1.2;
		const fox = this.scene2.getMeshById('fox')!.clone('fox-clone', anchor)!;
		fox.setEnabled(true);

		const hawk = this.scene2.getMeshById('hawk')!.clone('hawk-clone', anchor)!;
		hawk.setEnabled(true);
		hawk.position.x -= 1.2;
		const salmon = this.scene2.getMeshById('salmon')!.clone('salmon-clone', anchor)!;
		salmon.setEnabled(true);
		salmon.position.x -= 2.4;
		anchor.setEnabled(false);

		levels.forEach((level, i) => {
			const levelNum = i + 1;
			const anchorClone = anchor.clone(`level-${levelNum}`, anchor.parent, false)!;
			anchorClone.setEnabled(true);
			const card = this.scene2.getMeshById('card')!.clone('card-clone', anchorClone)!;
			card.setEnabled(true);
			card.isPickable = true;
			const actionManager = new ActionManager(this.scene2);
			const action = new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
				const scoreTypes = {
					Bear: level[0] as ScoringType,
					Elk: level[1] as ScoringType,
					Fox: level[2] as ScoringType,
					Hawk: level[3] as ScoringType,
					Salmon: level[4] as ScoringType,
				};
				window.alert('board camera move: q w e r');
				this.createScene(scoreTypes);
			});
			actionManager.registerAction(action);
			card.actionManager = actionManager;

			const num = this.scene2.getMeshById(levelNum.toString())!.clone('num-clone', anchorClone)!;
			num.scaling.x *= -1;
			num.position.x += 2.5;
			num.position.z -= 1.2;
			num.setEnabled(true);
			(level.slice(0, 5) as string[]).forEach((v, i) => {
				const alpha = this.scene2.getMeshById(v)!.clone('alpha-clone', anchorClone)!;
				alpha.scaling.x *= -1;

				alpha.position.x += (2 - i) * 1.2;
				alpha.setEnabled(true);
			});

			const win = this.scene2.getMeshById('score-' + level[5])!.clone('win-clone', anchorClone)!;
			win.scaling.x *= -1;
			win.position.x += 1.3;
			win.position.z -= 1.2;
			win.setEnabled(true);

			const [x, z] = level[6]! as number[];
			anchorClone.position.x += x;
			anchorClone.position.z += z;
			anchorClone.scalingDeterminant = 0.7;
		});

		await this.scene2.whenReadyAsync();
		this.engine.hideLoadingUI();
		// Inspector.Show(this.scene, {});
		this.engine.runRenderLoop(() => {
			if (this.scene2) this.scene2.render();
		});
	}

	private async createScene(scoreType: ScoringTypes) {
		this.engine.displayLoadingUI();
		this.scene2.dispose();
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

		await SceneLoader.ImportMeshAsync('', './models/', 'cascadia5.glb', this.scene);

		new GameManager(this.scene, scoreType);
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

		await this.scene.whenReadyAsync();
		this.engine.hideLoadingUI();
		// Inspector.Show(this.scene, {});
		this.engine.runRenderLoop(() => {
			if (this.scene) this.scene.render();
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
		// const light = new HemisphericLight('light', Vector3.Zero(), this.scene);
		// light.intensity = 1;
	}
}

new App();
