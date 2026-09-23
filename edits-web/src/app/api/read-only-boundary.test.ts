// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function routeFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? routeFiles(target) : entry.name === "route.ts" ? [target] : [];
  });
}

describe("network read-only boundary", () => {
  it("exports no wardrobe-data mutation handlers", () => {
    const files = routeFiles(path.resolve(process.cwd(), "src/app/api"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      expect(source).not.toMatch(/export\s+(async\s+)?function\s+(POST|PUT|PATCH|DELETE)\b/);
    }
  });

  it("the FastAPI client is hard-coded to GET", () => {
    const source = fs.readFileSync(path.resolve(process.cwd(), "src/lib/data.ts"), "utf8");
    expect(source).toContain('method: "GET"');
    expect(source).not.toMatch(/method:\s*"(POST|PUT|PATCH|DELETE)"/);
  });
});
