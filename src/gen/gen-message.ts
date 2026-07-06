const genMessageWithSpace = (characterName: string, topic: string) => `わぁい${topic} ${characterName}${topic}大好き`;
const genMessageWithLf = (characterName: string, topic: string) => `わぁい${topic}\n${characterName}${topic}大好き`;
const genMessageArray = (characterName: string, topic: string) => [`わぁい${topic}`, `${characterName}${topic}大好き`];

export {
    genMessageWithSpace,
    genMessageWithLf,
    genMessageArray
};
