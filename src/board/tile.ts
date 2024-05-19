import {
	AbstractMesh,
	ActionManager,
	ExecuteCodeAction,
	PredicateCondition,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { TileMesh } from '../assets/tile';
import { Mediator } from '../mediator';
import { MediatorEventType, TileInfo, TokenKey, WildLife } from '../interfaces';
import { Assets } from '../assets';
import { TokenMesh } from '../assets/token';

type BoardTileInfo = Omit<TileInfo, 'tileNum'>;

const CONFIRM_TILE_ACTION = -1;

export class BoardTile {
	private _placedToken: WildLife | null = null;
	private _tileInfo: BoardTileInfo = { habitats: [], wildlife: [], rotation: 0 };
	private _token: AbstractMesh;
	private state: 'habitat' | 'tile' = 'tile';
	constructor(
		private _tileMesh: TileMesh,
		private _id: string,
		position: Vector3,
		private readonly mediator: Mediator
	) {
		this._tileMesh.position = position;

		this._tileMesh.renderEdges();
		this._tileMesh.actionManager.hoverCursor = 'default';

		this._token = Assets.getToken(this._tileMesh.anchor);
		this._token.position = new Vector3(0, 0.1, 0);
		this._token.setEnabled(false);
		this._token.isPickable = false;

		const putTokenCondition = new PredicateCondition(
			this._tileMesh.actionManager,
			() => this.mediator.canPutToken(this._tileInfo?.wildlife) && this.state == 'habitat'
		);

		const confirmTokenAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			(_evt) => {
				this._tileMesh.actionManager.hoverCursor = 'default';
				this._tileInfo.wildlife = [];
				this._placedToken = this.mediator.wildlife!;
				this._token.material = Assets.getTokenMat(
					(this.mediator.wildlife! + '-active') as TokenKey
				);
				this._tileMesh.actionManager.processTrigger(CONFIRM_TILE_ACTION);
				this._tileMesh.material = this._tileInfo;

				this.mediator.notifyObservers({ type: MediatorEventType.PUT_TOKEN });
			},
			putTokenCondition
		);

		this._tileMesh.actionManager.registerAction(confirmTokenAction);

		const drawTokenAction = new ExecuteCodeAction(
			ActionManager.OnPointerOverTrigger,
			(_evt) => {
				this._tileMesh.actionManager.hoverCursor = 'pointer';

				this._token.material = Assets.getTokenMat(this.mediator.wildlife!);
				this._token.setEnabled(true);
			},
			putTokenCondition
		);
		this._tileMesh.actionManager.registerAction(drawTokenAction);

		const cleanTokenAction = new ExecuteCodeAction(
			ActionManager.OnPointerOutTrigger,
			(_evt) => {
				this._tileMesh.actionManager.hoverCursor = 'default';
				this._token.setEnabled(false);
			},
			putTokenCondition
		);

		this._tileMesh.actionManager.registerAction(cleanTokenAction);

		const drawTileCondition = new PredicateCondition(
			this._tileMesh.actionManager,
			() => this.state == 'tile' && this.mediator.canPaintTile()
		);

		const pickDownAction = new ExecuteCodeAction(
			ActionManager.OnPickDownTrigger,
			(_evt) => {
				this._tileMesh.actionManager.hoverCursor = 'default';
				const type = MediatorEventType.PUT_TILE;
				const data = this._id;
				this.mediator.notifyObservers({ type, data });
			},
			drawTileCondition
		);

		this._tileMesh.actionManager.registerAction(pickDownAction);

		const pointerOverAction = new ExecuteCodeAction(
			ActionManager.OnPointerOverTrigger,
			(_evt) => {
				this._tileMesh.actionManager.hoverCursor = 'pointer';
				this.paint(this.mediator.pocketTile!);
			},
			drawTileCondition
		);
		this._tileMesh.actionManager.registerAction(pointerOverAction);

		const pointerOutAction = new ExecuteCodeAction(
			ActionManager.OnPointerOutTrigger,
			(_evt) => {
				this._tileMesh.actionManager.hoverCursor = 'default';
				this.clean();
			},
			drawTileCondition
		);

		this._tileMesh.actionManager.registerAction(pointerOutAction);

		const confirmTileAction = new ExecuteCodeAction(CONFIRM_TILE_ACTION, () => {
			//PUT TOKEN ACTION 추가
			this.state = 'habitat';
			while (this._tileMesh.actionManager.actions.length > 0) {
				const action = this._tileMesh.actionManager.actions.pop()!;
				this._tileMesh.actionManager.unregisterAction(action);
			}
		});
		this._tileMesh.actionManager.registerAction(confirmTileAction);

		// this._tileMesh.actionManager.
	}

	get wildlife() {
		return this._tileInfo.wildlife;
	}

	set wildlife(value: WildLife[]) {
		this._tileInfo.wildlife = value;
	}

	set placedToken(value: WildLife) {
		this._placedToken = value;
	}

	paint(value: Omit<TileInfo, 'tileNum' | 'rotation'>) {
		this._tileMesh.material = value;
		this._tileInfo = { ...this._tileInfo, ...value };
	}

	rotate(value: number) {
		let rotateY = this._tileInfo.rotation + value;
		if (Math.abs(rotateY) >= 360) rotateY %= 360;
		this._tileMesh.rotateY = rotateY;
		this._tileInfo.rotation = rotateY;
	}

	clean() {
		this._tileMesh.clean();
		this._tileInfo = { habitats: [], wildlife: [], rotation: 0 };
		this.state = 'tile';
	}

	setHabitat() {
		this.state = 'habitat';
	}

	setToken() {
		this._tileMesh.actionManager.processTrigger(CONFIRM_TILE_ACTION);
	}
}
