import reqJson from "./json.js";
import reqHtml from "./html.js";
import reqPng from "./png.js";
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
            case "png": {
                return await reqPng(characterName, topic, info);
            }
            case "txt": {
                return reqText(characterName, topic, info);
            }
        }
    }
};
