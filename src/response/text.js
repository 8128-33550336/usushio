import { genMessageWithSpace } from "../gen/gen-message.js";

const reqText = (characterName, topic, info) => {
    const message = genMessageWithSpace(characterName, topic);

    return message;
};

export default reqText;
