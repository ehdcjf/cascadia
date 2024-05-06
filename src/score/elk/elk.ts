import { MapData, QRS } from '../../interfaces';
import { Queue, qrsFromTileID } from '../../utils';

export abstract class ElkScoring {
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];
	protected elkGroups: string[][];
	constructor(protected readonly mapData: MapData) {
		const elkGroup: string[] = [];
		for (const [key, tile] of mapData) {
			if (tile.placedToken == 'elk') elkGroup.push(key);
		}
		this.elkGroups = this.groupedElks(elkGroup);
		this.calculate();
	}

	protected abstract calculate(): void;

	protected groupedElks(elkGroup: string[]) {
		const elkGroups: string[][] = [];
		const visited = new Set();
		for (const firstElk of elkGroup) {
			if (visited.has(firstElk)) continue;

			const q = new Queue<string>();
			const group: string[] = [firstElk];
			q.push(firstElk);
			visited.add(firstElk);
			while (q.size > 0) {
				const token = q.pop()!;
				const neighborhood = this.mapData.get(token)!.neighborhood;
				for (const neighbor of neighborhood) {
					if (!elkGroup.includes(neighbor)) continue;
					if (visited.has(neighbor)) continue;
					q.push(neighbor);
					group.push(neighbor);
					visited.add(neighbor);
				}
			}
			if (group.length > 0) elkGroups.push(group);
		}

		return elkGroups;
	}

	protected calculateDistance(tileA: string, tileB: string) {
		const x = qrsFromTileID(tileA);
		const y = qrsFromTileID(tileB);
		return (Math.abs(x.q - y.q) + Math.abs(x.r - y.r) + Math.abs(x.s - y.s)) / 2;
	}

	get score() {
		return this.totalScore;
	}

	get tiles() {
		return this.confirmedTiles;
	}
}
