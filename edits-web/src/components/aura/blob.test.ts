import { describe, expect, it } from "vitest";
import { blobPath } from "./blob";

describe("blobPath", () => {
  it("is stable for the same pieces, so server and client agree", () => {
    expect(blobPath("a,b,c")).toBe(blobPath("a,b,c"));
  });

  it("re-forms when the pieces change", () => {
    expect(blobPath("a,b,c")).not.toBe(blobPath("a,b,d"));
  });

  it("keeps the same command structure so CSS can tween between shapes", () => {
    const commands = (d: string) => d.replace(/[^MCZ]/g, "");
    expect(commands(blobPath(""))).toBe(commands(blobPath("z,y,x")));
  });
});
