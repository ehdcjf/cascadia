import { Vector3 } from '@babylonjs/core';
import { Habitat } from './interfaces';

const H = 1.5;
const W = Math.cos(Math.PI / 6);
const rotationIndexes = {
	positive: [0, 60, 120, 180, 240, 300],
	negative: [0, -300, -240, -180, -120, -60],
};
export function tileIDFromQRS(q: number, r: number, s: number) {
	return `tile[${q}][${r}][${s}]`;
}

export function tileVectorFromQRS(q: number, r: number) {
	const column = q + (r - (r & 1)) / 2;
	const row = r;
	const offset = row % 2 == 0 ? 0 : W;
	const x = offset + 2 * W * column;
	const z = row * H;
	return new Vector3(x, 0, z);
}
export function qrsFromTileID(tileID: string) {
	const regex = /tile\[(-?\d+)\]\[(-?\d+)\]\[(-?\d+)\]/;
	const matches = tileID.match(regex);
	if (matches) {
		return { q: +matches[1], r: +matches[2], s: +matches[3] };
	} else {
		throw new Error('Tlqkf');
	}
}

export function getNeighborTileIDs(tileID: string) {
	const { q, r, s } = qrsFromTileID(tileID);
	return [
		[1, -1, 0], // NE
		[1, 0, -1], // E
		[0, 1, -1], // SE
		[-1, 1, 0], // SW
		[-1, 0, 1], // W
		[0, -1, 1], // NW
	].map((dir) => tileIDFromQRS(q + dir[0], r + dir[1], s + dir[2]));
}

export function getNeighborTileIDsByQRS(q: number, r: number, s: number) {
	return [
		[1, -1, 0], // NE
		[1, 0, -1], // E
		[0, 1, -1], // SE
		[-1, 1, 0], // SW
		[-1, 0, 1], // W
		[0, -1, 1], // NW
	].map((dir) => tileIDFromQRS(q + dir[0], r + dir[1], s + dir[2]));
}

export function getHabitatSides(habitats: Array<Habitat>, rotation: number) {
	const habitatSides = new Array(6);
	if (habitats.length == 1) {
		habitatSides.fill(habitats[0]);
	} else {
		const [h1, h2] = habitats;
		let currentHabitat = h1;
		let habitatIndex = getRotationIndex(rotation);

		for (let i = 0; i < 6; i++) {
			habitatSides[habitatIndex] = currentHabitat;
			habitatIndex++;
			if (habitatIndex == 6) habitatIndex = 0;
			if (i == 2) currentHabitat = h2;
		}
	}
	return habitatSides;
}

export function getRotationIndex(rotation: number) {
	if (rotation >= 360) rotation %= 360;
	else if (rotation <= -360) rotation %= -360;
	const sign = Math.sign(rotation) != -1 ? 'positive' : 'negative';
	return rotationIndexes[sign].indexOf(rotation);
}
