import { reqImage } from "./image.js";

const reqPng = (characterName, topic, info) => reqImage(characterName, topic, info, "image/png");

export default reqPng;
