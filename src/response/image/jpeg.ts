import { reqImage } from "./image.js";

const reqJpeg = (characterName: string, topic: string, info: string): Promise<Buffer> => reqImage(characterName, topic, info, "image/jpeg");

export default reqJpeg;
