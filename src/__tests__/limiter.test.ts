import { describe, it, expect, beforeEach } from "vitest";
import { TokenBucketRateLimiter } from "../limiter.js";

describe("TokenBucketRateLimiter", () => {
    let limiter: TokenBucketRateLimiter;

    beforeEach(() => {
        limiter = new TokenBucketRateLimiter({
            capacity: 3,
            refillRate: 1,
        });
    });

    it("permits requests within capacity", () => {
        const first = limiter.allowRequest("client-a");
        const second = limiter.allowRequest("client-a");

        expect(first.allowed).toBe(true);
        expect(first.remaining).toBe(2);
        expect(second.allowed).toBe(true);
        expect(second.remaining).toBe(1);
    });

    it("blocks requests once bucket is exhausted", () => {
        limiter.allowRequest("client-b");
        limiter.allowRequest("client-b");
        limiter.allowRequest("client-b");

        const blocked = limiter.allowRequest("client-b");
        expect(blocked.allowed).toBe(false);
        expect(blocked.remaining).toBe(0);
    });

    it("isolates client keys independently", () => {
        limiter.allowRequest("client-x");
        limiter.allowRequest("client-x");
        limiter.allowRequest("client-x");

        expect(limiter.allowRequest("client-x").allowed).toBe(false);
        expect(limiter.allowRequest("client-y").allowed).toBe(true);
    });
});