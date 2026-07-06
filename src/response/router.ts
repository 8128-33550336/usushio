import reqJson from "./json.js";
import reqHtml from "./html.js";
import reqJpeg from "./image/jpeg.js";
import reqPng from "./image/png.js";
import reqWebp from "./image/webp.js";
import reqText from "./text.js";
import reqRobots from "./special/robots.js";

export type ResponseFormat = "html" | "json" | "jpg" | "jpeg" | "png" | "webp" | "txt";

export const createResponse = async (
    characterName: string,
    topic: string,
    format: ResponseFormat,
    info: string,
): Promise<string | Buffer> => {
    // special
    if (topic === "robots" && format === "txt") {
        return reqRobots(characterName, "robots.txt");
    } else {
        switch (format) {
            case "html": {
                return reqHtml(characterName, topic);
            }
            case "json": {
                return reqJson(characterName, topic, info);
            }
            case "jpg":
            case "jpeg": {
                return reqJpeg(characterName, topic, info);
            }
            case "png": {
                return reqPng(characterName, topic, info);
            }
            case "webp": {
                return reqWebp(characterName, topic, info);
            }
            case "txt": {
                return reqText(characterName, topic, info);
            }
        }
    }
};
