import {
	AbstractMesh,
	ActionManager,
	ExecuteCodeAction,
	MeshBuilder,
	Tools,
	TransformNode,
	Vector3,
} from '@babylonjs/core';
import { Assets, TokenMatKey } from '../assets';
import { CardMeshes, CardMeshesKey, Mediator, ScoringWildlife } from '../interfaces';

export class ScoringCard {
	private _card: CardMeshes;
	private now: CardMeshesKey | null = null;
	private finalScoreAnchor: TransformNode;
	private anchor: TransformNode;
	firstIcon!: TransformNode;
	rules!: AbstractMesh;
	totalScore!: AbstractMesh;
	constructor(
		private assets: Assets,
		private readonly mediator: Mediator,
		private scoreType: Record<ScoringWildlife, 'A' | 'B' | 'C' | 'D'>
	) {
		this._card = assets.card;

		const icon = assets.scoringIcon;
		this.anchor = assets.transformNode;
		this.anchor.name = 'scoring-anchor';
		this.anchor.parent = assets.scoringCam;
		this.anchor.position.z += 10;

		this.finalScoreAnchor = this.assets.transformNode;
		this.finalScoreAnchor.parent = this.assets.pocketCam;
		this.finalScoreAnchor.position.z += 10;
		this.finalScoreAnchor.rotation = new Vector3(Tools.ToRadians(90), 0, 0);
		this.finalScoreAnchor.scalingDeterminant = 0.7;

		[icon.rules, assets.finalScoreMesh.totalIcon].forEach((_mesh, i) => {
			const mesh = _mesh.clone(_mesh.id + '-clone', null)!;
			mesh.scaling.x *= -1;
			mesh.position = new Vector3(0, 3.3, 0);
			mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			mesh.rotate(new Vector3(0, 0, 1), Tools.ToRadians(180));
			mesh.scalingDeterminant = 0.5;
			mesh.parent = this.anchor;
			if (i == 0) {
				this.rules = mesh;
				mesh.setEnabled(true);
			} else {
				this.totalScore = mesh;
				mesh.setEnabled(false);
			}
		});

		const showRulesActionManager = assets.actionManager;
		const showRulesAction = new ExecuteCodeAction(ActionManager.OnPickTrigger, (_evt) => {
			window.open('https://www.alderac.com/wp-content/uploads/2021/08/Cascadia-Rules.pdf');
		});
		showRulesActionManager.registerAction(showRulesAction);
		this.rules.actionManager = showRulesActionManager;

		const totalScoreActionManager = assets.actionManager;
		const totalScoreAction = new ExecuteCodeAction(ActionManager.OnPickTrigger, (_evt) => {
			this.mediator.notifyObservers({ type: 'TOTAL_SCORE' });
		});
		totalScoreActionManager.registerAction(totalScoreAction);
		this.totalScore.actionManager = totalScoreActionManager;

		Object.entries(icon)
			.filter((v) => v[0].includes('-'))
			.forEach((v, i) => {
				const [name, _mesh] = v;
				const mesh = _mesh.clone(_mesh.id + '-clone', null)!;
				const wildlife = name.split('-')[0];
				const type = (String.fromCharCode(wildlife.charCodeAt(0) - 32) +
					wildlife.substring(1)) as ScoringWildlife;
				mesh.scaling.x *= -1;
				mesh.position = new Vector3(0, (1.5 - i) * 1.3, 0);
				mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
				mesh.rotate(new Vector3(0, 0, 1), Tools.ToRadians(180));
				mesh.scalingDeterminant = 0.5;
				mesh.parent = this.anchor;

				mesh.metadata = type;
				mesh.setEnabled(true);
				//TODO: scoring card 띄우면 안되는 상황이 있으니 그거 확인해야함.
				const actionManager = assets.actionManager;
				actionManager.hoverCursor = 'default';
				const showScoringCardAction = new ExecuteCodeAction(
					ActionManager.OnPickTrigger,
					(_evt) => {
						this.mediator.notifyObservers({
							type: 'SHOW_SCORING_CARD',
							data: type,
						});
					}
					// new PredicateCondition(
					// 	actionManager,
					// 	() => this.gameInfo.state != GameState.SCORING_CARD
					// )
				);
				actionManager.registerAction(showScoringCardAction);

				const iconOverAction = new ExecuteCodeAction(
					ActionManager.OnPointerOverTrigger,
					(_evt) => {
						actionManager.hoverCursor = 'pointer';
					}
				);
				actionManager.registerAction(iconOverAction);

				const iconOutAction = new ExecuteCodeAction(
					ActionManager.OnPointerOutTrigger,
					(_evt) => {
						actionManager.hoverCursor = 'default';
					}
				);
				actionManager.registerAction(iconOutAction);
				mesh.actionManager = actionManager;
			});
	}

