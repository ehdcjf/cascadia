import { AbstractMesh, Tools, TransformNode, Vector3 } from '@babylonjs/core';
import { Assets } from './assets';
import { GameInfo } from './gameInfo';

export class InfoUI {
	private turnAnchor: TransformNode;
	private pineconeAnchor: TransformNode;
	private numbers: AbstractMesh[];
	private anchor: TransformNode;

	constructor(assets: Assets, private readonly gameInfo: GameInfo) {
		this.anchor = assets.transformNode;
		this.anchor.name = 'info-anchor';
		this.anchor.position = new Vector3(0, 0, 10);
		this.anchor.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
		this.anchor.parent = assets.boardCam;

		this.numbers = new Array(21).fill(null).map((_, i) => {
			const mesh = assets.numbers[i]!;
			// mesh.parent = this.anchor;
			// mesh.scalingDeterminant = 0.3;
			return mesh;
		});

		const turn = assets.infoMeshes['turn'];
		const pinecone = assets.infoMeshes['pinecone'];
		const colons = assets.infoMeshes['colons'].clone('info-colon-clone', null)!;
		turn.scalingDeterminant = 0.4;
		pinecone.scalingDeterminant = 0.4;
		colons.scalingDeterminant = 0.4;

		turn.position = new Vector3(-3.5, 3.5, -5);
		pinecone.position = new Vector3(0, 3.5, -5);
		colons.position = new Vector3(0.4, 3.5, -5);

		turn.parent = this.anchor;
		pinecone.parent = this.anchor;
		colons.parent = this.anchor;

		turn.setEnabled(true);
		pinecone.setEnabled(true);
		colons.setEnabled(true);

		this.pineconeAnchor = assets.transformNode;
		this.pineconeAnchor.name = 'pinecone-anchor';
		this.pineconeAnchor.parent = colons;
		this.pineconeAnchor.position = new Vector3(1, 0, 0);

		this.turnAnchor = assets.transformNode;
		this.turnAnchor.name = 'turn-anchor';
		this.turnAnchor.parent = turn;
		this.turnAnchor.position = new Vector3(3.5, 0, -0.1);

		this.anchor.getChildMeshes().forEach((mesh) => mesh.setEnabled(true));
		this.reset();
	}

	private setTurn(value: number) {
		this.turnAnchor.getChildMeshes().forEach((mesh) => mesh.dispose());
		const mesh = this.numbers[value].clone(`turn${value}`, this.turnAnchor)!;
		mesh.setEnabled(true);
	}

	private setPinecone(value: number) {
		this.pineconeAnchor.getChildMeshes().forEach((mesh) => mesh.dispose());
		const mesh = this.numbers[value].clone(`pinecone${value}`, this.pineconeAnchor)!;
		mesh.setEnabled(true);
	}

	reset() {
		this.setTurn(this.gameInfo.turnlefts);
		this.setPinecone(this.gameInfo.natureToken);
	}

	dispose() {
		this.anchor.dispose();
	}
}
