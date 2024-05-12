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
	PredicateCondition,
	Condition,
} from '@babylonjs/core';

import * as BABYLON from '@babylonjs/core';
import { Board } from './board';
import { Pocket } from './pocket';
import { CascadiaActionManager } from './actionManager';
import { Inspector } from '@babylonjs/inspector';
import { MaterialManager } from './material';
(window as any).BABYLON = BABYLON;

// const H = 1.5;
// const W = Math.cos(Math.PI / 6);

class App {
	private scene!: Scene;
	private engine!: Engine;
	private board!: Board;
	private pocket!: Pocket;
	tilaAction!: CascadiaActionManager;
	num = 10;
	constructor() {
		this.init();
	}

	private async init() {
		const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
		this.engine = (await EngineFactory.CreateAsync(canvas, undefined)) as Engine;

		await this.createScene();
		const mat = new MaterialManager(this.scene);
		const actionManager = new ActionManager(this.scene);
		const someAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			(_evt) => {
				this.num++;
				console.log(this.num);
				console.log('xxxxxx');
				console.log(_evt.additionalData.pickedMesh.name);
				console.log(_evt.meshUnderPointer!.name);
				console.log(this);
			},
			new PredicateCondition(actionManager, () => this.num < 20)
		);

		// someAction.setTriggerParameter(this);

		this.board = new Board(this.scene, mat, someAction);
		// this.pocket = new Pocket(this.scene, mat);
		// this.tilaAction = new CascadiaActionManager(this.scene, this.board, this.pocket);

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
		camera.upperRadiusLimit = 60;
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
		const assets = await SceneLoader.ImportMeshAsync('', './models/', 'cascadia-final.glb', this.scene);

		assets.meshes.forEach((mesh, _i) => {
			mesh.visibility = 0;
			// mesh.renderingGroupId = 1;
			// if (mesh.id.includes('throw')) {
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
			// 	Tags.AddTagsTo(mesh, 'action');
			// 	mesh.setEnabled(false);
			// }
		});

		// this.scene.materials.forEach((mat) => {
		// 	console.log(mat.id);
		// 	console.log(mat.name);
		// });
		// this.scene.meshes.forEach((mesh) => {
		// 	console.log(mesh);
		// });

		// this.scene.getMeshesByTags('salmon-wipe').forEach((mesh) => {
		// 	mesh.visibility = 1;
		// });
		this.test();
	}

	test() {
		this.scene.actionManager = new ActionManager(this.scene);
		this.scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnPickDownTrigger, async (_evt) => {})
		);
	}

	// testMoveCam() {
	// 	const text = this.scene.getMeshById('bear-throw')!;
	// 	const cancel = this.scene.getMeshById('bear-throw-cancel')!;

	// 	const confirm = this.scene.getMeshById('bear-throw-confirm')!;
	// 	cancel.visibility = 1;
	// 	confirm.visibility = 1;
	// 	text.visibility = 1;
	// 	const camera = this.scene.getCameraByName('camera') as ArcRotateCamera;
	// 	const originCameraPosition = camera.position;
	// 	const originCameraTarget = camera.target;

	// 	camera.setPosition(originCameraPosition.add(new Vector3(100, 20, 100)));
	// 	camera.setTarget(originCameraTarget.add(new Vector3(100, 0, 100)));

	// 	this.scene.onPointerObservable.add((pointerInfo) => {
	// 		if (pointerInfo.type == PointerEventTypes.POINTERDOWN) {
	// 			const boardRay = this.scene.createPickingRay(
	// 				this.scene.pointerX,
	// 				this.scene.pointerY,
	// 				Matrix.Identity(),
	// 				this.scene.getCameraByName('camera')
	// 			);
	// 			const camera = this.scene.getCameraByName('camera') as ArcRotateCamera;

	// 			const hitAction = this.scene.pickWithRay(boardRay, (mesh) => {
	// 				return (
	// 					mesh &&
	// 					(mesh?.id == 'bear-throw-cancel' || mesh?.id == 'bear-throw-confirm')
	// 				);
	// 			});

	// 			if (hitAction?.hit && hitAction.pickedMesh) {
	// 				camera.setPosition(new Vector3(0, 16, 0));
	// 				camera.setTarget(Vector3.Zero());
	// 			}
	// 		}
	// 	});
	// }
}

new App();
