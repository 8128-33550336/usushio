import { genImage, type ImageFormat } from "../../gen/gen-image.js";
import { genMessageWithLf } from "../../gen/gen-message.js";

const maxSize = 1500;
const minSize = 30;

interface ImageSize {
    width?: number;
    height?: number;
}

const getSize = (text: string): ImageSize => {
    const size = text.split("&").find((param) => param.startsWith("size="));

    if (!size) {
        return {};
    }
    const split = size.slice(5).split("x");

    const width = Number(split[0]) || undefined;
    const height = Number(split[1]) || undefined;

    if (width === undefined || height === undefined ||
        width < minSize || width > maxSize || height < minSize || height > maxSize) {
        return {};
    }

    return { width, height };
};

export const reqImage = async (characterName: string, topic: string, info: string, format: ImageFormat): Promise<Buffer> => {
    const message = genMessageWithLf(characterName, topic);
    const size = getSize(info);

    return genImage({
        text: message,
        width: size.width || 1200,
        height: size.height || 630,
        format,
    });
};
