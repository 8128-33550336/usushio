import { genMessageWithLf } from "../gen/gen-message.js";
import { genImage } from "../gen/gen-image.js";

const maxSize = 1500;
const minSize = 30;

const getSize = (text) => {
    const size = text.split("&").filter((param) => param.startsWith("size="))[0];

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

const reqPng = async (characterName, topic, info) => {
    const message = genMessageWithLf(characterName, topic);

    const size = getSize(info);

    const result = await genImage({
        text: message,
        width: size.width || 1200,
        height: size.height || 630,
    });
    return result;
};

export default reqPng;
