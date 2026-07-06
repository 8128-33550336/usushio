import { genMessageWithSpace } from "../gen/gen-message.js";

const reqText = (characterName: string, topic: string, _info: string): string => {
    const message = genMessageWithSpace(characterName, topic);

    return message;
};

export default reqText;
