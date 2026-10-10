// All names, records, limits and targets below are fictional demonstration data.
export const models = ["شاهین", "کوییک", "ساینا"];
export const lines = ["خط مونتاژ ۱", "خط مونتاژ ۲", "خط مونتاژ ۳"];
export const categories = [
  "رنگ و بدنه",
  "مونتاژ قطعات",
  "برق و الکترونیک",
  "آب‌بندی",
  "صدا و لرزش",
  "سایر",
];
export const colors = [
  "#f97335",
  "#6366f1",
  "#08b6a8",
  "#3b82f6",
  "#f3b63f",
  "#b4bfd1",
];
export type RecordRow = {
  day: number;
  model: string;
  line: string;
  shift: string;
  inspected: number;
  firstPass: number;
  rework: number;
  scrap: number;
  defects: number[];
  received: number;
  rejected: number;
  supplier: string;
  reworkCost: number;
  scrapCost: number;
  inspectionCost: number;
};
export const records: RecordRow[] = [];
for (let day = 1; day <= 30; day++)
  for (let m = 0; m < 3; m++)
    for (let s = 0; s < 2; s++) {
      const inspected = 145 + ((day * 17 + m * 29 + s * 13) % 85);
      const rate =
        0.035 +
        m * 0.008 +
        s * 0.006 +
        (day < 16 ? 0.015 : 0) +
        (day === 21 && m === 1 ? 0.07 : 0);
      const failed = Math.round(inspected * rate),
        scrap = 1 + ((day + m + s) % 3),
        rework = failed - scrap;
      const counts = categories.map((_, c) =>
        Math.max(
          1,
          Math.round(failed * [0.37, 0.25, 0.16, 0.1, 0.08, 0.04][c]),
        ),
      );
      // Defect events can exceed failed vehicles because one vehicle can have several defects.
      counts[0] += (day + m) % 3;
      const received = inspected * 4 + ((day * 23) % 90),
        rejected = Math.round(
          received * (0.006 + m * 0.004 + (day % 7 === 0 ? 0.006 : 0)),
        );
      records.push({
        day,
        model: models[m],
        line: lines[m],
        shift: s === 0 ? "صبح" : "عصر",
        inspected,
        firstPass: inspected - failed,
        rework,
        scrap,
        defects: counts,
        received,
        rejected,
        supplier: ["تأمین‌کننده آلفا", "تأمین‌کننده بتا", "تأمین‌کننده گاما"][
          m
        ],
        reworkCost: rework * (0.85 + m * 0.13),
        scrapCost: scrap * (8.5 + m * 1.7),
        inspectionCost: inspected * 0.035,
      });
    }
export type Filters = { period: number; model: string; shift: string };
export const number = (v: number, d = 0) =>
  new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  }).format(v);
