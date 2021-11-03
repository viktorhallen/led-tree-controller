<template>
  <div class="about">
    <video playsinline autoplay ref="video" @click="buttonClick"></video>
    <div>
      <canvas ref="canvas" />
      <spinner-overlay v-if="calculating || true" />
    </div>
    <div>
      <button @click="restartLoop">Kör</button
      ><label>Antal led: <input type="number" v-model="numberLeds"/></label>
    </div>
    <div>
      <div v-for="(led, i) in positions" :key="led">
        Led {{ led }} {{ i }}: {{ positions[led] }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

enum Color {
  r,
  g,
  b
}
type Position = {
  x: number;
  y: number;
};
type ColorPosition = {
  pos: Position;
  color: Color;
};

export default class About extends Vue {
  loopFrame = 0;
  numberLeds = 256;
  iterations: { [id: number]: ColorPosition[] } = {};
  positionCandidates: {
    [x: number]: { [y: number]: { [iteration: number]: Color } };
  } = {};
  positions: { [index: number]: Position } = {};
  colorsForPixels: Color[][] = [];
  lastIteration = -1;
  startTime = Date.now();

  calculating = false;

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

    ((window as unknown) as {
      getColorsForPixels: (a: number, b: number) => Color[];
    }).getColorsForPixels = this.getColorsForPixels;
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
    console.error(
      "navigator.MediaDevices.getUserMedia error: ",
      error.message,
      error.name
    );
  }

  loop(): void {
    if (this.ctx == null) {
      return;
    }

    const t1 = performance.now();

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

    const requiredIterations = this.getRequiredIterations(this.numberLeds);
    const iteration =
      Math.round((Date.now() - this.startTime) / 100) % requiredIterations;
    const leds = this.colorsForPixels[iteration];
    leds.forEach((color, index) => {
      if (this.ctx) {
        this.ctx.fillStyle = this.hexFromColor(color);
        this.ctx.fillRect(
          (index % 32) * 19 + 15,
          10 + 50 * Math.floor(index / 32),
          4,
          4
        );
      }
    });

    const imageData = this.ctx.getImageData(
      0,
      0,
      video.videoWidth,
      video.videoHeight
    );
    if (!this.filledIterations) {
      this.iterations[iteration] = this.findPixels(imageData);
    }
    /*
    const lastPixels = this.iterations[
      (requiredIterations + iteration - 1) % requiredIterations
    ];
    lastPixels?.forEach(element => {
      if (this.ctx) {
        this.ctx.fillStyle = this.hexFromColor(element.color);
        this.ctx?.fillRect(element.pos.x, element.pos.y + 20, 2, 2);
      }
    });*/
    /*
    this.ctx.fillText(
      (iteration).toString(),
      this.numberLeds * 15 + 20,
      20
    );*/

    /*if (lastPixels && iteration != this.lastIteration) {
      this.iterations[iteration] = this.iterations[iteration].filter(i =>
        lastPixels.some(j => i.pos.x == j.pos.x && i.pos.y == j.pos.y)
      );*/
    /*pixelsWithColorInEveryIteration.forEach(element => {
        if (this.ctx) {
          this.ctx.fillStyle = this.hexFromColor(element.color);
          this.ctx?.fillRect(element.x, element.y + 30, 1, 1);
        }
      });*/
    //}

    /*this.iterations[iteration].forEach(element => {
      if (this.ctx) {
        this.ctx.fillStyle = this.hexFromColor(element.color);
        this.ctx?.fillRect(element.pos.x, element.pos.y + 10, 2, 2);
      }
    });*/

    this.ctx.restore();
    this.lastIteration = iteration;

    if (this.filledIterations) {
      this.loopFrame = 0;
      this.calculate();
    } else {
      this.loopFrame = requestAnimationFrame(this.loop);
    }

    this.ctx.fillStyle = "#FA6607";
    Object.keys(this.positions).forEach(pixel => {
      const pos = this.positions[parseInt(pixel)];
      this.ctx?.fillText(pixel, pos.x, pos.y);
    });

    const t2 = performance.now();
    if (Math.random() > 0.99) {
      console.log("loop took:", t2 - t1);
    }
  }

  startLoop(): void {
    this.loopFrame = this.loopFrame || requestAnimationFrame(this.loop);
  }
  restartLoop(): void {
    cancelAnimationFrame(this.loopFrame);
    this.loopFrame = 0;
    this.iterations = {};
    this.lastIteration = -1;
    this.startTime = Date.now();
    this.positions = {};
    this.colorsForPixels = [];
    for (let i = 0; i < this.getRequiredIterations(this.numberLeds); i++) {
      this.colorsForPixels.push(this.getColorsForPixels(this.numberLeds, i));
    }
    this.startLoop();
  }

  findPixels(imageData: ImageData): ColorPosition[] {
    const everyNthPixel = 1;
    const data = imageData.data;
    const lst: ColorPosition[] = [];
    for (let i = 0; i < data.length; i += 4 * everyNthPixel) {
      const n = i / 4;
      const x = n % imageData.width;
      const y = Math.floor(n / imageData.width);
      if (Math.round(y % everyNthPixel) != 0) {
        //continue;
      }
      let color: Color | null = null;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lowerThresh = 160;
      const higherThresh = 210;
      if (r > higherThresh && b < lowerThresh && g < lowerThresh) {
        color = Color.r;
      } else if (r < lowerThresh && b > higherThresh && g < lowerThresh) {
        color = Color.b;
      } else if (r < lowerThresh && b < lowerThresh && g > higherThresh) {
        color = Color.g;
      }
      if (color != null) {
        lst.push({ pos: { x: x, y: y }, color: color });
      }
    }
    return lst;
  }

  getColorsForPixels(numberLeds: number, iteration: number): Color[] {
    const requiredIterations = this.getRequiredIterations(numberLeds);
    iteration %= requiredIterations;
    const array: Color[] = [];
    if (iteration == 0) {
      const odd = !!(requiredIterations % 2);
      const divisible3 = !(requiredIterations % 3);
      let i = 0;
      for (; i < numberLeds / 2; i++) {
        array.push(divisible3 ? Color.r : odd ? Color.b : Color.g);
      }
      for (; i < numberLeds; i++) {
        array.push(divisible3 ? Color.b : odd ? Color.g : Color.r);
      }
    } else {
      const subArray = this.getColorsForPixels(
        Math.ceil(numberLeds / 2),
        iteration - 1
      );
      subArray.forEach(c => array.push(c));
      subArray.forEach(c => array.push(c));
    }
    return array.slice(0, numberLeds);
  }

  getRequiredIterations(number: number): number {
    let x = 1;
    for (let i = 1; i < 10; i++) {
      x *= 2;
      if (x >= number) {
        return i;
      }
    }
    return 11;
  }

  hexFromColor(color: Color): string {
    switch (color) {
      case Color.r:
        return "#F00";
      case Color.g:
        return "#0F0";
      case Color.b:
        return "#00F";
    }
  }

  get filledIterations(): boolean {
    return this.iterationIndexes.every(i => this.iterations[i]);
  }
  get iterationIndexes(): number[] {
    const retlist: number[] = [];
    for (let i = 0; i < this.getRequiredIterations(this.numberLeds); i++) {
      retlist.push(i);
    }
    return retlist;
  }

  calculate(): void {
    this.calculating = true;
    const tStart = performance.now();

    const iterationIndexes = Object.keys(this.iterations);
    iterationIndexes.forEach(key => {
      const iteration = parseInt(key);
      this.iterations[iteration].forEach(el => {
        this.setPositionCandidate(el.pos.x, el.pos.y, iteration, el.color);
      });
    });

    const foundPixels: number[] = [];
    Object.keys(this.positionCandidates).forEach(xKey => {
      const x = parseInt(xKey);
      Object.keys(this.positionCandidates[x]).forEach(yKey => {
        const y = parseInt(yKey);
        const colors = Object.values(this.positionCandidates[x][y]);
        if (colors.length == iterationIndexes.length) {
          for (let pixel = 0; pixel < this.numberLeds; pixel++) {
            if (foundPixels.includes(pixel)) {
              continue;
            }
            const pixelColors = this.colorsForPixels.map(c => c[pixel]);
            if (colors.toString() == pixelColors.toString()) {
              this.positions[pixel] = { x: x, y: y };
              foundPixels.push(pixel);
            }
          }
        }
      });
    });
    if (Object.keys(this.positions).length !== this.numberLeds) {
      console.warn("didn't find every led");
    }
    const tEnd = performance.now();
    console.log("calculation took", tEnd - tStart);
    this.calculating = false;
  }
  setPositionCandidate(x: number, y: number, i: number, color: Color) {
    if (!this.positionCandidates) {
      this.positionCandidates = {};
    }
    if (!this.positionCandidates[x]) {
      this.positionCandidates[x] = {};
    }
    if (!this.positionCandidates[x][y]) {
      this.positionCandidates[x][y] = {};
    }
    this.positionCandidates[x][y][i] = color;
  }
}
</script>
<style scoped>
.about {
  display: flex;
  flex-direction: column;
}
</style>
