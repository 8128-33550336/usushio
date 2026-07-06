import reqJson from "./json.js";
import reqHtml from "./html.js";
import reqJpeg from "./image/jpeg.js";
import reqPng from "./image/png.js";
import reqWebp from "./image/webp.js";
import reqText from "./text.js";
import reqRobots from "./special/robots.js";

export const createResponse = async (characterName, topic, format, info) => {
    // special
    if (topic === "robots" && format === "txt") {
        return reqRobots(characterName, "robots.txt", info);
    } else {
        switch (format) {
            case "html": {
                return reqHtml(characterName, topic, info);
            }
            case "json": {
                return reqJson(characterName, topic, info);
            }
            case "jpg":
            case "jpeg": {
                return await reqJpeg(characterName, topic, info);
            }
            case "png": {
                return await reqPng(characterName, topic, info);
            }
            case "webp": {
                return await reqWebp(characterName, topic, info);
            }
            case "txt": {
                return reqText(characterName, topic, info);
            }
        }
    }
};
