import { ActionManager, ExecuteCodeAction, PredicateCondition } from '@babylonjs/core';
import { Habitat, Mediator, WildLife } from '../interfaces';
import { BoardTileMesh } from '../assets/boardTile';
import { GameInfo } from '../gameInfo';

type TileState = 'tile' | 'habitat';

export class BoardTile {
	private _tileInfo: {
		habitats: Habitat[];
		wildlifes: WildLife[];
		placed: WildLife | null;
		rotation: number;
		state: TileState;
	} = {
		habitats: [],
		wildlifes: [],
		placed: null,
		rotation: 0,
		state: 'tile',
	};

	constructor(
		private mesh: BoardTileMesh,
		private readonly mediator: Mediator,
		private readonly gameInfo: GameInfo
	) {
		const putTokenCondition = new PredicateCondition(this.mesh.actionManager, () => {
			return (
				this.gameInfo.canDrawToken &&
				this.state == 'habitat' &&
				this._tileInfo?.wildlifes &&
				this.gameInfo.pocketToken != null &&
				this._tileInfo.wildlifes.includes(this.gameInfo.pocketToken?.wildlife)
			);
		});

		const confirmTokenAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			(_evt) => {
				this.mesh.actionManager.hoverCursor = 'default';
				const addNatureToken = this._tileInfo.wildlifes.length == 1;
				this.confirmToken();
				this.mediator.notifyObservers({
					type: 'PUT_TOKEN',
					data: { addNatureToken },
				});
			},
			putTokenCondition
		);

		this.mesh.actionManager.registerAction(confirmTokenAction);

		const drawTokenAction = new ExecuteCodeAction(
			ActionManager.OnPointerOverTrigger,
			(_evt) => {
				this.mesh.actionManager.hoverCursor = 'pointer';
				this.drawToken(this.gameInfo.pocketToken!.wildlife!);
			},
			putTokenCondition
		);
		this.mesh.actionManager.registerAction(drawTokenAction);

		const cleanTokenAction = new ExecuteCodeAction(
			ActionManager.OnPointerOutTrigger,
			(_evt) => {
				this.mesh.actionManager.hoverCursor = 'default';
				this.cleanToken();
			},
			putTokenCondition
		);
		this.mesh.actionManager.registerAction(cleanTokenAction);

		const drawTileCondition = new PredicateCondition(
			this.mesh.actionManager,
			() => this.gameInfo.canDrawTile && this.state == 'tile'
		);

		const pickDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			(_evt) => {
				console.log(_evt.meshUnderPointer!.name);
				this.mesh.actionManager.hoverCursor = 'default';
				const type = 'PUT_TILE';
				const data = this.mesh.id;
				this.mediator.notifyObservers({ type, data });
			},
			drawTileCondition
		);
		this.mesh.actionManager.registerAction(pickDownAction);

		const pointerOverAction = new ExecuteCodeAction(
			ActionManager.OnPointerOverTrigger,
			(_evt) => {
				this.mesh.actionManager.hoverCursor = 'pointer';
				this.drawTile(this.gameInfo.pocketTile!.habitats, this.gameInfo.pocketTile!.wildlife);
			},
			drawTileCondition
		);
		this.mesh.actionManager.registerAction(pointerOverAction);

		const pointerOutAction = new ExecuteCodeAction(
			ActionManager.OnPointerOutTrigger,
			(_evt) => {
				this.mesh.actionManager.hoverCursor = 'default';
				this.blank();
			},
			drawTileCondition
		);

		this.mesh.actionManager.registerAction(pointerOutAction);
	}

	playAnim() {
		this.mesh.playAnim();
	}

	stopAnim() {
		this.mesh.stopAnim();
	}

	get tileInfo() {
		return this._tileInfo;
	}

	get state() {
		return this._tileInfo.state;
	}

	get wildlifes() {
		return this._tileInfo.wildlifes;
	}

	isPlaced() {
		return this._tileInfo.placed !== null;
	}

	public confirmTile() {
		this._tileInfo.state = 'habitat';
	}

	public confirmToken() {
		this._tileInfo.wildlifes = [];
		while (this.mesh.actionManager.actions.length > 0) {
			const action = this.mesh.actionManager.actions.pop()!;
			this.mesh.actionManager.unregisterAction(action);
		}
		this.mesh.deletePotential();
	}

	public blank() {
		this.tileInfo.state = 'tile';
		this.tileInfo.habitats = [];
		this.tileInfo.wildlifes = [];
		this.mesh.cleanTile();
	}

	public drawTile(habitats: Habitat[], wildlifes: WildLife[]) {
		this.tileInfo.habitats = habitats;
		this.tileInfo.wildlifes = wildlifes;
		this.mesh.drawTile(habitats, wildlifes);
	}

	public drawToken(wildlife: WildLife) {
		this._tileInfo.placed = wildlife;
		this.mesh.drawToken(wildlife);
	}

	public cleanToken() {
		this._tileInfo.placed = null;
		this.mesh.cleanToken();
	}

	public rotate(value: number) {
		this._tileInfo.rotation += value;
		if (this._tileInfo.rotation >= 360) this._tileInfo.rotation %= 360;
		else if (this._tileInfo.rotation <= -360) this._tileInfo.rotation %= -360;
		this.mesh.rotate(this._tileInfo.rotation);
	}
}
