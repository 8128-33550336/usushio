import { genMessageWithSpace } from "../gen/gen-message.js";

const reqJson = (characterName: string, topic: string, _info: string): string => {
    const message = genMessageWithSpace(characterName, topic);

    return JSON.stringify({
        name: characterName,
        topic,
        message,
    });
};

export default reqJson;
