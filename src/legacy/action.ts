import {
	AbstractMesh,
	ActionManager,
	ArcRotateCamera,
	ExecuteCodeAction,
	Matrix,
	Mesh,
	PointerEventTypes,
	Ray,
	Tags,
	Tools,
	TransformNode,
	Vector3,
	Animation,
	PredicateCondition,
	PointerInfo,
	Color4,
	Color3,
	Observable,
	PathCursor,
	Observer,
} from '@babylonjs/core';
import { Scene } from './scene';

import { TileInfo, TokenKey } from '../interfaces';
import { Board } from '../board';
import { Pocket } from '../pocket';
import { numFromName } from '../utils';
import { Modal } from '../modal';
import { Assets } from '../assets';
import { SceneState, ScenMatadata } from './metadata';
import { ActionObserver, ModalEvents } from './observer';

export class CascadiaActionManager {
	board: Board;
	pocket: Pocket;
	modal: Modal;
	// actionManager: ActionManager;
	// private tileLine: number | null = null;
	// private tokenLine: number | null = null;
	// private selectedTile: TileInfo | null = null;
	// private targetTile: string | null = null;
	// private setTile: boolean = false;
	// private selectedToken: AbstractMesh | null = null;
	// private selectedHabitat: string | null = null;
	// private useNature: boolean = false;
	// private rotation: number = 0;
	// private faintBoard: boolean = true;
	// private pendings: Record<string, any> = {};

	constructor(private scene: Scene) {
		const assets = new Assets(this.scene);
		const metadata = new ScenMatadata();
		const observers = new ActionObserver();

		this.board = new Board(this.scene, assets, observers);
		this.pocket = new Pocket(this.scene, assets, observers);
		this.modal = new Modal(this.scene, observers);

		observers.modal.add((eventType) => {
			switch (eventType) {
				case ModalEvents.OPEN_TILE_ACTION:
					{
						this.modal.openActionModal();
					}
					break;

				case ModalEvents.TILE_CANCEL_ACTION:
					{
						this.pocket.cleanEdge();
						const target = this.scene.metadata.targetTile!;
						target.material = assets.tileMat['blank'];
						target.getChildMeshes().forEach((mesh) => mesh.setEnabled(false));
						this.scene.metadata.state = SceneState.PICK_TILE;
						this.scene.metadata.tile = null;
						this.scene.metadata.targetTile = null;
						this.modal.closeActionModal();
					}
					break;
				case ModalEvents.TILE_CONFIRM_ACTION:
					{
						const tileNum = this.scene.metadata.tile!.tileNum;
						const token = this.scene.getMeshByName('token' + tileNum)!;
						const tokenName = token.metadata;

						const tileName = this.scene.metadata.targetTile!.name;

						this.board.setTile(
							this.scene.metadata.tile!,
							tileName,
							this.scene.metadata.rotation
						);
						this.scene.metadata.state = SceneState.PUT_TOKEN;

						const tokenMat = (tokenName + '-active') as TokenKey;
						this.scene.metadata.token = tokenName;
						token.material = assets.tokenMat[tokenMat];
						// this.scene.metadata.tile = null;
						// this.scene.metadata.targetTile = null;
						this.modal.closeActionModal();
					}
					break;
				case ModalEvents.TILE_ROTATE_CCW_ACTION:
					{
						this.scene.metadata.rotation -= 60;
						const habatat = this.scene.metadata.targetTile!;
						habatat.rotation = new Vector3(
							0,
							Tools.ToRadians(this.scene.metadata.rotation),
							0
						);
						habatat.getChildTransformNodes()[0].rotation = new Vector3(
							0,
							-Tools.ToRadians(this.scene.metadata.rotation),
							0
						);
					}

					break;
				case ModalEvents.TILE_ROTATE_CW_ACTION:
					{
						this.scene.metadata.rotation += 60;
						const habatat = this.scene.metadata.targetTile!;
						habatat.rotation = new Vector3(
							0,
							Tools.ToRadians(this.scene.metadata.rotation),
							0
						);
						habatat.getChildTransformNodes()[0].rotation = new Vector3(
							0,
							-Tools.ToRadians(this.scene.metadata.rotation),
							0
						);
					}
					break;
			}
		});

		// this.scene.onPointerDown = (_evt, _pickInfo) => {
		// 	const ray = this.scene.createPickingRay(
		// 		this.scene.pointerX,
		// 		this.scene.pointerY,
		// 		Matrix.Identity(),
		// 		this.scene.getCameraById('camera2')
		// 	);
		// 	const hitToken = this.scene.pickWithRay(ray, (mesh) => {
		// 		return mesh && mesh?.id == 'token';
		// 	});
		// 	if (hitToken?.hit && hitToken.pickedMesh) {
		// 		console.log(hitToken);
		// 		// const pickedMesh = hitToken.pickedMesh;
		// 		// pickedMesh.visibility = 1;
		// 	}
		// 	// 주머니에서 타일 선택했을 때
		// 	//
		// };
		// this.scene.actionManager = this.
		// this.setTileActionButtons();
		// this.setPointerDownEvent();
		// this.setPointerMoveEvent();
		// this.scene.onBeforeRenderObservable.add(() => {
		// 	this.scene.meshes.forEach((mesh) => {
		// 		if (mesh.renderingGroupId == 0) {
		// 			mesh.visibility = this.faintBoard ? 0.3 : 1;
		// 		}
		// 	});
		// });
	}

