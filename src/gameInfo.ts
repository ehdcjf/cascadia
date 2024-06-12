import { PocketTileInfo, PocketTokenInfo, WildLife } from './interfaces';

export enum GameState {
	READY, // 턴 종료되고, 정리할때.
	START, // 타일 토큰 관련 액션
	WAIT, // 보통 모달 띄우고 닫기 전까지
	NATURE_PICK_ANY,
	NATURE_CLEAR_TOKEN,
	SCORING_CARD,
	CALCULATE,
}

export class GameInfo {
	private _state = GameState.START;
	public lastState = GameState.START;

	public pocketTile: PocketTileInfo | null = null;

	public pocketToken: PocketTokenInfo | null = null;

	public targetTileID: string | null = null;
	public targetTokenID: string | null = null;

	public duplicate: WildLife | null = null;

	// replace3했는지 확인할 때 사용.
	// 왜냐?  한 턴에 한번만 할 수 있음
	public useRefill: boolean = false;

	// natureToken 써서  Pocket에 있는 Token Clear 할 때 사용
	public natureClear = new Set<number>();

	public canUndo: boolean = false;
	public canRefill: boolean = false;
	public canPickTile: boolean = false;
	public canPickToken: boolean = false;
	public canDrawTile: boolean = false;
	public canDrawToken: boolean = false;

	public natureToken = 0;
	public turnlefts = 20;

	get state() {
		return this._state;
	}

	set state(value: GameState) {
		if (this.lastState != this.state) this.lastState = this.state;
		this._state = value;
	}

	get myTile() {
		return this.pocketTile?.index;
	}

	get myToken() {
		return this.pocketToken?.index;
	}
}
