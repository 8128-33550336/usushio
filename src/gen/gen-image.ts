import { createCanvas, registerFont } from "canvas";
import { existsSync } from "node:fs";

export type ImageFormat = "image/png" | "image/jpeg";

interface ImageOptions {
    text?: string;
    color?: string;
    backgroundColor?: string;
    width?: number;
    height?: number;
    format?: ImageFormat;
}

const fontFamily = "Noto Sans JP";
const fontPath = process.env.FONT_PATH ?? "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc";
if (existsSync(fontPath)) {
    registerFont(fontPath, { family: fontFamily });
}

export const genImage = async ({ text = "", color = "#000", backgroundColor = "#fff", width = 1200, height = 630, format = "image/png" }: ImageOptions): Promise<Buffer> => {
    const lines = text.split("\n");
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";

    const initialSize = 100;
    context.font = `${initialSize}px '${fontFamily}'`;
    const measuredWidth = Math.max(1, ...lines.map((line) => context.measureText(line).width));
    const size = Math.min((width * initialSize * 0.9) / measuredWidth, height / (lines.length + 0.5));
    context.font = `${size}px '${fontFamily}'`;

    lines.forEach((line, index) => {
        context.fillText(line, width / 2, height / 2 - ((lines.length - 1) / 2 - index) * size);
    });

    return format === "image/jpeg"
        ? canvas.toBuffer("image/jpeg")
        : canvas.toBuffer("image/png");
};