	// private setTileActionButtons() {
	// 	const camAnchor = new TransformNode('cam-anchor', this.scene);
	// 	camAnchor.parent = this.scene.getCameraByName('camera')!;
	// 	this.scene.getMeshesByTags('action').forEach((mesh, index) => {
	// 		mesh.parent = camAnchor;
	// 		mesh.visibility = 1;
	// 		mesh.actionManager = new ActionManager(this.scene);
	// 		switch (mesh.name) {
	// 			case 'cancel-action':
	// 				mesh.position = new Vector3(-3, -3.5, 10);

	// 				mesh.actionManager.registerAction(
	// 					new ExecuteCodeAction(ActionManager.OnPickDownTrigger, async (_evt) => {
	// 						// this.tileLine = null;
	// 						// this.targetTile = null;
	// 						// this.setTile = false;
	// 						// this.rotation = 0;
	// 						// this.board.resetPossiblePathMaterial();
	// 						// this.pocket.lowlight();
	// 						// this.hideTileActionButtons();

	// 						const mesh = this.scene.getMeshByName('tile' + this.tileLine)!;
	// 						const src = mesh.getAbsolutePosition().clone();

	// 						mesh.parent = this.board.anchor;

	// 						await Animation.CreateAndStartAnimation(
	// 							'refillToken',
	// 							mesh,
	// 							'position',
	// 							60,
	// 							60,
	// 							new Vector3(0, 50, 0),
	// 							new Vector3(0, 0, 0),
	// 							Animation.ANIMATIONLOOPMODE_YOYO
	// 						)!.waitAsync();
	// 					})
	// 				);
	// 				break;
	// 			case 'confirm-action':
	// 				mesh.position = new Vector3(-1, -3.5, 10);
	// 				mesh.actionManager.registerAction(
	// 					new ExecuteCodeAction(ActionManager.OnPickDownTrigger, async (_evt) => {
	// 						const throwToken = await this.throwToken();

	// 						if (throwToken) {
	// 							this.board.setTile(
	// 								this.selectedTile!,
	// 								this.targetTile!,
	// 								this.rotation
	// 							);
	// 							this.pocket.lowlight();
	// 							if (!this.useNature) {
	// 								this.selectedToken = this.getTokenFromLineNum(
	// 									this.tileLine!
	// 								);
	// 								this.tokenLine = this.tileLine;
	// 							}

	// 							this.pocket.deleteTile(this.tileLine!, 'right');
	// 							this.hideTileActionButtons();
	// 							this.selectedTile = null;
	// 							this.targetTile = null;
	// 							this.setTile = true;
	// 						} else {
	// 						}
	// 					})
	// 				);
	// 				break;
	// 			case 'rotate-cw-action':
	// 				mesh.position = new Vector3(1, -3.5, 10);
	// 				mesh.actionManager.registerAction(
	// 					new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (_evt) => {
	// 						if (this.selectedTile?.habitats.length == 1) return;
	// 						this.rotation += 60;
	// 						if (this.rotation >= 360) this.rotation %= 360;
	// 						this.board.paintHabitat(
	// 							this.selectedTile!,
	// 							this.targetTile!,
	// 							this.rotation
	// 						);
	// 					})
	// 				);
	// 				break;
	// 			case 'rotate-ccw-action':
	// 				mesh.position = new Vector3(3, -3.5, 10);
	// 				mesh.actionManager.registerAction(
	// 					new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (_evt) => {
	// 						if (this.selectedTile?.habitats.length == 1) return;
	// 						this.rotation -= 60;
	// 						if (this.rotation <= -360) this.rotation %= 360;
	// 						this.board.paintHabitat(
	// 							this.selectedTile!,
	// 							this.targetTile!,
	// 							this.rotation
	// 						);
	// 					})
	// 				);
	// 				break;
	// 		}

