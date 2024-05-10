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
	PointerEventTypes,
	Tags,
	TransformNode,
	ActionManager,
	ExecuteCodeAction,
} from '@babylonjs/core';

import * as BABYLON from '@babylonjs/core';
import { Board } from './board';
import { Pocket } from './pocket';
import { Actions } from './action';
import { Inspector } from '@babylonjs/inspector';
(window as any).BABYLON = BABYLON;

// const H = 1.5;
// const W = Math.cos(Math.PI / 6);

class App {
	private scene!: Scene;
	private engine!: Engine;
	private board!: Board;
	private pocket!: Pocket;
	private actions!: Actions;
	private inputMap: Record<string, boolean> = {};
	boardCam!: ArcRotateCamera;

	constructor() {
		this.init();
	}

	private async init() {
		const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
		this.engine = (await EngineFactory.CreateAsync(canvas, undefined)) as Engine;

		await this.createScene();
		this.createBoardCam();
		this.board = new Board(this.scene);
		this.pocket = new Pocket(this.scene);
		this.actions = new Actions(this.scene, this.board, this.pocket);

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

		const camera2 = new ArcRotateCamera(
			'pocket',
			Tools.ToRadians(90),
			Tools.ToRadians(90),
			10,
			new Vector3(100, 100, 100),
			this.scene
		);

		camera2.viewport = new Viewport(0, 0, 0.2, 1);

		this.scene.activeCameras?.push(camera2);

		// this.subScene.activeCamera = camera2;

		const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
		light.intensity = 0.3;
		const light2 = new HemisphericLight('light2', new Vector3(0, 1, 0));

		Inspector.Show(this.scene, {});
		await this.loadAssetAsync();
		await this.scene.whenReadyAsync();
		this.engine.hideLoadingUI();
	}

