import { genMessageWithSpace } from "../gen/gen-message.js";

const reqJson = (characterName, topic, info) => {
    const message = genMessageWithSpace(characterName, topic);

    return JSON.stringify({
        name: characterName,
        topic,
        message,
    });
};

export default reqJson;
