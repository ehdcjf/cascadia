import { Material, Scene } from '@babylonjs/core';
import { TileKey, TokenKey } from './interfaces';

export class MaterialManager {
	public readonly tile: Record<TileKey, Material> = {} as Record<TileKey, Material>;
	public readonly token: Record<TokenKey, Material> = {} as Record<TokenKey, Material>;

	constructor(scene: Scene) {
		(
			[
				'desert-lake',
				'desert-swamp',
				'desert',
				'forest-desert',
				'forest-lake',
				'forest-swamp',
				'lake-mountain',
				'mountain-desert',
				'mountain-forest',
				'mountain-swamp',
				'swamp-lake',
				'blank',
				'forest',
				'lake',
				'mountain',
				'swamp',
			] as TileKey[]
		).forEach((name) => {
			this.tile[name] = scene.getMaterialByName(name)!;
		});

		(
			[
				'bear',
				'elk',
				'fox',
				'hawk',
				'salmon',
				'pinecone',
				'bear-active',
				'elk-active',
				'fox-active',
				'hawk-active',
				'salmon-active',
				'bear-inactive',
				'elk-inactive',
				'fox-inactive',
				'hawk-inactive',
				'salmon-inactive',
			] as TokenKey[]
		).forEach((name) => {
			this.token[name] = scene.getMaterialByName(name)!;
		});
	}
}
