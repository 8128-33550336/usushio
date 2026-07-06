import Mustache from "mustache";

import { genMessageArray, genMessageWithSpace } from "../gen/gen-message.js";
import { genUrl } from "../url.js";
import { readTemplate } from "../template.js";

const templateMain = readTemplate("app.html");
const staticFileBaseUrl = process.env.STATIC_FILE_BASE_URL ?? "https://usushio-static.8128-33550336.com/";

const reqHtml = (characterName: string, topic: string): string => {
    const message = genMessageWithSpace(characterName, topic);
    const [messageFirst, messageSecond] = genMessageArray(characterName, topic);
    const encodeHtmlUrl = genUrl(characterName, topic, "html", "")!.encoded;
    const image1200x630Url = genUrl(characterName, topic, "png", "")!.encoded;
    const image720x720Url = genUrl(characterName, topic, "png", "size=720x720")!.encoded;

    return Mustache.render(templateMain, {
        message,
        messageFirst,
        messageSecond,
        encodeHtmlUrl,
        image1200x630Url,
        image720x720Url,
        staticFileBaseUrl,
        misskeyUrl: `https://misskey-hub.net/share/?text=${encodeURIComponent(message)}&url=${encodeURIComponent(encodeHtmlUrl)}&visibility=public&localOnly=0`,
        mailUrl: `mailto:?subject=${encodeURIComponent(message)}&body=${encodeURIComponent(`${message}\n\n${encodeHtmlUrl}`)}`,
    });
};

export default reqHtml;
