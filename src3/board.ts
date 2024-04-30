import { AbstractMesh, Color3, NodeGeometry, Scene, Tools, TransformNode, Vector3 } from "@babylonjs/core";
import { startingTiles } from "./data";
import { Habitat, TileInfo, WildLife } from "./interfaces";
import { TileScoring } from "./score/tile";
import { BearScoring } from "./score/token/bear";
const rotationIndexes = {
        positive: [0, 60, 120, 180, 240, 300],
        negative: [0, -300, -240, -180, -120, -60],
};
export type MapItem = {
        tileId: number;
        coor: Coordinates;
        placedTile: AbstractMesh;
        habitats: Set<Habitat>;
        wildlife: WildLife[];
        placedToken: false | WildLife;
        rotation: number;
        habitatSides: Habitat[];
};
const H = 1.5;
const W = Math.cos(Math.PI / 6);
export class Coordinates {
        private column: number;
        private row: number;
        private _vector: Vector3;
        constructor(private q: number, private r: number, private s: number) {
                this.column = this.q + (this.r - (this.r & 1)) / 2;
                this.row = this.r;

                const offset = this.row % 2 == 0 ? 0 : W;
                const x = offset + 2 * W * this.column;
                const z = this.row * H;
                this._vector = new Vector3(x, 0, z);
        }

        get key() {
                return [this.q, this.r, this.s].join("#");
        }

        get qrs() {
                return { q: this.q, r: this.r, s: this.s };
        }

        get cr() {
                return [this.column, this.row];
        }

        get vector() {
                return this._vector;
        }

        get neighborCoor() {
                const diffs = [
                        [1, -1, 0], // NE
                        [1, 0, -1], // E
                        [0, 1, -1], // SE
                        [-1, 1, 0], // SW
                        [-1, 0, 1], // W
                        [0, -1, 1], // NW
                ];

                return diffs.map((diff) => {
                        return new Coordinates(this.q + diff[0], this.r + diff[1], this.s + diff[2]);
                });
        }

        get neighborKeys() {
                return this.neighborCoor.map((v) => v.key);
        }
}

export class Board {
        protected mapData: Map<string, MapItem> = new Map();
        protected possiblePath: Map<string, AbstractMesh> = new Map();
        tfNode: TransformNode;

        constructor(protected scene: Scene) {
                this.tfNode = new TransformNode("pocket-tf", this.scene);
                this.loadStartingTile();

                new TileScoring(this.mapData);
                const bear = new BearScoring(this.mapData);
        }

        protected addTile(tileInfo: TileInfo, qrs: { q: number; r: number; s: number }) {
                const coor = new Coordinates(qrs.q, qrs.r, qrs.s);
                const habitatName = tileInfo.habitats.join("-");

                const tileMesh = this.scene.getMeshById(habitatName)!.clone(`tile${coor.key}`, this.tfNode)!;
                tileMesh.visibility = 1;
                tileMesh.position = coor.vector;
                tileMesh.rotation = new Vector3(0, Tools.ToRadians(tileInfo.rotation), 0);
                tileMesh.renderOutline = true;
                tileMesh.outlineColor = new Color3(0, 0, 0);
                tileMesh.outlineWidth = 0;

                const tfNode = new TransformNode(`geo${coor.key}`, this.scene);
                const wildlife = tileInfo.wildlife.map((anim) => {
                        const meshName = anim + "-plane";
                        const planeMash = this.scene.getMeshById(meshName)!.clone(`wildlife`, tfNode)!;
                        planeMash.position.y += 0.11;
                        // planeMash.rotation = new Vector3(0, -Tools.ToRadians(thisStartingTile.rotation), 0);
                        planeMash.visibility = 1;
                        return planeMash;
                });

                tfNode.parent = tileMesh;
                if (tileInfo.rotation >= 360) tileInfo.rotation %= 360;
                else if (tileInfo.rotation <= -360) tileInfo.rotation %= -360;
                tfNode.rotation = new Vector3(0, -Tools.ToRadians(tileInfo.rotation), 0);
                const sign = Math.sign(tileInfo.rotation) != -1 ? "positive" : "negative";
                const rotationIndex = rotationIndexes[sign].indexOf(tileInfo.rotation);
                const habitatSides = new Array(6);

                if (tileInfo.habitats.length == 1) {
                        habitatSides.fill(tileInfo.habitats[0]);
                } else {
                        const [h1, h2] = tileInfo.habitats;
                        let currentHabitat = h1;
                        let habitatIndex = rotationIndex;

                        for (let i = 0; i < 6; i++) {
                                habitatSides[habitatIndex] = currentHabitat;
                                habitatIndex++;
                                if (habitatIndex == 6) habitatIndex = 0;
                                if (i == 2) currentHabitat = h2;
                        }
                }

                if (wildlife.length == 2) {
                        wildlife[0].position.x += 0.12;
                        wildlife[0].position.z += 0.12;
                        wildlife[1].position.x -= 0.12;
                        wildlife[1].position.z -= 0.12;
                } else if (wildlife.length == 3) {
                        wildlife[0].position.z -= 0.2;
                        wildlife[1].position.z += 0.1;
                        wildlife[1].position.x -= 0.2 * Math.cos(Math.PI / 6);
                        wildlife[2].position.x += 0.2 * Math.cos(Math.PI / 6);
                        wildlife[2].position.z += 0.1;
                }

                const mapItem: MapItem = {
                        tileId: this.mapData.size + 1,
                        coor: coor,
                        placedToken: false as false,
                        placedTile: tileMesh,
                        habitats: new Set(tileInfo.habitats),
                        wildlife: tileInfo.wildlife,
                        rotation: tileInfo.rotation,
                        habitatSides: habitatSides,
                };
                this.mapData.set(coor.key, mapItem);
        }

        protected loadStartingTile() {
                const randomStartingTileID = Math.floor(Math.random() * 5);
                const startingTile = startingTiles[randomStartingTileID];

                [
                        [0, 0, 0],
                        [0, 1, -1],
                        [-1, 1, 0],
                ].forEach(([q, r, s], i) => {
                        const thisStartingTile = startingTile[i];
                        this.addTile(thisStartingTile, { q, r, s });
                });

                const emptyTileOrigin = this.scene.getMeshById("beige");
                this.mapData.forEach((mepItem, k) => {
                        mepItem.coor.neighborCoor.forEach((v) => {
                                if (!this.mapData.has(v.key) && !this.possiblePath.has(v.key)) {
                                        const emptyTile = emptyTileOrigin?.clone(`beige${v.key}`, null)!;
                                        emptyTile.visibility = 1;
                                        emptyTile.metadata = { type: "possible", qrs: v.qrs };
                                        emptyTile.position = v.vector;
                                        this.possiblePath.set(v.key, emptyTile);
                                }
                        });
                });
        }
}
