import "@babylonjs/core/Debug/debugLayer";
import { Inspector } from "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import {
  Engine,
  Scene,
  Vector3,
  FreeCamera,
  SceneLoader,
  EngineFactory,
  HemisphericLight,
  ArcRotateCamera,
  Tools,
  AbstractMesh,
  Color3,
} from "@babylonjs/core";

import * as BABYLON from "@babylonjs/core";
import { createHexagons } from "./cube";
(window as any).BABYLON = BABYLON;

const H = 1.5;
const W = Math.cos(Math.PI / 6);

class App {
  private scene!: Scene;
  private engine!: Engine;

  constructor() {
    this.init();
  }

  private async init() {
    const canvas = document.querySelector("#gameCanvas") as HTMLCanvasElement;
    this.engine = (await EngineFactory.CreateAsync(
      canvas,
      undefined
    )) as Engine;

    this.createScene();
    this.engine.runRenderLoop(() => {
      if (this.scene) this.scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  private async createScene() {
    this.engine.displayLoadingUI();
    this.scene = new Scene(this.engine);
    const camera = new ArcRotateCamera(
      "camera",
      Tools.ToRadians(90),
      Tools.ToRadians(45),
      10,
      Vector3.Zero()
    );
    camera.attachControl(true);
    const light = new HemisphericLight("light", new Vector3(0, 1, 0));

    Inspector.Show(this.scene, {});

    await this.loadAssetAsync();
    await this.scene.whenReadyAsync();
    this.engine.hideLoadingUI();
  }

  //   private setCamera() {
  //     const camera = new FreeCamera("camera", new Vector3(0, 6, 20));
  //     camera.setTarget(Vector3.Zero());
  //     camera.inputs.addMouseWheel();
  //     camera.attachControl(true);
  //   }

  //   private setLight() {
  //     const light = new HemisphericLight("light", Vector3.Zero());
  //     light.intensity = 0.7;
  //   }

  private async loadAssetAsync() {
    const tiles = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "cascadia.glb"
    );

    const meshMap: Record<string, AbstractMesh> = {};
    tiles.meshes.forEach((mesh) => {
      meshMap[mesh.id] = mesh;
    });

    //     tiles.meshes.forEach((v) => {});

    //     const meshMap: Map<string, AbstractMesh> = new Map();
    for (let i = 1; i < tiles.meshes.length; i++) {
      const mesh = tiles.meshes[i];
      mesh.visibility = 0;
    }

    const beige = meshMap["begie"];

    const hexSet = createHexagons(1);

    hexSet.forEach((cube) => {
      const [column, row] = cube.cr;
      const [q, r, s] = cube.qrs;
      const oddOffset = row % 2 == 0 ? 0 : W;
      const x = oddOffset + 2 * W * column;
      const z = -row * H;
      const key = `${q}/${r}/${s}`;
      const boardMesh = beige.clone(key, beige.parent)!;
      boardMesh.visibility = 1;
      boardMesh.position = new Vector3(x, 0, z);
      boardMesh.renderOutline = true;
      boardMesh.outlineColor = new Color3(0, 0, 0);
      boardMesh.outlineWidth = 0;
    });
  }
}

new App();
