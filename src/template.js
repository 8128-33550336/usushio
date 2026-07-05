import { readFileSync } from "node:fs";

export const readTemplate = (name) =>
    readFileSync(new URL(`template/${name}`, import.meta.url), "utf8");
