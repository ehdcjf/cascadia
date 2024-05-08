import { AbstractMesh } from '@babylonjs/core';
import { QRS } from './interfaces';

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

export function setVisibility(mesh: AbstractMesh, value: number) {
	if (mesh.visibility) mesh.visibility = value;
	mesh.getChildren().forEach((child) => {
		setVisibility(child as AbstractMesh, value);
	});
}

export async function sleep(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}
