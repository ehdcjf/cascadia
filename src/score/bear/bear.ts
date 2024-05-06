import { MapData } from '../../interfaces';
import { Queue } from '../../utils';

export abstract class BearScoring {
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];
	protected bearGroups: string[][];
	constructor(protected readonly mapData: MapData) {
		const visied: Set<string> = new Set();

		for (const [key, tile] of mapData) {
			if (tile.placedToken !== 'bear' || visied.has(key)) continue;
			const bearGroup: string[] = [key];
			const q = new Queue<string>();
			q.push(key);
			visied.add(key);
			while (q.size > 0) {
				const bear = q.pop()!;
				const neighborhood = mapData.get(bear)!.neighborhood;
				for (const neighbor of neighborhood) {
					if (!mapData.has(neighbor) || visied.has(neighbor)) continue;
					const neighborToken = mapData.get(neighbor)!.placedToken;
					if (neighborToken == 'bear') {
						bearGroup.push(neighbor);
						q.push(neighbor);
						visied.add(neighbor);
					}
				}
			}
			if (bearGroup.length > 0) {
				this.bearGroups.push(bearGroup);
			}
		}
		this.calculate();
	}

	protected abstract calculate(): void;

	get score() {
		return this.totalScore;
	}

	get tiles() {
		return this.confirmedTiles;
	}
}
