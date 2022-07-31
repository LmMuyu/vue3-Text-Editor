import { createApp } from "vue";
import App from "./App.vue";
import compPlugins from "./components";
import TextEditor from "../dist";
import "../dist/css/index.css";

const app = createApp(App);
app.use(TextEditor);
app.mount("#app");
