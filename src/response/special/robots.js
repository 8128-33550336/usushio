import Mustache from "mustache";

import { genMessageWithSpace } from "../../gen/gen-message.js";
import { readTemplate } from "../../template.js";

const templateRobots = readTemplate("robots.txt");

const reqRobots = (characterName, topic) =>
    Mustache.render(templateRobots, { message: genMessageWithSpace(characterName, topic) });

export default reqRobots;
