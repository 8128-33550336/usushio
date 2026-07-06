import sharp from "sharp";

import reqPng from "./png.js";

const reqWebp = async (characterName, topic, info) => {
    const png = await reqPng(characterName, topic, info);
    return sharp(png).webp().toBuffer();
};

export default reqWebp;
