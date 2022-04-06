import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const statdir = (file: string) =>
  new Promise((resolve, reject) => {
    fs.stat(file, (err, stat) => {
      if (err) return reject(err);
      resolve(stat.isDirectory());
    });
  });

export default async function movedtsfile(entry: string, movetodir: string) {
  const dtsdirfile = path.join(entry);

  try {
    const isdir = await statdir(dtsdirfile);

    if (isdir) {
      const dirInsideFile = fs.readdirSync(dtsdirfile);
      dirInsideFile.map(async (file) => {
        const isdir = await statdir(path.join(dtsdirfile, file));

        if (isdir) {
          movedtsfile(path.join(entry, file), movetodir);
        } else {
          if (file.endsWith(".d.ts")) {
            const movefile = path.join(dtsdirfile, file);
            const go = spawn("move", [movefile, movetodir], {
              windowsVerbatimArguments: true,
              stdio: "inherit",
              shell: true,
            });

            go.on("error", (err) => {
              console.log(err);
            });
          }
        }
      });

      Promise.resolve().then(() => {
        console.log(fs.readdirSync(dtsdirfile));
      });
    }
  } catch (error) {
    console.log(error);
  }
}
