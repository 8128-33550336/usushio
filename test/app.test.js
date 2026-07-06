import assert from "node:assert/strict";
import test from "node:test";

import { createAppResponse } from "../src/app.js";

test("default URL returns the original message as HTML", async () => {
    const response = await createAppResponse("usush.io", "/", "");

    assert.equal(response.statusCode, 200);
    assert.equal(response.contentType, "text/html; charset=UTF-8");
    assert.match(response.body.toString(), /わぁいうすしお あかりうすしお大好き/);
});

test("hostname and path generate JSON", async () => {
    const response = await createAppResponse("xn--p8jnt0s.usush.io", "/ラムレーズン.json", "");

    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), {
        name: "きょうこ",
        topic: "ラムレーズン",
        message: "わぁいラムレーズン きょうこラムレーズン大好き",
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
