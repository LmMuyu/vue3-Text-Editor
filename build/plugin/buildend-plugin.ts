import path from "path";
import fs from "fs";
import { statdir } from "./vite-plugin-dts-file";

export default async function (root: string) {
  try {
    const isDir = await statdir(root);
    const isStyle = await statdir(path.join(root, "/css"));

    if (isDir && isStyle) {
      const dirFiles = fs.readdirSync(root);
      const cssFile = fs.readdirSync(path.join(root, "/css"));

      const cssfilepath = dirFiles.map((file) => {
        if (file.startsWith("index")) {
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}