	// 		mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
	// 		mesh.setEnabled(false);
	// 	});

	// 	this.scene.onPointerObservable.add((pointerInfo) => {
	// 		if (pointerInfo.type != PointerEventTypes.POINTERDOWN) return;
	// 		const boardRay = this.scene.createPickingRay(
	// 			this.scene.pointerX,
	// 			this.scene.pointerY,
	// 			Matrix.Identity(),
	// 			this.scene.getCameraByName('camera')
	// 		);
	// 	});
	// }

	// /**
	//  * false 면 토큰 안 버리는 거니까 타일 선택 취소.
	//  * true면  토큰 버린다는 거니까 계속 진행
	//  * @returns
	//  */
	// private async throwToken() {
	// 	return new Promise<boolean>((resolve) => {
	// 		const validWildlife = new Set(this.selectedTile?.wildlife);

	// 		for (const [_, tile] of this.board.mapData) {
	// 			if (tile.placedToken) continue;
	// 			tile.wildlife.forEach((anim) => validWildlife.add(anim));
	// 		}

	// 		if (this.useNature) {
	// 			// 솔방울을 사용헀을 경우
	// 			resolve(true);
	// 		}
	// 		// 솔방울을 사용하지 않았을 경우
	// 		else {
	// 			const tokenName = 'token' + this.tileLine;
	// 			const wildLife = this.scene.getMeshByName(tokenName)!.metadata;

	// 			if (!validWildlife.has(wildLife)) {
	// 				const throwTag = wildLife + '-throw';
	// 				this.scene.getMeshesByTags(throwTag).forEach((mesh) => {
	// 					mesh.setEnabled(true);
	// 				});
	// 				this.pendings.set('throw', resolve);
	// 				return;
	// 			}
	// 		}
	// 	});
	// }

	// private showTileActionButtons() {
	// 	this.scene.getMeshesByTags('action').forEach((mesh) => {
	// 		mesh.setEnabled(true);
	// 	});
	// }

	// private hideTileActionButtons() {
	// 	this.scene.getMeshesByTags('action').forEach((mesh) => {
	// 		mesh.setEnabled(false);
	// 	});
	// }

	// private setPointerDownEvent() {
	// 	console.log(this.scene.actionManager);

	// 	this.scene.onPointerDown = (_evt, _pickInfo) => {
	// 		const ray = this.scene.createPickingRay(
	// 			this.scene.pointerX,
	// 			this.scene.pointerY,
	// 			Matrix.Identity(),
	// 			this.scene.getCameraById('camera2')
	// 		);

	// 		const boardRay = this.scene.createPickingRay(
	// 			this.scene.pointerX,
	// 			this.scene.pointerY,
	// 			Matrix.Identity(),
	// 			this.scene.getCameraById('camera')
	// 		);

	// 		const hitToken = this.scene.pickWithRay(ray, (mesh) => {
	// 			return mesh && mesh?.id == 'token';
	// 		});

	// 		const hitTile = this.scene.pickWithRay(ray, (mesh) => {
	// 			return mesh && mesh?.id == 'tile';
	// 		});

	// 		const hitBlank = this.scene.pickWithRay(boardRay, (mesh) => {
	// 			return mesh && mesh.id == 'blank' && mesh.visibility == 1;
	// 		});

	// 		// if (hitToken?.hit && hitToken.pickedMesh) {
	// 		// 	const pickedMesh = hitToken.pickedMesh;
	// 		// 	pickedMesh.visibility = 1;
	// 		// }

