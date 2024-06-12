import { ScoringTypes, Tile, IScoring } from '../interfaces';
import { Bear } from './bear';
import { Elk } from './elk';
import { Fox } from './fox';
import { Hawk } from './hawk';
import { Salmon } from './salmon';

export class TokenScoring {
	bear: IScoring;
	elk: IScoring;
	fox: IScoring;
	hawk: IScoring;
	salmon: IScoring;
	constructor(mapData: Map<string, Tile>, scoringType: ScoringTypes) {
		this.bear = new Bear[scoringType.Bear](mapData);
		this.elk = new Elk[scoringType.Elk](mapData);
		this.fox = new Fox[scoringType.Fox](mapData);
		this.hawk = new Hawk[scoringType.Hawk](mapData);
		this.salmon = new Salmon[scoringType.Salmon](mapData);
	}
}