export function selectRows(f: Filters) {
  return records.filter(
    (r) =>
      r.day > 30 - f.period &&
      (f.model === "همه محصولات" || r.model === f.model) &&
      (f.shift === "همه شیفت‌ها" || r.shift === f.shift),
  );
}
export function summarize(rows: RecordRow[]) {
  const sum = (
    key:
      | "inspected"
      | "firstPass"
      | "rework"
      | "scrap"
      | "received"
      | "rejected"
      | "reworkCost"
      | "scrapCost"
      | "inspectionCost",
  ) => rows.reduce((s, r) => s + r[key], 0);
  const inspected = sum("inspected"),
    firstPass = sum("firstPass"),
    rework = sum("rework"),
    scrap = sum("scrap"),
    received = sum("received"),
    rejected = sum("rejected");
  const defects = categories
    .map((name, i) => ({
      name,
      value: rows.reduce((s, r) => s + r.defects[i], 0),
      color: colors[i],
    }))
    .sort((a, b) => b.value - a.value);
  let cumulative = 0;
  const totalDefects = defects.reduce((s, d) => s + d.value, 0);
  const pareto = defects.map((d) => ({
    ...d,
    cumulative: totalDefects
      ? ((cumulative += d.value) / totalDefects) * 100
      : 0,
  }));
  return {
    inspected,
    firstPass,
    rework,
    scrap,
    received,
    rejected,
    defects,
    pareto,
    totalDefects,
    fpy: inspected ? (100 * firstPass) / inspected : 0,
    ppm: received ? (1e6 * rejected) / received : 0,
    reworkRate: inspected ? (100 * rework) / inspected : 0,
    scrapRate: inspected ? (100 * scrap) / inspected : 0,
    cost: sum("reworkCost") + sum("scrapCost") + sum("inspectionCost"),
    reworkCost: sum("reworkCost"),
    scrapCost: sum("scrapCost"),
    inspectionCost: sum("inspectionCost"),
  };
}
export function trend(rows: RecordRow[]) {
  return [...new Set(rows.map((r) => r.day))].map((day) => {
    const a = summarize(rows.filter((r) => r.day === day));
    return {
      day: number(day) + " مهر",
      fpy: +a.fpy.toFixed(2),
      rework: a.rework,
      scrap: a.scrap,
      cost: +a.cost.toFixed(1),
      defects: a.totalDefects,
      inspected: a.inspected,
    };
  });
}
export const actions = [
  {
    id: "QC-104",
    day: 21,
    model: "کوییک",
    shift: "صبح",
    line: lines[1],
    title: "بررسی افزایش عیب رنگ در خط ۲",
    owner: "مهندسی رنگ",
    status: "در حال اجرا",
    progress: 65,
    priority: "بالا",
    due: "۲ آبان",
    cause: "فرضیه: نوسان فشار پاشش؛ نیازمند بررسی",
    next: "کالیبراسیون و نمونه‌برداری مجدد",
  },
  {
    id: "QC-108",
    day: 25,
    model: "شاهین",
    shift: "عصر",
    line: lines[0],
    title: "اصلاح گشتاور اتصال در ایستگاه ۱۲",
    owner: "مهندسی تولید",
    status: "باز",
    progress: 20,
    priority: "بالا",
    due: "۱ آبان",
    cause: "فرضیه: تنظیم ابزار؛ علت هنوز تأیید نشده",
    next: "کنترل ابزار و بررسی قطعات متأثر",
  },
  {
    id: "QC-102",
    day: 18,
    model: "ساینا",
    shift: "صبح",
    line: lines[2],
    title: "بهبود آب‌بندی درب عقب",
    owner: "کنترل کیفیت",
    status: "در حال اجرا",
    progress: 80,
    priority: "متوسط",
    due: "۴ آبان",
    cause: "فرضیه: تغییر مشخصات نوار آب‌بندی",
    next: "مقایسه آزمون نشتی پیش و پس از اصلاح",
  },
  {
    id: "QC-099",
    day: 9,
    model: "شاهین",
    shift: "صبح",
    line: lines[0],
    title: "بازنگری چک‌لیست اتصالات برقی",
    owner: "تضمین کیفیت",
    status: "بسته",
    progress: 100,
    priority: "متوسط",
    due: "۲۲ مهر",
    cause: "اصلاح چک‌لیست و آموزش اپراتور",
    next: "پایش اثربخشی در دوره بعد",
  },
];
export function filteredActions(f: Filters) {
  return actions.filter(
    (a) =>
      a.day > 30 - f.period &&
      (f.model === "همه محصولات" || a.model === f.model) &&
      (f.shift === "همه شیفت‌ها" || a.shift === f.shift),
  );
}
// I-MR demonstration: individual torque samples, no artificial limits guessed from specifications.
export function spc(model: string) {
  const offset = Math.max(0, models.indexOf(model)) * 0.18;
  const baseline = Array.from(
    { length: 20 },
    (_, i) => 48 + offset + Math.sin(i * 1.7) * 0.7 + Math.cos(i * 0.8) * 0.3,
  );
  const center = baseline.reduce((a, b) => a + b, 0) / baseline.length;
  const mr =
    baseline.slice(1).reduce((a, v, i) => a + Math.abs(v - baseline[i]), 0) /
    (baseline.length - 1);
  const ucl = center + 2.66 * mr,
    lcl = center - 2.66 * mr;
  const values = [
    ...baseline,
    ...Array.from(
      { length: 10 },
      (_, i) =>
        48 + offset + Math.sin((i + 20) * 1.7) * 0.7 + (i === 4 ? 3.4 : 0),
    ),
  ];
  return {
    center,
    ucl,
    lcl,
    rows: values.map((value, i) => ({
      sample: i + 1,
      label: number(i + 1),
      value: +value.toFixed(2),
      ucl: +ucl.toFixed(2),
      lcl: +lcl.toFixed(2),
      center: +center.toFixed(2),
    })),
    signals: values
      .map((value, i) => ({ value, sample: i + 1 }))
      .filter((r) => r.value > ucl || r.value < lcl),
  };
}
