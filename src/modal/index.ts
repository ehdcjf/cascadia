import { AbstractMesh, ActionManager, ExecuteCodeAction, PredicateCondition, TransformNode } from '@babylonjs/core';
import { Assets } from '../assets';
import { GameInfo, GameState } from '../gameInfo';
import { ModalType, WildLife } from '../interfaces';

export class Modals {
	private now: ModalType | null = null;
	private modal: Record<ModalType, Modal> = {} as Record<ModalType, Modal>;
	anchor: TransformNode;
	constructor(assest: Assets, gameInfo: GameInfo) {
		this.anchor = assest.modalAnchor;
		this.modal['NATURE_NO_VALID_PLACEMENT'] = new NatureNoPlacementModal(assest, gameInfo);
		this.modal['ALL_DULPLICATE_TOKEN'] = new AllDuplicateTokenModal(assest, gameInfo);
		this.modal['THREE_DULPLICATE_TOKEN'] = new ThreeDuplicateTokenModal(assest, gameInfo);
		this.modal['USE_NATURE_TOKEN'] = new UseNatureTokenModal(assest, gameInfo);
		this.modal['NATURE_PICK_ANY_TOKEN'] = new NaturePickAnyTokenModal(assest, gameInfo);
		this.modal['NATURE_PICK_ANY_TILE'] = new NaturePickAnyTileModal(assest, gameInfo);
		this.modal['NO_VALID_PLACEMENT'] = new NoPlacementModal(assest, gameInfo);
		this.modal['NATURE_CLEAR_TOKEN'] = new NatureClearTokenModal(assest, gameInfo);
		this.modal['LAST_TURN'] = new LastTurnModal(assest, gameInfo);
	}

	async open(type: ModalType, wildlife?: WildLife) {
		this.now = type;
		return await this.modal[type].open(wildlife);
	}

	close() {
		this.modal[this.now!].close();
		this.now = null;
	}

	show() {
		this.anchor.setEnabled(true);
	}

	hide() {
		this.anchor.setEnabled(false);
	}
}

abstract class Modal {
	protected buttons: AbstractMesh[] = [];
	protected resolve: any;
	constructor(protected content: TransformNode, protected buttonKeys: AbstractMesh[]) {
		const positionX = [[], [0], [-1.5, 1.5], [-2.5, 0, 2.5]];
		buttonKeys.forEach((button, i) => {
			button.setEnabled(true);
			button.position.x += positionX[buttonKeys.length][i];
		});
	}

	async open(_wildlife?: WildLife) {
		return new Promise((resolve) => {
			this.content.setEnabled(true);
			this.resolve = resolve;
		});
	}

	close() {
		if (this.resolve) {
			this.resolve(false);
			this.resolve = null;
		}
		this.content.setEnabled(false);
	}
}

class NatureNoPlacementModal extends Modal {
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		const content = assets.modalMeshes['NATURE_NO_VALID_PLACEMENT'];
		const cancel = assets.buttonMeshes['cancel'].clone('cancel', content.getChildTransformNodes()[0])!;

		const confirm = assets.buttonMeshes['confirm'].clone('confirm', content.getChildTransformNodes()[0])!;

		super(content, [cancel, confirm]);

		const cancelActionManger = assets.actionManager;
		const cancelAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(false);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(cancelActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		cancel.actionManager = cancelActionManger;
		cancel.actionManager.registerAction(cancelAction);

		const confirmActionManger = assets.actionManager;
		const confirmAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(true);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(confirmActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		confirm.actionManager = confirmActionManger;
		confirm.actionManager.registerAction(confirmAction);
	}

	open(_wildlife?: WildLife | undefined): Promise<any> {
		if (_wildlife) {
			this.content.getChildMeshes(true).forEach((mesh) => {
				if (mesh.name == 'main' || mesh.name == _wildlife) {
					mesh.setEnabled(true);
				} else {
					mesh.setEnabled(false);
				}
			});
		}
		return super.open();
	}
}

class AllDuplicateTokenModal extends Modal {
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		const content = assets.modalMeshes['ALL_DULPLICATE_TOKEN'];
		const cancel = assets.buttonMeshes['cancel'].clone('cancel', content.getChildTransformNodes()[0])!;
		super(content, [cancel]);

		const cancelActionManger = assets.actionManager;
		const cancelAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve();
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(cancelActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		cancel.actionManager = cancelActionManger;
		cancel.actionManager.registerAction(cancelAction);
	}

	open(_wildlife?: WildLife | undefined): Promise<any> {
		if (_wildlife) {
			this.content.getChildMeshes(true).forEach((mesh) => {
				if (mesh.name == 'main' || mesh.name == _wildlife) {
					mesh.setEnabled(true);
				} else {
					mesh.setEnabled(false);
				}
			});
		}
		return super.open();
	}
}

class ThreeDuplicateTokenModal extends Modal {
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		const content = assets.modalMeshes['THREE_DULPLICATE_TOKEN'];
		const cancel = assets.buttonMeshes['cancel'].clone('cancel', content.getChildTransformNodes()[0])!;
		const replace = assets.buttonMeshes['replace'].clone('replace', content.getChildTransformNodes()[0])!;
		super(content, [cancel, replace]);

