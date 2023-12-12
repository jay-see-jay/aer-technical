import fs from "fs";

export function readJsonFile(path: string): any {
  const buf = fs.readFileSync(path);
  return JSON.parse(buf.toString());
}
