import assert from "node:assert/strict";
import test from "node:test";

import { createAppResponse } from "../src/app.js";
import { decodeHostname, encodeHostname } from "../src/url.js";

const requestJson = async (characterName: string, topic: string) => {
    const host = encodeHostname(characterName);
    assert.notEqual(host, null);

    const response = await createAppResponse(
        host!.encoded,
        `/${encodeURI(topic)}.json`,
        "",
    );

    assert.equal(response.statusCode, 200);
    assert.equal(response.contentType, "application/json; charset=UTF-8");
    return JSON.parse(response.body.toString());
};

test("default URL returns the original message as HTML", async () => {
    const response = await createAppResponse("usush.io", "/", "");

    assert.equal(response.statusCode, 200);
    assert.equal(response.contentType, "text/html; charset=UTF-8");
    assert.match(response.body.toString(), /わぁいうすしお あかりうすしお大好き/);
});

test("hostname and path generate JSON", async () => {
    const response = await createAppResponse("xn--p8jnt0s.usush.io", "/ラムレーズン.json", "");

    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body.toString()), {
        name: "きょうこ",
        topic: "ラムレーズン",
        message: "わぁいラムレーズン きょうこラムレーズン大好き",
    });
});

for (const [description, characterName] of [
    ["uppercase and lowercase ASCII letters", "aAzZ"],
    ["ASCII symbols", "./-=?"],
    ["supplementary-plane emoji", "🍣🍻"],
    ["HTML special characters", "<&>\"'"],
    ["JSON special characters", "\\\"/"],
    ["a rare supplementary-plane kanji", "𰻞𰻞麺"],
] as const) {
    test(`hostname preserves ${description}`, () => {
        const encoded = encodeHostname(characterName);

        assert.notEqual(encoded, null);
        assert.equal(decodeHostname(encoded!.encoded), characterName);
    });
}

test("uppercase and lowercase letters remain distinct", async () => {
    assert.deepEqual(await requestJson("aAzZ", "AaZz"), {
        name: "aAzZ",
        topic: "AaZz",
        message: "わぁいAaZz aAzZAaZz大好き",
    });
});

test("ASCII URL symbols ./-=? survive percent-encoded paths", async () => {
    const value = "./-=?";
    const host = encodeHostname(value);
    assert.notEqual(host, null);
    const response = await createAppResponse(host!.encoded, "/./-=", ".json");

    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body.toString()), {
        name: value,
        topic: value,
        message: `わぁい${value} ${value}${value}大好き`,
    });
});

test("supplementary-plane emoji survive hostname and path decoding", async () => {
    assert.deepEqual(await requestJson("🍣🍻", "🍣🍻"), {
        name: "🍣🍻",
        topic: "🍣🍻",
        message: "わぁい🍣🍻 🍣🍻🍣🍻大好き",
    });
});

test("HTML special characters are escaped in generated markup", async () => {
    const topic = "<&>\"'";
    const response = await createAppResponse("usush.io", `/${encodeURI(topic)}.html`, "");
    const body = response.body.toString();

    assert.equal(response.statusCode, 200);
    assert.equal(response.contentType, "text/html; charset=UTF-8");
    assert.match(body, /わぁい&lt;&amp;&gt;&quot;&#39;/);
    assert.doesNotMatch(body, /わぁい<&>"'/);
});

test("JSON special characters are serialized without data loss", async () => {
    const topic = String.raw`quote=" slash=\\ solidus=/`;

    assert.deepEqual(await requestJson(String.raw`name="\\`, topic), {
        name: String.raw`name="\\`,
        topic,
        message: `わぁい${topic} ${String.raw`name="\\`}${topic}大好き`,
    });
});

test("rare supplementary-plane kanji survive hostname and path decoding", async () => {
    assert.deepEqual(await requestJson("𰻞𰻞麺", "𰻞𰻞麺"), {
        name: "𰻞𰻞麺",
        topic: "𰻞𰻞麺",
        message: "わぁい𰻞𰻞麺 𰻞𰻞麺𰻞𰻞麺大好き",
    });
});

test("unsupported extensions return 404", async () => {
    const response = await createAppResponse("usush.io", "/topic.xml", "");
    assert.equal(response.statusCode, 404);
});

test("WebP extension returns a WebP image", async () => {
    const response = await createAppResponse("usush.io", "/topic.webp", "size=30x30");

    assert.equal(response.statusCode, 200);
    assert.equal(response.contentType, "image/webp");
    assert.equal(response.body.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(response.body.subarray(8, 12).toString("ascii"), "WEBP");
});

for (const extension of ["jpg", "jpeg"]) {
    test(`.${extension} extension returns a JPEG image`, async () => {
        const response = await createAppResponse("usush.io", `/topic.${extension}`, "size=30x30");

        assert.equal(response.statusCode, 200);
        assert.equal(response.contentType, "image/jpeg");
        assert.deepEqual(response.body.subarray(0, 3), Buffer.from([0xff, 0xd8, 0xff]));
    });
}