	// 		// 주머니에서 타일 선택했을 때
	// 		if (hitTile?.hit && hitTile.pickedMesh && !this.setTile) {
	// 			this.board.resetPossiblePathMaterial();
	// 			this.pocket.highlight(hitTile.pickedMesh);
	// 			this.selectedTile = hitTile.pickedMesh?.metadata;
	// 			this.tileLine = this.pocket.numFromName(hitTile.pickedMesh.name);
	// 		}
	// 		// 타일 선택 후 보드 선택
	// 		else if (hitBlank?.hit && hitBlank.pickedMesh && this.selectedTile && !this.setTile) {
	// 			this.board.resetPossiblePathMaterial();
	// 			this.targetTile = hitBlank.pickedMesh.name;
	// 			this.board.paintHabitat(this.selectedTile, this.targetTile, 0);
	// 			this.showTileActionButtons();
	// 		}
	// 		// 토큰을 서식지에 배치할 때.
	// 		else if (
	// 			this.setTile &&
	// 			this.selectedToken &&
	// 			this.selectedToken.visibility == 1 &&
	// 			this.selectedHabitat
	// 		) {
	// 			// this.board.setToken()
	// 			this.board.setToken(this.selectedToken.metadata, this.selectedHabitat);
	// 			this.pocket.deleteToken(this.tokenLine!, 'right');
	// 			this.pocket.discardFurthest();
	// 			this.resetActionInfo();
	// 		}
	// 		//
	// 	};
	// }

	// private resetActionInfo() {
	// 	this.tileLine = null;
	// 	this.tokenLine = null;
	// 	this.selectedTile = null;
	// 	this.targetTile = null;
	// 	this.setTile = false;
	// 	this.selectedToken = null;
	// 	this.selectedHabitat = null;
	// 	this.useNature = false;
	// 	this.rotation = 0;
	// }

	// private setPointerMoveEvent() {
	// 	this.scene.onPointerMove = (_evt, _pickInfo) => {
	// 		const ray = this.scene.createPickingRay(
	// 			this.scene.pointerX,
	// 			this.scene.pointerY,
	// 			Matrix.Identity(),
	// 			this.scene.getCameraById('camera')
	// 		);

	// 		const hitBlank = this.scene.pickWithRay(ray, (mesh) => {
	// 			return mesh && mesh.id == 'blank' && mesh.visibility == 1;
	// 		});

	// 		const hitHabitat = this.scene.pickWithRay(ray, (mesh) => {
	// 			return mesh && mesh.id == 'habitat';
	// 		});

	// 		// 위치를 결정(클릭)하지 않고 커서가 보드 밖으로 나갔을때.
	// 		if (!hitBlank?.hit && !this.targetTile && !this.setTile) {
	// 			this.board.resetPossiblePathMaterial();
	// 		}
	// 		// 보드 위에서 타일의 위치를 결정하기 위해 커서가 움직일때.
	// 		else if (hitBlank?.hit && hitBlank.pickedMesh && this.selectedTile && this.targetTile == null) {
	// 			this.board.resetPossiblePathMaterial();
	// 			this.board.paintHabitat(this.selectedTile, hitBlank.pickedMesh.name);
	// 		}
	// 		// 타일 입력을 완료하고 토큰 위치를 결정하기 위해 커서가 움직일 때.
	// 		else if (hitHabitat?.hit && hitHabitat.pickedMesh && this.setTile && this.selectedToken) {
	// 			if (hitHabitat.pickedMesh.metadata.includes(this.selectedToken.metadata)) {
	// 				this.selectedToken.visibility = 1;
	// 				const { x, z } = hitHabitat.pickedMesh.position;
	// 				this.selectedToken.position.x = x;
	// 				this.selectedToken.position.z = z;
	// 				this.selectedHabitat = hitHabitat.pickedMesh.name;
	// 			} else {
	// 				this.selectedToken.visibility = 0;
	// 				this.selectedHabitat = null;
	// 			}
	// 		}
	// 	};
	// }

	// private getTokenFromLineNum(line: number): AbstractMesh {
	// 	const tokenOrigin = this.scene.getMeshByName('token' + line)!;
	// 	const wildlife = tokenOrigin.metadata;
	// 	this.pocket.highlight(tokenOrigin);
	// 	const token = this.scene.getMeshByName(wildlife + '-token')!.clone(wildlife!, this.board.anchor)!;
	// 	token.metadata = wildlife;
	// 	token.position.y = 0.1;
	// 	return token;
	// }

	// /**
	//  * 팝업 띄우기 전에 호출해주기
	//  */
	// private goToOrigin() {
	// 	const camera = this.scene.getCameraByName('camera') as ArcRotateCamera;
	// 	camera.setPosition(new Vector3(0, 16, 0));
	// 	camera.setTarget(Vector3.Zero());
	// }
}