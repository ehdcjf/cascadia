import { GroupResult, MapData, QRS } from '../../interfaces';
import { Queue, qrsFromTileID } from '../../utils';

export abstract class FoxScoring {
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];
	protected foxGroups: string[][];

	constructor(protected readonly mapData: MapData) {
		const allFoxGroup: string[] = [];
		for (const [key, tile] of mapData) {
			if (tile.placedToken == 'fox') allFoxGroup.push(key);
		}
		this.foxGroups = this.groupedFoxes(allFoxGroup);
		this.calculate();
	}

	protected abstract calculate(): void;

	protected groupedFoxes(foxGroup: string[]) {
		const foxGroups: string[][] = [];
		const visited = new Set();
		for (const firstFox of foxGroup) {
			if (visited.has(firstFox)) continue;
			const q = new Queue<string>();
			const group: string[] = [firstFox];
			q.push(firstFox);
			visited.add(firstFox);
			while (q.size > 0) {
				const fox = q.pop()!;
				const neighborhood = this.mapData.get(fox)?.neighborhood ?? [];
				for (const neighbor of neighborhood) {
					if (!foxGroup.includes(neighbor)) continue;
					if (visited.has(neighbor)) continue;
					q.push(neighbor);
					group.push(neighbor);
					visited.add(neighbor);
				}
			}
			if (group.length > 0) foxGroups.push(group);
		}
		return foxGroups;
	}

	get score() {
		return this.totalScore;
	}

	get tiles() {
		return this.confirmedTiles;
	}
}
