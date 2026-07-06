import { readFileSync } from "node:fs";

export const readTemplate = (name: string): string =>
    readFileSync(new URL(`template/${name}`, import.meta.url), "utf8");
