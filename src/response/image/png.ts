import { reqImage } from "./image.js";

const reqPng = (characterName: string, topic: string, info: string): Promise<Buffer> => reqImage(characterName, topic, info, "image/png");

export default reqPng;
