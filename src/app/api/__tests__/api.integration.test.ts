import { describe, it, expect } from "vitest";

describe.skip("API route skeletons", () => {
  it("GET /api/evidence returns placeholder data", async () => {
    const res = await fetch("http://localhost:3000/api/evidence");
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("items");
    expect(Array.isArray(json.items)).toBe(true);
  });

  it("GET /api/requests returns placeholder data", async () => {
    const res = await fetch("http://localhost:3000/api/requests");
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("items");
    expect(Array.isArray(json.items)).toBe(true);
  });
});
