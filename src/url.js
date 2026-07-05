import punycode from "punycode";

const checkValidHostname = (hostname) => {
    return hostname.match(/^([-a-z0-9]+)\.usush\.io$/) !== null;
};

const isCharRange = (char, start, end) => {
    const codePoint = char.codePointAt(0);
    return codePoint >= start.codePointAt(0) && codePoint <= end.codePointAt(0);
};

const allowedSymbols = " !\"#$%&'()*+,./:;<=>?@[\\]^_`{|}~"; // without hyphen

const encodeAscii = (host) => {
    let output = "";
    for (const char of host) {
        if (isCharRange(char, "a", "z") || isCharRange(char, "0", "9")) {
            output += char;
        } else if (isCharRange(char, "A", "Z")) {
            output += "-" + String.fromCodePoint(char.codePointAt(0) + 0x20);
        } else if (char === "-") {
            output += "--";
        } else if (isCharRange(char, "\x00", "\x7f")) {
            if (!allowedSymbols.includes(char)) {
                return null;
            }
            const code = char.codePointAt(0);
            output += "-" + code.toString(16).padStart(2, "0");
        } else {
            output += char;
        }
    }
    return output;
};

export const encodeHostname = (characterName) => {
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

const decodeAscii = (host) => {
    let output = "";
    let isBeforeHyphen = false;
    let beforeCodeFirst = null;
    for (const char of host) {
        if (isBeforeHyphen) {
            if (char === "-") {
                output += "-";
            } else if (isCharRange(char, "a", "z")) {
                output += String.fromCodePoint(char.codePointAt(0) - 0x20);
            } else if (isCharRange(char, "0", "7")) {
                beforeCodeFirst = char;
            } else {
                return null;
            }
            isBeforeHyphen = false;
        } else {
            if (beforeCodeFirst !== null) {
                if (isCharRange(char, "0", "9")) {
                    const calcChar = String.fromCodePoint((beforeCodeFirst.codePointAt(0) - 0x30) * 16 + (char.codePointAt(0) - 0x30));
                    if (!allowedSymbols.includes(calcChar)) {
                        return null;
                    }
                    output += calcChar;
                } else if (isCharRange(char, "a", "f")) {
                    const calcChar = String.fromCodePoint((beforeCodeFirst.codePointAt(0) - 0x30) * 16 + (char.codePointAt(0) - 0x61 + 0xa));
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

export const decodeHostname = (host) => {
    const subDomain = host.match(/^([-a-z0-9\.]+)\.usush\.io$/)?.[1] ?? "xn--l8js3q"; // あかり
    const characterName = decodeAscii(punycode.toUnicode(subDomain));
    return characterName;
};

const toPathName = (topic) => {
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

export const fromPathName = (rawPath, rawQueryString) => {
    const orig = (rawPath + (rawQueryString ? "?" + rawQueryString : "")).slice(1);
    try {
        return decodeURI(orig);
    } catch {
        return orig;
    }
};

const getExt = (path, format, info) => {
    if (!path.includes(".") && format === "html" && info == "" && !path.endsWith("?")) {
        return "";
    }
    return info === "" ? `.${format}` : `.${format}?${info}`;
};

export const genUrl = (characterName, topic, format, info) => {
    const host = encodeHostname(characterName);
    const path = toPathName(topic);
    const ext = getExt(path.encoded, format, info);

    if (host === null || path === null) {
        return null;
    }

    return {
        encoded: `https://${host.encoded}/${path.encoded}${ext}`,
        raw: `https://${host.raw}/${path.raw}${ext}`,
    };
};

const parseExt = (path) => {
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

const removeAsciiControlChars = (str) => {
    return str.replace(/[\x00-\x1F\x7F]/g, "");
};

export const parseUrl = (rawHost, rawPath, rawQueryString) => {
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
