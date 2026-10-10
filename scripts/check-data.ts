import assert from "node:assert/strict";
import {
  records,
  selectRows,
  summarize,
  trend,
  spc,
  models,
  filteredActions,
} from "../lib/data.ts";
assert.equal(records.length, 180);
for (const r of records) {
  assert.equal(r.firstPass + r.rework + r.scrap, r.inspected);
  assert.ok(r.rejected <= r.received);
  assert.ok(r.defects.reduce((a, b) => a + b, 0) >= r.rework + r.scrap);
}
for (const period of [7, 14, 30])
  for (const model of ["همه محصولات", ...models])
    for (const shift of ["همه شیفت‌ها", "صبح", "عصر"]) {
      const f = { period, model, shift },
        rows = selectRows(f),
        a = summarize(rows);
      assert.ok(rows.length > 0);
      assert.equal(a.firstPass + a.rework + a.scrap, a.inspected);
      assert.equal(
        trend(rows).reduce((s, r) => s + r.inspected, 0),
        a.inspected,
      );
      assert.equal(
        a.pareto.reduce((s, d) => s + d.value, 0),
        a.totalDefects,
      );
      assert.ok(Math.abs(a.pareto.at(-1)!.cumulative - 100) < 1e-9);
      assert.ok(
        Math.abs(a.cost - a.reworkCost - a.scrapCost - a.inspectionCost) < 1e-8,
      );
      for (const t of filteredActions(f)) {
        assert.ok(t.day > 30 - period);
        assert.ok(model === "همه محصولات" || t.model === model);
        assert.ok(shift === "همه شیفت‌ها" || t.shift === shift);
      }
    }
for (const model of models) {
  const c = spc(model);
  assert.equal(c.rows.length, 30);
  assert.equal(c.signals.length, 1);
  assert.equal(c.signals[0].sample, 25);
  assert.ok(c.lcl < c.center && c.center < c.ucl);
}
console.log(
  "PASS: 180 records, 36 filter combinations, metric reconciliation, Pareto, costs and SPC signals.",
);
