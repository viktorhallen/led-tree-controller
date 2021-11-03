import { App } from "@vue/runtime-dom";

export default abstract class ComponentRegistration {
  static registerComponents(vue: App): void {
    vue.component("overlay", () => import("./overlay.vue"));
    vue.component("spinner", () => import("./spinner.vue"));
    vue.component("spinner-overlay", () => import("./spinner-overlay.vue"));
  }
}
