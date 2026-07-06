import punycode from "punycode";

interface EncodedValue {
    encoded: string;
    raw: string;
}

export interface ParsedUrl {
    characterName: string;
    topic: string;
    format: string;
    info: string;
}

const codePoint = (char: string): number => char.codePointAt(0)!;

const checkValidHostname = (hostname: string): boolean => {
    return hostname.match(/^([-a-z0-9]+)\.usush\.io$/) !== null;
};

const isCharRange = (char: string, start: string, end: string): boolean => {
    const value = codePoint(char);
    return value >= codePoint(start) && value <= codePoint(end);
};

const allowedSymbols = " !\"#$%&'()*+,./:;<=>?@[\\]^_`{|}~"; // without hyphen

const encodeAscii = (host: string): string | null => {
    let output = "";
    for (const char of host) {
        if (isCharRange(char, "a", "z") || isCharRange(char, "0", "9")) {
            output += char;
        } else if (isCharRange(char, "A", "Z")) {
            output += "-" + String.fromCodePoint(codePoint(char) + 0x20);
        } else if (char === "-") {
            output += "--";
        } else if (isCharRange(char, "\x00", "\x7f")) {
            if (!allowedSymbols.includes(char)) {
                return null;
            }
            const code = codePoint(char);
            output += "-" + code.toString(16).padStart(2, "0");
        } else {
            output += char;
        }
    }
    return output;
};

export const encodeHostname = (characterName: string): EncodedValue | null => {
    if (characterName === "あかり") {
        return {
            encoded: "usush.io",
            raw: "usush.io",
        };
    }
    const encodedName = encodeAscii(characterName);
    if (encodedName === null) {
        return null;
    }
    // const rawHost = `${encodedName}.usush.io`;
    let subdomain = punycode.toASCII(encodedName);
    if (encodedName.startsWith("xn--") && subdomain === encodedName) {
        // rawHost is punycode like string
        subdomain = `xn--${encodedName}-`;
    }
    const rawHost = `${encodedName}.usush.io`;
    const host = `${subdomain}.usush.io`;
    if (!checkValidHostname(host)) {
        return null;
    }
    if (decodeHostname(host) !== characterName) {
        return null;
    }
    return {
        encoded: host,
        raw: rawHost,
    };
};

const decodeAscii = (host: string): string | null => {
    let output = "";
    let isBeforeHyphen = false;
    let beforeCodeFirst = null;
    for (const char of host) {
        if (isBeforeHyphen) {
            if (char === "-") {
                output += "-";
            } else if (isCharRange(char, "a", "z")) {
                output += String.fromCodePoint(codePoint(char) - 0x20);
            } else if (isCharRange(char, "0", "7")) {
                beforeCodeFirst = char;
            } else {
                return null;
            }
            isBeforeHyphen = false;
        } else {
            if (beforeCodeFirst !== null) {
                if (isCharRange(char, "0", "9")) {
                    const calcChar = String.fromCodePoint((codePoint(beforeCodeFirst) - 0x30) * 16 + (codePoint(char) - 0x30));
                    if (!allowedSymbols.includes(calcChar)) {
                        return null;
                    }
                    output += calcChar;
                } else if (isCharRange(char, "a", "f")) {
                    const calcChar = String.fromCodePoint((codePoint(beforeCodeFirst) - 0x30) * 16 + (codePoint(char) - 0x61 + 0xa));
                    if (!allowedSymbols.includes(calcChar)) {
                        return null;
                    }
                    output += calcChar;
                } else {
                    return null;
                }
                beforeCodeFirst = null;
            } else {
                if (char === "-") {
                    isBeforeHyphen = true;
                } else {
                    output += char;
                }
            }
        }
    }
    return output;
};

export const decodeHostname = (host: string): string | null => {
    const subDomain = host.match(/^([-a-z0-9\.]+)\.usush\.io$/)?.[1] ?? "xn--l8js3q"; // あかり
    const characterName = decodeAscii(punycode.toUnicode(subDomain));
    return characterName;
};

const toPathName = (topic: string): EncodedValue | null => {
    if (topic === "うすしお") {
        return {
            encoded: "",
            raw: "",
        };
    }
    try {
        const encoded = encodeURI(topic);
        return {
            encoded,
            raw: topic,
        };
    } catch (error) {
        return null;
    }
};

export const fromPathName = (rawPath: string, rawQueryString: string): string => {
    const orig = (rawPath + (rawQueryString ? "?" + rawQueryString : "")).slice(1);
    try {
        return decodeURI(orig);
    } catch {
        return orig;
    }
};

const getExt = (path: string, format: string, info: string): string => {
    if (!path.includes(".") && format === "html" && info == "" && !path.endsWith("?")) {
        return "";
    }
    return info === "" ? `.${format}` : `.${format}?${info}`;
};

export const genUrl = (characterName: string, topic: string, format: string, info: string): EncodedValue | null => {
    const host = encodeHostname(characterName);
    const path = toPathName(topic);
    if (host === null || path === null) {
        return null;
    }
    const ext = getExt(path.encoded, format, info);

    return {
        encoded: `https://${host.encoded}/${path.encoded}${ext}`,
        raw: `https://${host.raw}/${path.raw}${ext}`,
    };
};

const parseExt = (path: string): Pick<ParsedUrl, "topic" | "format" | "info"> => {
    const lastIndex = path.lastIndexOf(".");
    if (lastIndex === -1) {
        return {
            topic: path || "うすしお",
            format: "html",
            info: "",
        };
    } else {
        const topic = path.slice(0, lastIndex) || "うすしお";
        const format = path.slice(lastIndex + 1).split("?")[0] || "html";
        const info = path.slice(lastIndex + 1).split("?")[1] ?? "";
        return { topic, format, info };
    }
};

const removeAsciiControlChars = (str: string): string => {
    return str.replace(/[\x00-\x1F\x7F]/g, "");
};

export const parseUrl = (rawHost: string, rawPath: string, rawQueryString: string): ParsedUrl | null => {
    const characterName = decodeHostname(rawHost);
    const path = removeAsciiControlChars(fromPathName(rawPath, rawQueryString));

    if (characterName === null) {
        return null;
    }

    const { topic, format, info } = parseExt(path);

    return {
        characterName,
        topic,
        format,
        info,
    };
};
