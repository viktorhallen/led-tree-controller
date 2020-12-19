<template>
  <div class="about">
    <h1>This is an about page</h1>
    {{ hej }}
    <video playsinline autoplay ref="video" @click="buttonClick"></video>
    <div>
      <canvas ref="canvas" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class About extends Vue {
  loopFrame = 0;
  get hej(): string {
    return "asd";
  }
  get video(): HTMLVideoElement {
    return this.$refs["video"] as HTMLVideoElement;
  }
  get canvas(): HTMLCanvasElement {
    return this.$refs["canvas"] as HTMLCanvasElement;
  }
  get ctx(): CanvasRenderingContext2D | null {
    return this.canvas.getContext("2d");
  }
  mounted(): void {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then(this.handleSuccess)
      .catch(this.handleError);
    this.startLoop();
  }
  onBeforeDestroy(): void {
    cancelAnimationFrame(this.loopFrame);
  }

  buttonClick(): void {
    const video = this.video;
    const canvas = this.canvas;
    if (canvas == null || video == null) {
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    this.ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  constraints = {
    audio: false,
    video: true
  };

  handleSuccess(stream: MediaProvider): void {
    this.video.srcObject = stream;
  }

  handleError(error: Error): void {
    console.log(
      "navigator.MediaDevices.getUserMedia error: ",
      error.message,
      error.name
    );
  }

  loop(): void {
    this.loopFrame = requestAnimationFrame(this.loop);
    if (this.ctx == null) {
      return;
    }
    const video = this.video;

    //ctx.clearRect(0, 0, width, height);

    // ctx.globalAlpha = 0.005;
    // ctx.fillStyle = "#FFF";
    // ctx.fillRect(0, 0, width, height);

    this.ctx.save();

    // ctx.beginPath();
    // ctx.arc( centerX, centerY, 140, 0, twoPI , false);
    // //ctx.rect(0, 0, width/2, height/2);
    // ctx.closePath();
    // ctx.clip();

    this.ctx.fillStyle = "#FFF";
    this.ctx.fillRect(0, 0, 30, 30);

    // ctx.translate( centerX, centerY );
    // rotation += 0.005;
    // rotation = rotation > 360 ? 0 : rotation;
    // ctx.rotate(rotation);
    // ctx.translate( -centerX, -centerY );
    this.ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const imageData = this.ctx.getImageData(
      0,
      0,
      video.videoWidth,
      video.videoHeight
    );
    const t1 = performance.now();
    let redPixels = this.getRedPixels(imageData);
    const t2 = performance.now();
    redPixels = this.getRedPixels2(imageData);
    const t3 = performance.now();
    if (Math.random() > 0.99) {
      console.log(t2 - t1, t3 - t2);
    }

    this.ctx.fillStyle = "#0F0";
    redPixels.forEach(element => {
      this.ctx?.fillRect(element[0], element[1], 1, 1);
    });
    this.ctx.restore();
  }

  startLoop(): void {
    this.loopFrame = this.loopFrame || requestAnimationFrame(this.loop);
  }

  getRedPixels(imageData: ImageData): number[][] {
    const data = imageData.data;
    const list = [];
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 180 && data[i + 1] < 160 && data[i + 2] < 160) {
        const n = i / 4;
        const x = n % imageData.width;
        const y = n / imageData.width;
        list.push([x, y]);
      }
    }
    return list;
  }

  getRedPixels2(imageData: ImageData): number[][] {
    const rgbData: {r: number, g: number, b: number}[] = []
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      rgbData.unshift({r: imageData.data[i], g: imageData.data[i+1], b: imageData.data[i+2]});
    }
    const hsvData: { h: number; s: number; v: number }[] = rgbData.map(x => this.rgb2hsv(x.r,x.g,x.b));
    return [];
  }
  rgb2hsv(
    r: number,
    g: number,
    b: number
  ): { h: number; s: number; v: number } {
    const rabs = r / 255;
    const gabs = g / 255;
    const babs = b / 255;
    const v = Math.max(rabs, gabs, babs);
    const diff = v - Math.min(rabs, gabs, babs);
    const diffc = (c: number) => (v - c) / 6 / diff + 1 / 2;
    const percentRoundFn = (num: number) => Math.round(num * 100) / 100;
    let h = 0,
      s: number;
    if (diff == 0) {
      h = s = 0;
    } else {
      s = diff / v;
      const rr = diffc(rabs);
      const gg = diffc(gabs);
      const bb = diffc(babs);

      if (rabs === v) {
        h = bb - gg;
      } else if (gabs === v) {
        h = 1 / 3 + rr - bb;
      } else if (babs === v) {
        h = 2 / 3 + gg - rr;
      }
      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }
    return {
      h: Math.round(h * 360),
      s: percentRoundFn(s * 100),
      v: percentRoundFn(v * 100)
    };
  }
}
</script>
<style scoped>
.about {
  display: flex;
  flex-direction: column;
}
</style>