	private createBoardCam() {
		this.boardCam = new ArcRotateCamera(
			'board-cam',
			Tools.ToRadians(90),
			Tools.ToRadians(0),
			16,
			Vector3.Zero(),
			this.scene
		);
		this.boardCam.upperBetaLimit = Tools.ToRadians(80);
		this.boardCam.wheelPrecision = 5;
		this.boardCam.lowerRadiusLimit = 10;
		this.boardCam.upperRadiusLimit = 80;
		this.boardCam.attachControl(true);
		this.boardCam.viewport = new Viewport(0.2, 0, 0.8, 1);
		this.boardCam.speed = 0.3;
		this.scene.activeCameras?.push(this.boardCam);
		this.scene.cameraToUseForPointers = this.boardCam;

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
				this.boardCam.setPosition(
					this.boardCam.position.subtract(new Vector3(0, 0, this.boardCam.speed))
				);
				this.boardCam.setTarget(
					this.boardCam.target.subtract(new Vector3(0, 0, this.boardCam.speed))
				);
			}
			if (this.inputMap.s) {
				this.boardCam.setPosition(
					this.boardCam.position.add(new Vector3(0, 0, this.boardCam.speed))
				);
				this.boardCam.setTarget(
					this.boardCam.target.add(new Vector3(0, 0, this.boardCam.speed))
				);
			}
			if (this.inputMap.d) {
				this.boardCam.setPosition(
					this.boardCam.position.subtract(new Vector3(this.boardCam.speed, 0, 0))
				);
				this.boardCam.setTarget(
					this.boardCam.target.subtract(new Vector3(this.boardCam.speed, 0, 0))
				);
			}
			if (this.inputMap.a) {
				this.boardCam.setPosition(
					this.boardCam.position.add(new Vector3(this.boardCam.speed, 0, 0))
				);
				this.boardCam.setTarget(
					this.boardCam.target.add(new Vector3(this.boardCam.speed, 0, 0))
				);
			}
			if (this.inputMap.o || this.inputMap[' ']) {
				this.boardCam.setPosition(new Vector3(0, 15, 0));
				this.boardCam.setTarget(Vector3.Zero());
			}
		});
	}

	private async loadAssetAsync() {
		const assets = await SceneLoader.ImportMeshAsync('', './models/', 'cascadia6.glb', this.scene);
		assets.meshes.forEach((mesh, _i) => {
			mesh.renderingGroupId = 3;
			// mesh.setEnabled(false);
			mesh.visibility = 0;
			// mesh.visibility = 0;
			// if (mesh.id.includes('throw')) {
			// 	mesh.visibility = 1;
			// 	Tags.AddTagsTo(mesh, 'popup');
			// 	if (mesh.id.includes('bear')) {
			// 		Tags.AddTagsTo(mesh, 'bear-throw');
			// 	} else if (mesh.id.includes('elk')) {
			// 		Tags.AddTagsTo(mesh, 'elk-throw');
			// 	} else if (mesh.id.includes('salmon')) {
			// 		Tags.AddTagsTo(mesh, 'salmon-throw');
			// 	} else if (mesh.id.includes('hawk')) {
			// 		Tags.AddTagsTo(mesh, 'hawk-throw');
			// 	} else if (mesh.id.includes('fox')) {
			// 		Tags.AddTagsTo(mesh, 'fox-throw');
			// 	} else {
			// 		Tags.AddTagsTo(mesh, 'bear-throw elk-throw salmon-throw hawk-throw fox-throw');
			// 	}
			// 	mesh.setEnabled(false);
			// } else if (mesh.id.includes('wipe')) {
			// 	mesh.visibility = 1;
			// 	Tags.AddTagsTo(mesh, 'popup');
			// 	if (mesh.id.includes('bear')) {
			// 		Tags.AddTagsTo(mesh, 'bear-wipe');
			// 	} else if (mesh.id.includes('elk')) {
			// 		Tags.AddTagsTo(mesh, 'elk-wipe');
			// 	} else if (mesh.id.includes('salmon')) {
			// 		Tags.AddTagsTo(mesh, 'salmon-wipe');
			// 	} else if (mesh.id.includes('hawk')) {
			// 		Tags.AddTagsTo(mesh, 'hawk-wipe');
			// 	} else if (mesh.id.includes('fox')) {
			// 		Tags.AddTagsTo(mesh, 'fox-wipe');
			// 	} else {
			// 		Tags.AddTagsTo(mesh, 'bear-wipe elk-wipe salmon-wipe hawk-wipe fox-wipe');
			// 	}
			// 	mesh.setEnabled(false);
			// } else if (mesh.id.includes('action')) {
			// 	mesh.visibility = 1;
			// 	Tags.AddTagsTo(mesh, 'action');
			// 	mesh.setEnabled(false);
			// }
		});

		// this.scene.getMeshesByTags('salmon-wipe').forEach((mesh) => {
		// 	mesh.visibility = 1;
		// });
	}

	testMoveCam() {
		const text = this.scene.getMeshById('bear-throw')!;
		const cancel = this.scene.getMeshById('bear-throw-cancel')!;

		const confirm = this.scene.getMeshById('bear-throw-confirm')!;
		cancel.visibility = 1;
		confirm.visibility = 1;
		text.visibility = 1;
		const camera = this.scene.getCameraByName('camera') as ArcRotateCamera;
		const originCameraPosition = camera.position;
		const originCameraTarget = camera.target;

		camera.setPosition(originCameraPosition.add(new Vector3(100, 20, 100)));
		camera.setTarget(originCameraTarget.add(new Vector3(100, 0, 100)));

		this.scene.onPointerObservable.add((pointerInfo) => {
			if (pointerInfo.type == PointerEventTypes.POINTERDOWN) {
				const boardRay = this.scene.createPickingRay(
					this.scene.pointerX,
					this.scene.pointerY,
					Matrix.Identity(),
					this.scene.getCameraByName('camera')
				);
				const camera = this.scene.getCameraByName('camera') as ArcRotateCamera;

				const hitAction = this.scene.pickWithRay(boardRay, (mesh) => {
					return (
						mesh &&
						(mesh?.id == 'bear-throw-cancel' || mesh?.id == 'bear-throw-confirm')
					);
				});

				if (hitAction?.hit && hitAction.pickedMesh) {
					camera.setPosition(new Vector3(0, 16, 0));
					camera.setTarget(Vector3.Zero());
				}
			}
		});
	}
}

new App();