	total() {
		this.close();
		this.finalScoreAnchor.setEnabled(true);
	}

	open(key: ScoringWildlife) {
		if (this.now) {
			this._card[this.now!].setEnabled(false);
		}
		key = key + this.scoreType[key];
		console.log(key);
		this.now = key as CardMeshesKey;
		this.finalScoreAnchor.setEnabled(false);
		this._card['Card'].setEnabled(true);
		this._card[this.now!].setEnabled(true);
	}

	close() {
		this._card['Card'].setEnabled(false);
		if (this.now) this._card[this.now!].setEnabled(false);
	}

	end(wildlifes: number[], habitats: number[]) {
		const pocketAnchor = this.assets.transformNode;
		pocketAnchor.position = new Vector3(100, 100, 100);
		pocketAnchor.parent = this.assets.pocketCam;

		for (const card in this._card) {
			this._card[card as CardMeshesKey].parent = this.assets.pocketCam;
			this._card[card as CardMeshesKey].position.z += 10;
			this._card[card as CardMeshesKey].scalingDeterminant = 0.6;
		}

		// const x = this.anchor.getChildMeshes();
		// x.forEach((v) => {});

		this.createFinalScore(wildlifes, habitats);
		// this.finalScoreAnchor.setEnabled(false);
		// this.finalScoreAnchor.setEnabled(true);
	}

