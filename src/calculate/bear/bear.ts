import { IScoring, MapData } from '../../interfaces';
import { Queue } from '../../utils';

export abstract class BearScoring implements IScoring {
	protected totalScore: number = 0;
	protected confirmedTiles: string[][] = [];
	protected bearGroups: string[][] = [];
	constructor(protected readonly mapData: MapData) {
		const visied: Set<string> = new Set();

		for (const [tileID, tile] of mapData) {
			if (tile.placedToken !== 'bear' || visied.has(tileID)) continue;
			const bearGroup: string[] = [tileID];
			const q = new Queue<string>();
			q.push(tileID);
			visied.add(tileID);
			while (q.size > 0) {
				const bear = q.pop()!;
				const bearTile = mapData.get(bear);
				if (!bearTile) continue;
				const neighborhood = bearTile.neighborhood;
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
