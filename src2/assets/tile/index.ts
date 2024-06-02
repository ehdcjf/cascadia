import { AbstractMesh, VertexBuffer } from '@babylonjs/core';

//  타일은 첫번째가 dl 두번째가 ds 세번째는 d
export class TileGenerator {
	constructor(mesh: AbstractMesh) {
		mesh.visibility = 1;

		mesh.setVerticesData(VertexBuffer.UVKind, uv16);
	}
}
