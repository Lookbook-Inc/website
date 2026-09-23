// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { isAllowedUser, isFixtureMode } from "@/lib/env";

const original = { ...process.env };
afterEach(() => {
  process.env = { ...original };
});

describe("rollout boundary", () => {
  it("allows all existing users when enforcement is disabled", () => {
    process.env.EDITS_ENFORCE_ALLOWLIST = "false";
    expect(isAllowedUser("any-user")).toBe(true);
  });

  it("requires an exact UUID match when enforcement is enabled", () => {
    process.env.EDITS_ENFORCE_ALLOWLIST = "true";
    process.env.EDITS_ALLOWED_USER_IDS = "user-a, user-b";
    expect(isAllowedUser("user-a")).toBe(true);
    expect(isAllowedUser("user-c")).toBe(false);
  });

  it("never enables fixtures in production", () => {
    process.env.EDITS_DATA_MODE = "fixture";
    process.env.VERCEL_ENV = "production";
    expect(isFixtureMode()).toBe(false);
  });
});