	private createFinalScore(wildlifes: number[], habitats: number[]) {
		this.rules.setEnabled(false);
		this.totalScore.setEnabled(true);

		const pineCone = this.assets.token.clone('score-pinecone', this.finalScoreAnchor)!;
		pineCone.setEnabled(true);
		pineCone.material = this.assets.tokenMat['pinecone'];

		const bear = this.assets.token.clone('score-bear', this.finalScoreAnchor)!;
		bear.setEnabled(true);
		bear.material = this.assets.tokenMat['bear'];
		const elk = this.assets.token.clone('score-elk', this.finalScoreAnchor)!;
		elk.setEnabled(true);
		elk.material = this.assets.tokenMat['elk'];
		const fox = this.assets.token.clone('score-fox', this.finalScoreAnchor)!;
		fox.setEnabled(true);
		fox.material = this.assets.tokenMat['fox'];
		const hawk = this.assets.token.clone('score-hawk', this.finalScoreAnchor)!;
		hawk.setEnabled(true);
		hawk.material = this.assets.tokenMat['hawk'];
		const salmon = this.assets.token.clone('score-salmon', this.finalScoreAnchor)!;
		salmon.setEnabled(true);
		salmon.material = this.assets.tokenMat['salmon'];
		const tokenw = this.assets.finalScoreMesh['token'].clone('tokenw', this.finalScoreAnchor)!;
		tokenw.scaling.y *= -1;
		tokenw.setEnabled(true);
		// tokenw.rotate(new Vector3(1, 0, 0), Tools.ToRadians(180));

		const mountain = this.assets.tile.clone('score-mountain', this.finalScoreAnchor)!;
		mountain.setEnabled(true);
		mountain.material = this.assets.tileMat['mountain'];
		mountain.rotate(new Vector3(0, 1, 0), Tools.ToRadians(90));
		const forest = this.assets.tile.clone('score-forest', this.finalScoreAnchor)!;
		forest.setEnabled(true);
		forest.material = this.assets.tileMat['forest'];
		forest.rotate(new Vector3(0, 1, 0), Tools.ToRadians(90));
		const desert = this.assets.tile.clone('score-desert', this.finalScoreAnchor)!;
		desert.setEnabled(true);
		desert.material = this.assets.tileMat['desert'];
		desert.rotate(new Vector3(0, 1, 0), Tools.ToRadians(90));
		const swamp = this.assets.tile.clone('score-swamp', this.finalScoreAnchor)!;
		swamp.setEnabled(true);
		swamp.material = this.assets.tileMat['swamp'];
		swamp.rotate(new Vector3(0, 1, 0), Tools.ToRadians(90));
		const lake = this.assets.tile.clone('score-lake', this.finalScoreAnchor)!;
		lake.setEnabled(true);
		lake.material = this.assets.tileMat['lake'];
		lake.rotate(new Vector3(0, 1, 0), Tools.ToRadians(90));

		const tileh = this.assets.finalScoreMesh['tile'].clone('tileh', this.finalScoreAnchor)!;
		tileh.scaling.y *= -1;
		tileh.setEnabled(true);

		const tokenPositionY = [-5, -3.75, -2.5, -1.25, 0, 1.25, 2.5, 3.75];

		[pineCone, bear, elk, fox, hawk, salmon, tokenw].forEach((mesh, i) => {
			mesh.position.z += tokenPositionY[i];
			mesh.position.x += -3;
		});

		wildlifes.push(wildlifes.reduce((r, v) => r + v, 0));
		wildlifes.forEach((v, i) => {
			const mesh = this.createNumberMesh(v);
			mesh.scalingDeterminant = 0.6;
			mesh.parent = this.finalScoreAnchor;
			mesh.position.z += tokenPositionY[i];
			mesh.position.x += -2;
		});

		const tilePositionY = [-3.75, -2.5, -1.25, 0, 1.25, 2.5, 3.75];
		[mountain, forest, desert, swamp, lake, tileh].forEach((mesh, i) => {
			mesh.position.z += tilePositionY[i];
			if (i < 5) mesh.scalingDeterminant = 0.6;
			// mesh.position.x 0;
		});

		const habitatsBonus: number[] = habitats.map((v) => (v > 6 ? 2 : 0));
		habitatsBonus.push(habitatsBonus.reduce((r, v) => r + v, 0));

		habitats.push(habitats.reduce((r, v) => r + v, 0));

		habitats.forEach((v, i) => {
			const mesh = this.createNumberMesh(v);
			mesh.scalingDeterminant = 0.6;
			mesh.parent = this.finalScoreAnchor;
			mesh.position.z += tilePositionY[i];
			mesh.position.x += 1.2;
		});

		habitatsBonus.forEach((v, i) => {
			const mesh =
				v == 0 && i < 5
					? MeshBuilder.CreateBox('-', { width: 0.5, height: 0.1, depth: 0.2 })
					: this.createNumberMesh(v);
			mesh.scalingDeterminant = 0.6;
			mesh.parent = this.finalScoreAnchor;
			mesh.position.z += tilePositionY[i];
			mesh.position.x += 2.4;
		});

		const fs = this.assets.finalScoreMesh['finalscore'].clone('fs', null)!;
		fs.scaling.y *= -1;
		fs.position.z += 5;
		fs.position.x -= 2;
		fs.scalingDeterminant = 0.5;
		fs.parent = this.finalScoreAnchor;
		fs.setEnabled(true);

		const finalScore = wildlifes.pop()! + habitats.pop()! + habitatsBonus.pop()!;
		const fsNum = this.createNumberMesh(finalScore);
		fsNum.scalingDeterminant = 0.7;
		fsNum.position.z += 5;
		fsNum.position.x -= 0.7;
		fsNum.parent = this.finalScoreAnchor;
		fsNum.scalingDeterminant = 0.5;

		const points = this.assets.finalScoreMesh['points'].clone('pt', this.finalScoreAnchor)!;
		points.scaling.y *= -1;
		points.position.z += 5;
		points.position.x += 1;
		points.scalingDeterminant = 0.5;
		points.setEnabled(true);

		['Bear', 'Elk', 'Fox', 'Hawk', 'Salmon'].forEach((v, i) => {
			const cardKey = (v + this.scoreType[v as ScoringWildlife]) as CardMeshesKey;
			const matKey = v.toLowerCase();
			const icon = this.assets.token.clone('score-only-' + matKey, this._card[cardKey])!;
			icon.setEnabled(true);
			icon.scaling.y *= -1;
			icon.material = this.assets.tokenMat[matKey as TokenMatKey];
			icon.position.z += 5;
			icon.position.x -= 2;
			const colons = this.assets.infoMeshes.colons.clone(
				'score-only-' + matKey + '-colon',
				this._card[cardKey]
			)!;
			colons.setEnabled(true);
			colons.position.z += 5;
			colons.position.x -= 1;

			const score = this.createNumberMesh(wildlifes[i + 1]);
			score.scalingDeterminant = 0.7;
			score.parent = this._card[cardKey];
			score.position.z += 5;
			// score.position.x -= 1;

			const points = this.assets.finalScoreMesh['points'].clone('pt', this._card[cardKey])!;
			points.scaling.y *= -1;
			points.position.z += 5;
			points.position.x += 1.9;
			points.scalingDeterminant = 0.7;
			points.setEnabled(true);
		});
	}

	private createNumberMesh(num: number) {
		const numtf = this.assets.transformNode;
		const nums: number[] = [];
		do {
			const value = num % 10;
			nums.unshift(value);
			num = Math.floor(num / 10);
		} while (num > 0);

		nums.forEach((v, i) => {
			const mesh = this.assets.numbers[v].clone('num-clone', numtf)!;
			mesh.setEnabled(true);
			mesh.position.x += i * 0.7;
		});

		return numtf;
	}
}
