import { Vector3 } from '@babylonjs/core';

const H = 1.5;
const W = Math.cos(Math.PI / 6);

export class Item<T> {
	next: null | Item<T> = null;
	constructor(public value: any) {}
}

export class Queue<T> {
	head: null | Item<T> = null;
	tail: null | Item<T> = null;
	size = 0;
	constructor() {}

	push(value: T) {
		const node = new Item(value);
		if (this.head == null) {
			this.head = node;
		} else if (this.tail) {
			this.tail.next = node;
		}
		this.tail = node;
		this.size += 1;
	}

	pop(): null | T {
		if (this.head) {
			const popItem = this.head;
			this.head = this.head.next;
			this.size -= 1;
			return popItem.value;
		} else {
			return null;
		}
	}
}

export function qrsFromTileID(tileID: string) {
	const regex = /tile\[(-?\d+)\]\[(-?\d+)\]\[(-?\d+)\]/;
	const matches = tileID.match(regex);
	if (matches) {
		return {
			q: +matches[1],
			r: +matches[2],
			s: +matches[3],
		};
	} else {
		throw new Error('Tlqkf');
	}
}

export async function sleep(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

export function numFromName(tags: string) {
	const regex = /(\d)$/;
	const match = tags.match(regex)!;
	return +match[1];
}

export function tileVectorFromQRS(q: number, r: number) {
	const column = q + (r - (r & 1)) / 2;
	const row = r;
	const offset = row % 2 == 0 ? 0 : W;
	const x = offset + 2 * W * column;
	const z = row * H;
	return new Vector3(-x, 0, z);
}

export function tileIDFromQRS(q: number, r: number, s: number) {
	return `tile[${q}][${r}][${s}]`;
}

export function getNeighborhoodFromTileID(tileID: string) {
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
