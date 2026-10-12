import { test } from "node:test";
import assert from "node:assert/strict";
import { projects, findProject } from "../src/projects";
import { DomainError, cash, type Entry } from "../src/contracts";
import { splitCents, balances, settlements } from "../src/settlements";
const now = new Date("2026-10-12T12:00:00Z");
const p = (id: string) => findProject(id)!;
const rejects = (fn: () => unknown, code: string) =>
  assert.throws(
    fn,
    (e: unknown) => e instanceof DomainError && e.code === code,
  );
for (const project of projects) {
  test(`${project.name}: samples yield finite, renderable metrics and recognized states`, () => {
    const entries = project.seed(now).map((data, i) => ({
      id: String(i),
      version: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      data,
    }));
    assert.ok(entries.length);
    assert.equal(project.metrics(entries, now).length, 3);
    for (const e of entries) {
      assert.ok(project.title(e.data));
      assert.ok(project.statuses[project.status(e.data, now)]);
    }
    for (const m of project.metrics(entries, now)) {
      assert.ok(m.label.ar && m.label.en);
      assert.ok(typeof m.value === "string" || Number.isFinite(m.value));
    }
  });
}
test("QueueWise only permits the waiting → serving → completed lifecycle", () => {
  const project = p("queuewise");
  let d = project.seed(now)[0];
  rejects(() => project.act(d, "complete", {}, now), "invalid_transition");
  d = project.act(d, "call", {}, now);
  d = project.act(d, "complete", {}, now);
  assert.equal(d.status, "completed");
  rejects(() => project.act(d, "call", {}, now), "invalid_transition");
});
test("Currency display preserves cents above Number safe integer range", () => {
  assert.equal(cash(200000000000000001n), "EGP 2,000,000,000,000,000.01");
  assert.equal(cash(-1n), "-EGP 0.01");
});
