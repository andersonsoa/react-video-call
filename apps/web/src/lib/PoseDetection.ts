import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { CanvasDrawer } from "./util/utilities";

interface Deps {
  video: HTMLVideoElement;
  drawer: CanvasDrawer;
}

export class PoseDetection {
  private raId: number | null;

  video: HTMLVideoElement;
  drawer: CanvasDrawer;
  detector: poseDetection.PoseDetector | null;

  modelConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    type: "lightning",
    scoreThreshold: 0.3,
    enableTracking: false,
    maxPoses: 1,
  };

  constructor({ video, drawer }: Deps) {
    this.detector = null;
    this.video = video;
    this.drawer = drawer;

    this.raId = null;
  }

  async isVideoReady() {
    if (this.video.readyState < 2) {
      await new Promise((resolve) => {
        this.video.onloadeddata = () => {
          resolve(true);
        };
      });
    }
  }

  async createDetector() {
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      this.modelConfig,
    );

    if (!detector) throw new Error("Erro ao criar o detector");

    this.detector = detector;
  }

  async renderResult() {
    await this.isVideoReady();

    let poses = null;

    if (this.detector) {
      try {
        poses = await this.detector.estimatePoses(this.video, {
          maxPoses: this.modelConfig.maxPoses,
          flipHorizontal: false,
        });
      } catch (error) {
        this.detector.dispose();
        this.detector = null;
        alert(error);
      }
    }

    this.drawer.drawCtx(this.video);

    if (poses && poses.length > 0) {
      this.drawer.drawResults(poses);
    }
  }

  async renderPredictions() {
    await this.renderResult();

    requestAnimationFrame(this.renderPredictions.bind(this));
  }

  async start() {
    await this.createDetector();

    this.renderPredictions();
  }

  async stop() {
    if (this.raId) {
      cancelAnimationFrame(this.raId);
    }
  }
}
