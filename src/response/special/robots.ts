import Mustache from "mustache";

import { genMessageWithSpace } from "../../gen/gen-message.js";
import { readTemplate } from "../../template.js";

const templateRobots = readTemplate("robots.txt");

const reqRobots = (characterName: string, topic: string): string =>
    Mustache.render(templateRobots, { message: genMessageWithSpace(characterName, topic) });

export default reqRobots;