		const cancelActionManger = assets.actionManager;
		const cancelAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(false);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(cancelActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		cancel.actionManager = cancelActionManger;
		cancel.actionManager.registerAction(cancelAction);

		const replaceActionManger = assets.actionManager;
		const replaceAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(true);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(replaceActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		replace.actionManager = replaceActionManger;
		replace.actionManager.registerAction(replaceAction);
	}
}

class UseNatureTokenModal extends Modal {
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		const content = assets.modalMeshes['USE_NATURE_TOKEN'];
		const close = assets.buttonMeshes['close'].clone('close', content.getChildTransformNodes()[0])!;
		const pick = assets.buttonMeshes['pick'].clone('pick', content.getChildTransformNodes()[0])!;
		const clear = assets.buttonMeshes['clear'].clone('replace', content.getChildTransformNodes()[0])!;
		super(content, [close, pick, clear]);

		const closeActionManger = assets.actionManager;
		const closeAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(0);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(closeActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		close.actionManager = closeActionManger;
		close.actionManager.registerAction(closeAction);

		const pickActionManger = assets.actionManager;
		const pickAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(1);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(pickActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		pick.actionManager = pickActionManger;
		pick.actionManager.registerAction(pickAction);

		const clearActionManger = assets.actionManager;
		const clearAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(2);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(clearActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		clear.actionManager = clearActionManger;
		clear.actionManager.registerAction(clearAction);
	}
}

class NaturePickAnyTokenModal extends Modal {
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		const content = assets.modalMeshes['NATURE_PICK_ANY_TOKEN'];
		const close = assets.buttonMeshes['close'].clone('close', content.getChildTransformNodes()[0])!;
		super(content, [close]);

		const closeActionManger = assets.actionManager;
		const closeAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve();
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(closeActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		close.actionManager = closeActionManger;
		close.actionManager.registerAction(closeAction);
	}
}

class NaturePickAnyTileModal extends Modal {
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		const content = assets.modalMeshes['NATURE_PICK_ANY_TILE'];
		const close = assets.buttonMeshes['close'].clone('close', content.getChildTransformNodes()[0])!;
		super(content, [close]);

		const closeActionManger = assets.actionManager;
		const closeAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve();
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(closeActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		close.actionManager = closeActionManger;
		close.actionManager.registerAction(closeAction);
	}
}

class NoPlacementModal extends Modal {
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		const content = assets.modalMeshes['NO_VALID_PLACEMENT'];
		const cancel = assets.buttonMeshes['cancel'].clone('cancel', content.getChildTransformNodes()[0])!;
		const confirm = assets.buttonMeshes['confirm'].clone('confirm', content.getChildTransformNodes()[0])!;
		super(content, [cancel, confirm]);

		const cancelActionManger = assets.actionManager;
		const cancelAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(false);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(cancelActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		cancel.actionManager = cancelActionManger;
		cancel.actionManager.registerAction(cancelAction);

		const confirmActionManger = assets.actionManager;
		const confirmAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve(true);
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(confirmActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		confirm.actionManager = confirmActionManger;
		confirm.actionManager.registerAction(confirmAction);
	}

	open(_wildlife?: WildLife | undefined): Promise<any> {
		if (_wildlife) {
			this.content.getChildMeshes(true).forEach((mesh) => {
				if (mesh.name == 'main' || mesh.name == _wildlife) {
					mesh.setEnabled(true);
				} else {
					mesh.setEnabled(false);
				}
			});
		}
		return super.open();
	}
}

class NatureClearTokenModal extends Modal {
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		const content = assets.modalMeshes['NATURE_CLEAR_TOKEN'];
		const close = assets.buttonMeshes['close'].clone('close', content.getChildTransformNodes()[0])!;
		super(content, [close]);

		const cancelActionManger = assets.actionManager;
		const cancelAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve();
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(cancelActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		close.actionManager = cancelActionManger;
		close.actionManager.registerAction(cancelAction);
	}
}

class LastTurnModal extends Modal {
	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		const content = assets.modalMeshes['LAST_TURN'];
		const calculate = assets.buttonMeshes['calculate'].clone(
			'calculate',
			content.getChildTransformNodes()[0]
		)!;
		super(content, [calculate]);

		const cancelActionManger = assets.actionManager;
		const cancelAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			() => {
				if (this.resolve) {
					this.resolve();
					this.resolve = null;
					this.close();
				}
			},
			new PredicateCondition(cancelActionManger, () => this.gameInfo.state == GameState.WAIT)
		);
		calculate.actionManager = cancelActionManger;
		calculate.actionManager.registerAction(cancelAction);
	}
}
