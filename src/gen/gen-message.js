const genMessageWithSpace = (characterName, topic) => `わぁい${topic} ${characterName}${topic}大好き`;
const genMessageWithLf = (characterName, topic) => `わぁい${topic}\n${characterName}${topic}大好き`;
const genMessageArray = (characterName, topic) => [`わぁい${topic}`, `${characterName}${topic}大好き`];

export {
    genMessageWithSpace,
    genMessageWithLf,
    genMessageArray
};
