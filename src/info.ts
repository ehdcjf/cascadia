import { AbstractMesh, Color3, Scene, StandardMaterial, Tools, TransformNode, Vector3 } from '@babylonjs/core';
import { Assets } from './assets';
import { GameInfo } from './gameInfo';

export class InfoUI {
	private turnAnchor: TransformNode[];
	private pineconeAnchor: TransformNode[];
	private numbers: AbstractMesh[];
	private anchor: TransformNode;

	constructor(private scene: Scene, private readonly gameInfo: GameInfo) {
		this.anchor = new TransformNode('modal-anchor', this.scene);
		const cam = this.scene.getCameraByName('board-cam')!;
		this.anchor.parent = cam;

		const whiteMat = new StandardMaterial('white');
		whiteMat.emissiveColor = Color3.White();

		this.numbers = new Array(10).fill(null).map((_, i) => {
			const mesh = this.scene.getMeshById(`${i}`)!;
			mesh.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
			mesh.parent = this.anchor;
			mesh.scalingDeterminant = 0.4;
			mesh.material = whiteMat;

			return mesh;
		});

		const turn = this.scene.getMeshById('turn')!.clone('turn', this.anchor)!;
		const pinecone = this.scene.getMeshById('pinecone')!.clone('pinecone', this.anchor)!;
		const colons = this.scene.getMeshById('colons')!.clone('colons', this.anchor)!;
		turn.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
		turn.position = new Vector3(-3.5, 3.5, 10);
		turn.scalingDeterminant = 0.4;
		turn.material = whiteMat;
		pinecone.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
		pinecone.position = new Vector3(0, 3.5, 10);
		pinecone.scalingDeterminant = 0.5;
		colons.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
		colons.position = new Vector3(0.4, 3.5, 10);
		colons.scalingDeterminant = 0.4;
		colons.material = whiteMat;

		const pinconTenAnchor1 = Assets.getTransformNode('pinecone-anchor-1');
		pinconTenAnchor1.parent = this.anchor;
		pinconTenAnchor1.position = new Vector3(0.6, 3.5, 10);

		const pinconTenAnchor2 = Assets.getTransformNode('pinecone-anchor-2');
		pinconTenAnchor2.parent = this.anchor;
		pinconTenAnchor2.position = new Vector3(0.85, 3.5, 10);
		this.pineconeAnchor = [pinconTenAnchor1, pinconTenAnchor2];

		const turnAnchor1 = Assets.getTransformNode('pinecone-anchor-1');
		turnAnchor1.parent = this.anchor;
		turnAnchor1.position = new Vector3(-2.4, 3.5, 10);

		const turnAnchor2 = Assets.getTransformNode('pinecone-anchor-2');
		turnAnchor2.parent = this.anchor;
		turnAnchor2.position = new Vector3(-2.15, 3.5, 10);
		this.turnAnchor = [turnAnchor1, turnAnchor2];

		this.anchor.getChildMeshes().forEach((mesh) => mesh.setEnabled(true));
		this.setPinecone(0);
		this.setTurn(20);
	}

	private setTurn(value: number) {
		this.turnAnchor.forEach((anchor) => anchor.getChildMeshes().forEach((mesh) => mesh.dispose()));
		String(value)
			.split('')
			.forEach((v, i) => {
				const mesh = this.numbers[Number(v)].clone(`turn${i}`, this.turnAnchor[i])!;
				mesh.setEnabled(true);
			});
	}

	private setPinecone(value: number) {
		this.pineconeAnchor.forEach((anchor) => anchor.getChildMeshes().forEach((mesh) => mesh.dispose()));
		String(value)
			.split('')
			.forEach((v, i) => {
				const mesh = this.numbers[Number(v)].clone(`pinecone${i}`, this.pineconeAnchor[i])!;
				mesh.setEnabled(true);
			});
	}

	reset() {
		this.setTurn(this.gameInfo.turnlefts);
		this.setPinecone(this.gameInfo.natureToken);
	}
}
