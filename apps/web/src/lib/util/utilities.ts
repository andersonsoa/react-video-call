import * as poseDetection from "@tensorflow-models/pose-detection";

interface Deps {
  canvas: HTMLCanvasElement;
  scoreThreshold?: number;
  size: { width: number; height: number };
}

export class CanvasDrawer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scoreThreshold?: number;

  private size = { width: 0, height: 0 };

  private readonly DEFAULT_LINE_WIDTH = 2;
  private readonly DEFAULT_RADIUS = 4;

  private pontosDeExclusao = [
    "nose",
    "left_eye",
    "right_eye",
    "left_ear",
    "right_ear",
  ];

  constructor({ canvas, size, scoreThreshold }: Deps) {
    this.canvas = canvas;

    const ctx = this.canvas.getContext("2d");
    if (!ctx)
      throw new Error("Não foi possivel pegar o contexto 2D do canvas.");

    this.ctx = ctx;

    this.size = {
      ...size,
    };

    this.scoreThreshold = scoreThreshold;

    this.canvas.width = size.width;
    this.canvas.height = size.height;
  }

  drawCtx(video: HTMLVideoElement) {
    this.ctx.drawImage(video, 0, 0, this.size.width, this.size.height);
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.size.width, this.size.height);
  }

  drawResults(poses: any) {
    for (const pose of poses) {
      this.drawResult(pose);
    }
  }

  drawResult(pose: any) {
    if (pose.keypoints !== null) {
      this.drawKeypoints(pose.keypoints);
      this.drawSkeleton(pose.keypoints, pose.id);
    }
  }

  drawKeypoints(keypoints: any) {
    const keypointInd = poseDetection.util.getKeypointIndexBySide(
      poseDetection.SupportedModels.MoveNet,
    );

    this.ctx.fillStyle = "Red";
    this.ctx.strokeStyle = "White";
    this.ctx.lineWidth = this.DEFAULT_LINE_WIDTH;

    for (const i of keypointInd.middle) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = "Green";

    for (const i of keypointInd.left) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = "Orange";
    for (const i of keypointInd.right) {
      this.drawKeypoint(keypoints[i]);
    }
  }

  drawKeypoint(keypoint: any) {
    if (this.pontosDeExclusao.includes(keypoint.name)) {
      return;
    }

    // If score is null, just show the keypoint.
    const score = keypoint.score !== null ? keypoint.score : 1;
    const scoreThreshold = this.scoreThreshold || 0;

    if (score >= scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, this.DEFAULT_RADIUS, 0, 2 * Math.PI);
      this.ctx.fill(circle);
      this.ctx.stroke(circle);
    }
  }

  drawSkeleton(keypoints: any, poseId: number) {
    // Each poseId is mapped to a color in the color palette.
    const color = "white";

    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.DEFAULT_LINE_WIDTH;

    poseDetection.util
      .getAdjacentPairs(poseDetection.SupportedModels.MoveNet)
      .forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        if (
          this.pontosDeExclusao.includes(kp1.name) &&
          this.pontosDeExclusao.includes(kp2.name)
        ) {
          return;
        }

        // If score is null, just show the keypoint.
        const score1 = kp1.score !== null ? kp1.score : 1;
        const score2 = kp2.score !== null ? kp2.score : 1;
        const scoreThreshold = this.scoreThreshold || 0;

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
          this.ctx.beginPath();
          this.ctx.moveTo(kp1.x, kp1.y);
          this.ctx.lineTo(kp2.x, kp2.y);
          this.ctx.stroke();
        }
      });
  }
}
