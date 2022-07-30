import { createApp } from "vue";
import App from "./App.vue";
import compPlugins from "./components";

const app = createApp(App);
  app.use(compPlugins);

  app.mount("#app");
