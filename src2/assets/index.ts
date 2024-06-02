import { AbstractMesh, Scene, VertexBuffer } from '@babylonjs/core';
import { TileKey, TokenKey, ActionKey } from '../interfaces';

export class UVData {
	public readonly tile: Record<TileKey, Float32Array | number[]> = {} as Record<TileKey, Float32Array | number[]>;
	public readonly token: Record<TokenKey, Float32Array | number[]> = {} as Record<
		TokenKey,
		Float32Array | number[]
	>;

	public readonly action: Record<ActionKey, Float32Array | number[]> = {} as Record<
		ActionKey,
		Float32Array | number[]
	>;

	public readonly tileIndex = VertexBuffer.UV3Kind;
	public readonly tokenIndex = VertexBuffer.UV6Kind;
	public readonly actionIndex = VertexBuffer.UV4Kind;

	constructor(scene: Scene) {
		/**
		 * 타일 UV맵
		 */
		const tile = scene.getMeshById('tile')!;
		const uv1 = tile.getVerticesData(VertexBuffer.UVKind)!; // desert-lake
		const uv2 = tile.getVerticesData(VertexBuffer.UV2Kind)!; // desert-swamp
		const uv3 = tile.getVerticesData(VertexBuffer.UV3Kind)!; //desert
		const tileDiffs = uv1?.map((v, i) => v - uv2[i]);

		this.tile['desert-lake'] = uv1;
		this.tile['desert-swamp'] = uv2;
		this.tile['desert'] = uv3;
		this.tile['forest-desert'] = uv2.map((v, i) => v - tileDiffs[i]);
		this.tile['forest-lake'] = uv2.map((v, i) => v - tileDiffs[i] * 2);
		this.tile['forest-swamp'] = uv2.map((v, i) => v - tileDiffs[i] * 3);
		this.tile['lake-mountain'] = uv2.map((v, i) => v - tileDiffs[i] * 4);
		this.tile['mountain-desert'] = uv2.map((v, i) => v - tileDiffs[i] * 5);
		this.tile['mountain-forest'] = uv2.map((v, i) => v - tileDiffs[i] * 6);
		this.tile['mountain-swamp'] = uv2.map((v, i) => v - tileDiffs[i] * 7);
		this.tile['swamp-lake'] = uv2.map((v, i) => v - tileDiffs[i] * 8);
		this.tile['blank'] = uv2.map((v, i) => v - tileDiffs[i] * 9);
		this.tile['forest'] = uv3.map((v, i) => v - tileDiffs[i]);
		this.tile['lake'] = uv3.map((v, i) => v - tileDiffs[i] * 2);
		this.tile['mountain'] = uv3.map((v, i) => v - tileDiffs[i] * 3);
		this.tile['swamp'] = uv3.map((v, i) => v - tileDiffs[i] * 4);

		/**
		 * 토큰 UV맵
		 */
		const token = scene.getMeshById('token')!;
		const bear = token.getVerticesData(VertexBuffer.UVKind)!; // 곰
		const elk = token.getVerticesData(VertexBuffer.UV2Kind)!; // 엘크
		const fox = token.getVerticesData(VertexBuffer.UV3Kind)!; // 여우
		const hawk = token.getVerticesData(VertexBuffer.UV4Kind)!; // 매
		const salmon = token.getVerticesData(VertexBuffer.UV5Kind)!; // 연어
		const pinecone = token.getVerticesData(VertexBuffer.UV6Kind)!; // 솔방울
		const tokenDiffs = pinecone.map((v, i) => v - bear[i]);
		this.token['bear'] = bear;
		this.token['elk'] = elk;
		this.token['fox'] = fox;
		this.token['hawk'] = hawk;
		this.token['salmon'] = salmon;
		this.token['pinecone'] = pinecone;
		this.token['bear-active'] = bear.map((v, i) => v - tokenDiffs[i]);
		this.token['elk-active'] = elk.map((v, i) => v - tokenDiffs[i]);
		this.token['fox-active'] = fox.map((v, i) => v - tokenDiffs[i]);
		this.token['hawk-active'] = hawk.map((v, i) => v - tokenDiffs[i]);
		this.token['salmon-active'] = salmon.map((v, i) => v - tokenDiffs[i]);
		this.token['bear-inactive'] = bear.map((v, i) => v - tokenDiffs[i] * 2);
		this.token['elk-inactive'] = elk.map((v, i) => v - tokenDiffs[i] * 2);
		this.token['fox-inactive'] = fox.map((v, i) => v - tokenDiffs[i] * 2);
		this.token['hawk-inactive'] = hawk.map((v, i) => v - tokenDiffs[i] * 2);
		this.token['salmon-inactive'] = salmon.map((v, i) => v - tokenDiffs[i] * 2);

		const action = scene.getMeshById('action')!;
		this.action['cancel'] = action.getVerticesData(VertexBuffer.UV4Kind)!;
		this.action['confirm'] = action.getVerticesData(VertexBuffer.UV3Kind)!;
		this.action['rotate-cw'] = action.getVerticesData(VertexBuffer.UV2Kind)!;
		this.action['rotate-ccw'] = action.getVerticesData(VertexBuffer.UVKind)!;
	}
}
