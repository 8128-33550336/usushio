import { parseUrl } from "./url.js";
import { createResponse } from "./response/router.js";
import { readTemplate } from "./template.js";

const mimeTypes = {
    html: "text/html; charset=UTF-8",
    json: "application/json; charset=UTF-8",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    txt: "text/plain; charset=UTF-8",
};

const badRequest = readTemplate("badRequest.html");
const unsupported = readTemplate("unsupported.html");

export const createAppResponse = async (rawHost, rawPath, rawQueryString) => {
    const parsed = parseUrl(rawHost, rawPath, rawQueryString);
    if (!parsed) {
        return { statusCode: 400, contentType: mimeTypes.html, body: badRequest };
    }

    const { characterName, topic, format, info } = parsed;
    if (!(format in mimeTypes)) {
        return { statusCode: 404, contentType: mimeTypes.html, body: unsupported };
    }

    console.log("Generating response", { characterName, topic, format, info });
    const body = Buffer.from(await createResponse(characterName, topic, format, info));
    return { statusCode: 200, contentType: mimeTypes[format], body };
};
