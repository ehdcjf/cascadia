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
        AssetContainer,
        RenderingManager,
        AssetsManager,
        Viewport,
        Color4,
} from "@babylonjs/core";

import * as BABYLON from "@babylonjs/core";
import { createHexagons } from "./cube";
import { Board } from "./board";
import { Pocket } from "./pocket";
(window as any).BABYLON = BABYLON;

const H = 1.5;
const W = Math.cos(Math.PI / 6);

class App {
        private scene!: Scene;
        private engine!: Engine;
        private board!: Board;
        subScene!: Scene;
        pocket!: Pocket;

        constructor() {
                this.init();
        }

        private async init() {
                const canvas = document.querySelector("#gameCanvas") as HTMLCanvasElement;
                this.engine = (await EngineFactory.CreateAsync(canvas, undefined)) as Engine;

                await this.createScene();
                this.board = new Board(this.scene);
                this.pocket = new Pocket(this.scene);
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
                        Vector3.Zero(),
                        this.scene,
                );
                camera.upperBetaLimit = Tools.ToRadians(80);
                camera.lowerRadiusLimit = 5;
                camera.upperRadiusLimit = 30;
                const camera2 = new ArcRotateCamera(
                        "camera2",
                        Tools.ToRadians(90),
                        Tools.ToRadians(90),
                        10,
                        new Vector3(100, 100, 100),
                        this.scene,
                );

                camera.attachControl(true);
                camera.viewport = new Viewport(0.3, 0, 0.7, 1);
                camera2.viewport = new Viewport(0, 0, 0.3, 1);

                this.scene.activeCameras?.push(camera);
                this.scene.activeCameras?.push(camera2);
                // this.subScene.activeCamera = camera2;

                const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
                const light2 = new HemisphericLight("light2", new Vector3(0, 1, 0), this.subScene);

                Inspector.Show(this.scene, {});
                await this.loadAssetAsync();
                await this.scene.whenReadyAsync();
                this.engine.hideLoadingUI();
        }

        private async loadAssetAsync() {
                const assets = await SceneLoader.ImportMeshAsync("", "./models/", "cascadia.glb", this.scene);
                assets.meshes.forEach((mesh, i) => {
                        console.log(mesh.id);
                        mesh.visibility = 0;
                });
        }
}

new App();
