import { App } from "vue";
import TextEditor from "./TextEditor.vue";

export default {
  install(app: App) {
    app.component("TextEditor", TextEditor);
  },
};
