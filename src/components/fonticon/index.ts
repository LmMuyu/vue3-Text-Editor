import { App } from "vue";
import FontIcon from "./FontIcon.vue";

export default {
  install(app: App) {
    app.component("FontIcon", FontIcon);
  },
};
