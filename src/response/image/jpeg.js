import { reqImage } from "./image.js";

const reqJpeg = (characterName, topic, info) => reqImage(characterName, topic, info, "image/jpeg");

export default reqJpeg;
