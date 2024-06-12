import { MapData, IScoring } from '../../interfaces';
import { Queue } from '../../utils';

export abstract class SalmonScoring implements IScoring {
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];
	protected salmonGroups: string[][];

	constructor(protected readonly mapData: MapData) {
		const allValidSalmons = this.getValidSalmons();
		this.salmonGroups = this.groupedSalmons(allValidSalmons);
	}

	private getValidSalmons(): string[] {
		const validSalmons: Array<string> = [];

		for (const [salmon, tile] of this.mapData) {
			if (tile.placedToken != 'salmon') continue;

			const neighborSalmonsSize = tile.neighborhood
				.map((neighbor) => this.mapData.get(neighbor)?.placedToken ?? null)
				.filter((v) => v == 'salmon').length;
			if (neighborSalmonsSize >= 3) continue;
			validSalmons.push(salmon);
		}
		return validSalmons;
	}

	protected groupedSalmons(salmonGroup: string[]) {
		const salmonGroups: string[][] = [];
		const visited = new Set();
		for (const firstSalmon of salmonGroup) {
			if (visited.has(firstSalmon)) continue;
			const q = new Queue<string>();
			const group: string[] = [firstSalmon];
			q.push(firstSalmon);
			visited.add(firstSalmon);
			while (q.size > 0) {
				const salmon = q.pop()!;
				const neighborhood = this.mapData.get(salmon)!.neighborhood;
				for (const neighbor of neighborhood) {
					if (!salmonGroup.includes(neighbor)) continue;
					if (visited.has(neighbor)) continue;
					q.push(neighbor);
					group.push(neighbor);
					visited.add(neighbor);
				}
			}
			if (group.length > 0) salmonGroups.push(group);
		}
		return salmonGroups;
	}

	get score() {
		return this.totalScore;
	}

	get tiles() {
		return this.confirmedTiles;
	}
}
