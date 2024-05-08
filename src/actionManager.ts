import { AbstractMesh, Matrix, Scene, Tags } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, Container, Control, StackPanel } from '@babylonjs/gui';
import { TileInfo } from './interfaces';
import { Board } from './board';
import { Pocket } from './pocket';

export class ActionManager {
	private main: AdvancedDynamicTexture;
	private panel!: StackPanel;
	private possible: boolean = true;
	private tileLine: number | null = null;
	private tokenLine: number | null = null;
	private selectedTile: TileInfo | null = null;
	private targetTile: string | null = null;
	private setTile: boolean = false;
	private selectedToken: AbstractMesh | null = null;
	private selectedHabitat: string | null = null;
	private useNature: boolean = false;
	private rotation: number = 0;
	constructor(private scene: Scene, private board: Board, private pocket: Pocket) {
		this.main = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);
		this.main.layer!.layerMask = 0x10000000;
		this.createTileProcPanel();
		this.setPointerDownEvent();
		this.setPointerMoveEvent();
	}

	private createTileProcPanel() {
		this.panel = new StackPanel();
		this.panel.spacing = 20;
		this.panel.isVertical = false;
		this.panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		this.panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

		this.panel.paddingBottomInPixels = 10;
		this.panel.height = '50px';
		this.panel.color = 'white';
		this.panel.isVisible = false;
		this.main.addControl(this.panel);

		this.addButton(this.panel, 'red', 'cancel-btn', 'cancel', this.cancel.bind(this));

		this.addButton(this.panel, 'green', 'confirm-btn', 'confirm', this.confirm.bind(this));

		this.addButton(this.panel, 'blue', 'ccw-btn', 'rotate CCW', () => {
			this.rotate(true);
		});
		this.addButton(this.panel, 'magenta', 'cw-btn', 'rotate CW', () => {
			this.rotate(false);
		});
	}

	private addButton(
		target: Container | AdvancedDynamicTexture,
		background: string,
		name: string,
		title: string,
		fn: any
	) {
		const addBtn = Button.CreateSimpleButton(name, title);
		addBtn.width = '100px';
		addBtn.height = '50px';
		addBtn.background = background;
		addBtn.color = 'white';
		addBtn.onPointerUpObservable.add(fn);
		target.addControl(addBtn);
	}

	/**
	 * 타일 입력을 취소 => 다른 타일 선택
	 */
	private cancel() {
		this.tileLine = null;
		this.targetTile = null;
		this.setTile = false;
		this.rotation = 0;

		this.board.resetPossiblePathMaterial();

		this.pocket.lowlight();
		this.panel.isVisible = false;
		this.possible = true;
	}

	/**
	 * 타일 입력
	 */
	private confirm() {
		this.board.setTile(this.selectedTile!, this.targetTile!, this.rotation);

		this.pocket.lowlight();
		if (!this.useNature) {
			console.log(this.tileLine);
			this.selectedToken = this.getTokenFromLineNum(this.tileLine!);
			this.pocket.highlight(this.selectedToken);
			this.tokenLine = this.tileLine;
		}

		this.pocket.deleteTile(this.tileLine!, 'right');
		this.selectedTile = null;
		this.targetTile = null;
		this.setTile = true;
		this.panel.isVisible = false;
		this.possible = true;
	}

	/**
	 * true면 반시계방향 회전,  false면 시계방향 회전
	 * @param ccw
	 * @returns
	 */
	private rotate(ccw: boolean) {
		const angle = ccw ? -60 : 60;
		if (this.selectedTile?.habitats.length == 1) return;
		this.rotation += angle;
		if (this.rotation >= 360) this.rotation %= 360;
		else if (this.rotation <= -360) this.rotation %= 360;
		this.board.drawHabitat(this.selectedTile!, this.targetTile!, this.rotation);
	}

	private setPointerDownEvent() {
		this.scene.onPointerDown = (_evt, _pickInfo) => {
			if (!this.possible) return;
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
				return mesh && mesh?.id == 'token';
			});

			const hitTile = this.scene.pickWithRay(ray, (mesh) => {
				return mesh && mesh?.id == 'tile';
			});

			const hitBlank = this.scene.pickWithRay(boardRay, (mesh) => {
				return mesh && mesh.id == 'blank' && mesh.visibility == 1;
			});

			// if (hitToken?.hit && hitToken.pickedMesh) {
			// 	const pickedMesh = hitToken.pickedMesh;
			// 	pickedMesh.visibility = 1;
			// }

			// 주머니에서 타일 선택했을 때
			if (hitTile?.hit && hitTile.pickedMesh && !this.setTile) {
				this.board.resetPossiblePathMaterial();
				this.pocket.highlight(hitTile.pickedMesh);
				this.selectedTile = hitTile.pickedMesh?.metadata;
				this.tileLine = this.pocket.tileNumFromName(hitTile.pickedMesh.name);
			}
			// 타일 선택 후 보드 선택
			else if (hitBlank?.hit && hitBlank.pickedMesh && this.selectedTile && !this.setTile) {
				this.board.resetPossiblePathMaterial();
				this.targetTile = hitBlank.pickedMesh.name;
				console.log(this.selectedTile);
				this.board.drawHabitat(this.selectedTile, this.targetTile, 0);
				this.showTileActions();
			}
			// 토큰을 서식지에 배치할 때.
			else if (
				this.setTile &&
				this.selectedToken &&
				this.selectedToken.visibility == 1 &&
				this.selectedHabitat
			) {
				// this.board.setToken()
				this.board.setToken(this.selectedToken.metadata, this.selectedHabitat);
				this.pocket.deleteToken(this.tokenLine!, 'right');

				this.pocket.discardFurthest();
				this.selectedToken = null;
				this.selectedHabitat = null;

				/**
				 * 사용한 타일,토큰 제거하기
				 * 타일 라인이랑 토큰 라인을 알고 있어서,
				 * 두 메시를 가져오는 것은 어렵지 않고..
				 *
				 * 새로운 토큰이랑..타일을 배치해야됨.
				 *
				 * pocket으로 가서 하나씩 새로 뽑은 다음.
				 *
				 *
				 *
				 *
				 *
				 */
			}
		};
	}

	private setPointerMoveEvent() {
		this.scene.onPointerMove = (_evt, _pickInfo) => {
			if (!this.possible) return;
			const ray = this.scene.createPickingRay(
				this.scene.pointerX,
				this.scene.pointerY,
				Matrix.Identity(),
				this.scene.getCameraById('camera')
			);

			const hitBlank = this.scene.pickWithRay(ray, (mesh) => {
				return mesh && mesh.id == 'blank' && mesh.visibility == 1;
			});

			const hitHabitat = this.scene.pickWithRay(ray, (mesh) => {
				return mesh && mesh.id == 'habitat';
			});

			// 위치를 결정(클릭)하지 않고 커서가 보드 밖으로 나갔을때.
			if (!hitBlank?.hit && !this.targetTile && !this.setTile) {
				this.board.resetPossiblePathMaterial();
			}
			// 보드 위에서 타일의 위치를 결정하기 위해 커서가 움직일때.
			else if (hitBlank?.hit && hitBlank.pickedMesh && this.selectedTile && this.targetTile == null) {
				this.board.resetPossiblePathMaterial();
				this.board.drawHabitat(this.selectedTile, hitBlank.pickedMesh.name);
			}
			// 타일 입력을 완료하고 토큰 위치를 결정하기 위해 커서가 움직일 때.
			else if (hitHabitat?.hit && hitHabitat.pickedMesh && this.setTile && this.selectedToken) {
				if (hitHabitat.pickedMesh.metadata.includes(this.selectedToken.metadata)) {
					this.selectedToken.visibility = 1;
					const { x, z } = hitHabitat.pickedMesh.position;
					this.selectedToken.position.x = x;
					this.selectedToken.position.y = 0.1;
					this.selectedToken.position.z = z;
					this.selectedHabitat = hitHabitat.pickedMesh.name;
				} else {
					this.selectedToken.visibility = 0;
					this.selectedHabitat = null;
				}
			} else {
			}
		};
	}

	private showTileActions() {
		this.possible = false;
		this.panel.isVisible = true;
	}

	private getTokenFromLineNum(line: number): AbstractMesh {
		console.log(line);
		const wildlife = this.scene.getMeshByName('token' + line)!.metadata;
		const mesh = this.scene.getMeshByName(wildlife + '-token')!.clone(wildlife!, this.board.anchor)!;
		mesh.metadata = wildlife;
		return mesh;
	}
}
