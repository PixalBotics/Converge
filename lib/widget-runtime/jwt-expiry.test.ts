import { describe, expect, it } from "vitest";
import { decodeJwtExpMs } from "./jwt-expiry";

function jwtWithExp(expSec: number) {
  const payload = Buffer.from(JSON.stringify({ exp: expSec })).toString(
    "base64url",
  );
  return `x.${payload}.y`;
}

describe("decodeJwtExpMs", () => {
  it("returns exp in ms when valid", () => {
    const expSec = Math.floor(Date.now() / 1000) + 3600;
    expect(decodeJwtExpMs(jwtWithExp(expSec))).toBe(expSec * 1000);
  });

  it("returns null on malformed token", () => {
    expect(decodeJwtExpMs("")).toBeNull();
    expect(decodeJwtExpMs("a.b")).toBeNull();
    expect(decodeJwtExpMs(undefined)).toBeNull();
    expect(decodeJwtExpMs(null)).toBeNull();
  });
});
