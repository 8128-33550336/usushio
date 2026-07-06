import { parseUrl } from "./url.js";
import { createResponse, type ResponseFormat } from "./response/router.js";
import { readTemplate } from "./template.js";

const mimeTypes: Record<ResponseFormat, string> = {
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

export interface AppResponse {
    statusCode: number;
    contentType: string;
    body: Buffer;
}

const isResponseFormat = (format: string): format is ResponseFormat =>
    Object.hasOwn(mimeTypes, format);

export const createAppResponse = async (
    rawHost: string,
    rawPath: string,
    rawQueryString: string,
): Promise<AppResponse> => {
    const parsed = parseUrl(rawHost, rawPath, rawQueryString);
    if (!parsed) {
        return { statusCode: 400, contentType: mimeTypes.html, body: Buffer.from(badRequest) };
    }

    const { characterName, topic, format, info } = parsed;
    if (!isResponseFormat(format)) {
        return { statusCode: 404, contentType: mimeTypes.html, body: Buffer.from(unsupported) };
    }

    console.log("Generating response", { characterName, topic, format, info });
    const body = Buffer.from(await createResponse(characterName, topic, format, info));
    return { statusCode: 200, contentType: mimeTypes[format], body };
};
