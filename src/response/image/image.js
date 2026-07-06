import { genImage } from "../../gen/gen-image.js";
import { genMessageWithLf } from "../../gen/gen-message.js";

const maxSize = 1500;
const minSize = 30;

const getSize = (text) => {
    const size = text.split("&").find((param) => param.startsWith("size="));

    if (!size) {
        return { width: undefined, height: undefined };
    }
    const split = size.slice(5).split("x");

    const width = +split[0] || undefined;
    const height = +split[1] || undefined;

    if (!(width >= minSize && width <= maxSize && height >= minSize && height <= maxSize)) {
        return {
            width: undefined,
            height: undefined,
        };
    }

    return { width, height };
};

export const reqImage = async (characterName, topic, info, format) => {
    const message = genMessageWithLf(characterName, topic);
    const size = getSize(info);

    return genImage({
        text: message,
        width: size.width || 1200,
        height: size.height || 630,
        format,
    });
};
