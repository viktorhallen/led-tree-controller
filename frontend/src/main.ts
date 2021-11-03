import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import ComponentRegistration from "./components/component-registration";

const app = createApp(App).use(router);

ComponentRegistration.registerComponents(app);

app.mount("#app");
