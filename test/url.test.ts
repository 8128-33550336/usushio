import assert from "node:assert/strict";
import test from "node:test";

import { decodeHostname, encodeHostname } from "../src/url.js";

const assertHostnameRoundTrip = (characterName: string): string => {
    const encoded = encodeHostname(characterName);

    assert.notEqual(encoded, null);
    assert.equal(decodeHostname(encoded!.encoded), characterName);
    return encoded!.encoded;
};

test("consecutive hyphens round-trip without becoming uppercase markers", () => {
    for (const characterName of ["a--b", "a---b", "a--B---c"]) {
        assertHostnameRoundTrip(characterName);
    }
});

test("a character name beginning with xn-- does not collide with Punycode", () => {
    for (const characterName of ["xn--", "xn--abc", "xn--p8jnt0s"]) {
        const hostname = assertHostnameRoundTrip(characterName);

        assert.notEqual(hostname, `${characterName}.usush.io`);
    }
});

test("dots in a character name do not create nested subdomains", () => {
    for (const characterName of ["sub.example", "sub.sub.example"]) {
        const hostname = assertHostnameRoundTrip(characterName);
        const subdomain = hostname.slice(0, -".usush.io".length);

        assert.doesNotMatch(subdomain, /\./);
        assert.equal(hostname.split(".").length, 3);
    }
});
