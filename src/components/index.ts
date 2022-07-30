import textEditor from "./textEditor";
import fonticon from "./fonticon";
import { App } from "vue";

const components: any[] = [textEditor, fonticon];

export default {
  install(app: App) {
    components.forEach((comp) => {
      app.use(comp);
    });
  },
};

export { textEditor, fonticon };
