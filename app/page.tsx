"use client";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpLeft,
  BarChart3,
  Check,
  ChevronLeft,
  CircleHelp,
  ClipboardCheck,
  Download,
  Factory,
  FileText,
  Gauge,
  LayoutDashboard,
  Menu,
  PackageCheck,
  Settings2,
  ShieldCheck,
  Target,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  actions,
  categories,
  colors,
  filteredActions,
  Filters,
  lines,
  models,
  number,
  RecordRow,
  selectRows,
  spc,
  summarize,
  trend,
} from "@/lib/data";

const nav = [
  { id: "overview", name: "نمای مدیریتی", icon: LayoutDashboard },
  { id: "defects", name: "تحلیل عیوب", icon: BarChart3 },
  { id: "lines", name: "کیفیت خطوط تولید", icon: Factory },
  { id: "suppliers", name: "کیفیت تأمین‌کنندگان", icon: Truck },
  { id: "cost", name: "هزینه کیفیت", icon: Wallet },
  { id: "spc", name: "کنترل آماری فرایند", icon: Activity },
  { id: "actions", name: "اقدامات اصلاحی", icon: ClipboardCheck },
  { id: "proposal", name: "پروپوزال و تعاریف", icon: FileText },
];
const descriptions: Record<string, string> = {
  overview: "از وضعیت کیفیت تا اولویت اقدام؛ در یک نگاه",
  defects: "کدام عیوب بیشترین سهم را در عدم انطباق دارند؟",
  lines: "مقایسه کیفیت محصول و عملکرد خطوط تولید",
  suppliers: "مقایسه نرخ عدم انطباق قطعات ورودی",
  cost: "ردیابی هزینه بازرسی، دوباره‌کاری و ضایعات",
  spc: "تشخیص تغییرات غیرعادی گشتاور در یک ایستگاه",
  actions: "از شناسایی مسئله تا پیگیری اثربخشی اصلاح",
  proposal: "مسیر پیشنهادی استقرار BI و زبان مشترک شاخص‌ها",
};
const chartStyle = { fontFamily: "Vazirmatn", fontSize: 11 };
function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly {
    name?: string | number;
    value?: string | number;
    color?: string;
  }[];
  label?: string | number;
}) {
  return active && payload?.length ? (
    <div className="chart-tip">
      <b>{label}</b>
      {payload.map((p, i) => (
        <div key={i}>
          <i style={{ background: p.color }} />
          {p.name}:{" "}
          <strong>
            {typeof p.value === "number" ? number(p.value, 1) : p.value}
          </strong>
        </div>
      ))}
    </div>
  ) : null;
}
function Card({
  title,
  sub,
  children,
  action,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Metric({
  label,
  value,
  unit,
  icon: Icon,
  color,
  detail,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: typeof Gauge;
  color: string;
  detail: string;
}) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span>{label}</span>
        <div
          className="metric-icon"
          style={{ color, background: color + "12" }}
        >
          <Icon size={19} />
        </div>
      </div>
      <div className="metric-value">
        {value}
        <small>{unit}</small>
      </div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}
function TrendChart({
  rows,
  type = "fpy",
}: {
  rows: RecordRow[];
  type?: "fpy" | "cost";
}) {
  return (
    <div className="chart" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={trend(rows)}
          margin={{ top: 15, right: 16, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={"gradient-" + type} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={type === "fpy" ? "#08b6a8" : "#6366f1"}
                stopOpacity={0.22}
              />
              <stop
                offset="100%"
                stopColor={type === "fpy" ? "#08b6a8" : "#6366f1"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 5"
            vertical={false}
            stroke="#edf0f4"
          />
          <XAxis
            dataKey="day"
            tick={chartStyle}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
            dy={10}
          />
          <YAxis
            tick={chartStyle}
            axisLine={false}
            tickLine={false}
            width={42}
            domain={type === "fpy" ? [80, 100] : [0, "auto"]}
            tickFormatter={(v) => number(v) + (type === "fpy" ? "٪" : "")}
          />
          <Tooltip content={<ChartTip />} />
          {type === "fpy" && (
            <ReferenceLine
              y={95}
              stroke="#f5ad44"
              strokeDasharray="5 5"
              label={{
                value: "هدف ۹۵٪",
                position: "insideTopRight",
                fill: "#ab7a26",
                fontSize: 10,
                fontFamily: "Vazirmatn",
              }}
            />
          )}
          <Area
            isAnimationActive={false}
            name={type === "fpy" ? "قبولی بار اول ٪" : "هزینه میلیون تومان"}
            type="monotone"
            dataKey={type}
            stroke={type === "fpy" ? "#08b6a8" : "#6366f1"}
            strokeWidth={3}
            fill={"url(#gradient-" + type + ")"}
            activeDot={{ r: 5, strokeWidth: 3, stroke: "white" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function Pareto({
  rows,
  onSelect,
}: {
  rows: RecordRow[];
  onSelect?: (name: string) => void;
}) {
  const a = summarize(rows);
  return (
    <div className="chart" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={a.pareto}
          margin={{ top: 10, right: 0, left: 0, bottom: 22 }}
        >
          <CartesianGrid
            strokeDasharray="3 5"
            vertical={false}
            stroke="#edf0f4"
          />
          <XAxis
            dataKey="name"
            tick={{ ...chartStyle, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-16}
            textAnchor="end"
          />
          <YAxis
            yAxisId="count"
            tick={chartStyle}
            width={36}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => number(v)}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            domain={[0, 100]}
            tick={chartStyle}
            width={38}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => number(v) + "٪"}
          />
          <Tooltip content={<ChartTip />} />
          <Bar
            isAnimationActive={false}
            yAxisId="count"
            dataKey="value"
            name="تعداد رخداد عیب"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
            onClick={(d) => {
              if (onSelect && typeof d.name === "string") onSelect(d.name);
            }}
            cursor={onSelect ? "pointer" : "default"}
          >
            {a.pareto.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Bar>
          <Line
            isAnimationActive={false}
            yAxisId="pct"
            dataKey="cumulative"
            name="سهم تجمعی ٪"
            type="monotone"
            stroke="#172b4d"
            strokeWidth={2}
            dot={{ r: 3, fill: "#fff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
function Badge({ text }: { text: string }) {
  return (
    <span
      className={
        "badge " +
        (text === "بسته" || text === "مطلوب"
          ? "good"
          : text === "بالا" || text === "نیازمند بررسی" || text === "باز"
            ? "warn"
            : "neutral")
      }
    >
      {text}
    </span>
  );
}
function exportCsv(rows: RecordRow[]) {
  const headers = [
    "روز مهر",
    "محصول",
    "خط",
    "شیفت",
    "بازرسی شده",
    "قبولی بار اول",
    "دوباره کاری",
    "ضایعات",
    "قطعات ورودی",
    "قطعات نامنطبق",
    "هزینه میلیون تومان",
    ...categories,
  ];
  const data = rows.map((r) => [
    r.day,
    r.model,
    r.line,
    r.shift,
    r.inspected,
    r.firstPass,
    r.rework,
    r.scrap,
    r.received,
    r.rejected,
    (r.reworkCost + r.scrapCost + r.inspectionCost).toFixed(2),
    ...r.defects,
  ]);
  const csv =
    "\uFEFF" +
    [headers, ...data]
      .map((r) =>
        r.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const el = document.createElement("a");
  el.href = url;
  el.download = "saipa-qc-demo.csv";
  el.click();
  URL.revokeObjectURL(url);
}

function exportSpcCsv(model: string) {
  const c = spc(model);
  const csv =
    "\uFEFF" +
    [
      ["محصول", "شماره نمونه", "گشتاور نیوتن متر", "CL", "UCL", "LCL"],
      ...c.rows.map((r) => [model, r.sample, r.value, r.center, r.ucl, r.lcl]),
    ]
      .map((r) => r.join(","))
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "saipa-qc-spc-demo.csv";
  link.click();
  URL.revokeObjectURL(url);
}
export default function Dashboard() {
  const [page, setPage] = useState("overview"),
    [menu, setMenu] = useState(false),
    [f, setF] = useState<Filters>({
      period: 30,
      model: "همه محصولات",
      shift: "همه شیفت‌ها",
    }),
    [selected, setSelected] = useState<string | null>(null),
    [action, setAction] = useState<(typeof actions)[number] | null>(null),
    [spcModel, setSpcModel] = useState(models[0]);
  const rows = selectRows(f),
    a = summarize(rows),
    tasks = filteredActions(f),
    active = nav.find((n) => n.id === page)!,
    top = a.pareto[0];
  const lineStats = lines
    .map((line, i) => ({
      line,
      model: models[i],
      ...summarize(rows.filter((r) => r.line === line)),
    }))
    .filter((r) => r.inspected);
  const supplierStats = [...new Set(rows.map((r) => r.supplier))].map(
    (name) => ({ name, ...summarize(rows.filter((r) => r.supplier === name)) }),
  );
  const control = spc(spcModel);
  useEffect(() => {
    if (!action) return;
    const previous = document.activeElement as HTMLElement | null;
    const close = document.querySelector<HTMLButtonElement>(".modal-close");
    close?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAction(null);
      if (event.key === "Tab") {
        event.preventDefault();
        close?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [action]);
  const go = (id: string) => {
    setPage(id);
    setMenu(false);
  };
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="scrim"
          aria-label="بستن منو"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={26} />
          </div>
          <div>
            <strong>
              سایپا<span> کیفیت</span>
            </strong>
            <small>QUALITY INTELLIGENCE</small>
          </div>
        </div>
        <div className="workspace">
          <span className="orange-dot" />
          مرکز پایش کیفیت<span className="workspace-tag">DEMO</span>
        </div>
        <div className="nav-label">فضای کاری</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={page === n.id ? "active" : ""}
            >
              <n.icon size={19} />
              <span>{n.name}</span>
              {page === n.id && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sample-note">
            <div>
              <Activity size={18} />
              <b>نسخه نمایشی جلسه</b>
            </div>
            <p>
              داده‌های ساختگی مهر ۱۴۰۵
              <br />
              بدون اتصال به سامانه‌های سایپا
            </p>
          </div>
          <div className="profile">
            <div className="avatar">QC</div>
            <div>
              <b>مدیریت کنترل کیفیت</b>
              <small>نمای آزمایشی مدیر</small>
            </div>
            <ShieldCheck size={17} />
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              onClick={() => setMenu(!menu)}
              aria-label="نمایش منو"
            >
              <Menu size={21} />
            </button>
            <span>هوش تجاری</span>
            <ChevronLeft size={14} />
            <b>{active.name}</b>
          </div>
          <div className="topbar-end">
            <span className="demo-pill">داده آزمایشی</span>
            <span className="date">۳۰ مهر ۱۴۰۵ • پایان دوره نمونه</span>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">SAIPA / QUALITY CONTROL</div>
              <h1>{active.name}</h1>
              <p>{descriptions[page]}</p>
            </div>
            <div className="heading-actions">
              <button className="btn" onClick={() => go("proposal")}>
                <FileText size={16} />
                پروپوزال جلسه
              </button>
              <button
                className="btn primary"
                onClick={() =>
                  page === "spc" ? exportSpcCsv(spcModel) : exportCsv(rows)
                }
              >
                <Download size={16} />
                خروجی داده
              </button>
            </div>
          </div>
          {page !== "proposal" && page !== "spc" && (
            <div className="filters">
              <div className="filter-title">
                <Settings2 size={18} />
                <b>محدوده تحلیل</b>
              </div>
              <label>
                بازه زمانی
                <select
                  aria-label="بازه زمانی"
                  value={f.period}
                  onChange={(e) => setF({ ...f, period: +e.target.value })}
                >
                  <option value={30}>۳۰ روز مهر ۱۴۰۵</option>
                  <option value={14}>۱۴ روز پایانی مهر</option>
                  <option value={7}>۷ روز پایانی مهر</option>
                </select>
              </label>
              <label>
                محصول
                <select
                  aria-label="محصول"
                  value={f.model}
                  onChange={(e) => setF({ ...f, model: e.target.value })}
                >
                  {["همه محصولات", ...models].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label>
                شیفت
                <select
                  aria-label="شیفت"
                  value={f.shift}
                  onChange={(e) => setF({ ...f, shift: e.target.value })}
                >
                  {["همه شیفت‌ها", "صبح", "عصر"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button
                className="reset"
                onClick={() =>
                  setF({
                    period: 30,
                    model: "همه محصولات",
                    shift: "همه شیفت‌ها",
                  })
                }
              >
                بازنشانی
              </button>
              <span className="record-count">
                {number(rows.length)} رکورد تجمیعی
              </span>
            </div>
          )}

          {page === "overview" && (
            <>
              <div className="insight">
                <div className="insight-icon">
                  <Target size={24} />
                </div>
                <div>
                  <b>اولویت این دوره: کاهش عیوب {top.name}</b>
                  <p>
                    {number((top.value / a.totalDefects) * 100, 1)}٪ از رخدادهای
                    عیب به این گروه مربوط است. بررسی در سطح خط و شیفت، نقطه شروع
                    اقدام اصلاحی است.
                  </p>
                </div>
                <button onClick={() => go("defects")}>
                  بررسی عیوب
                  <ArrowUpLeft size={18} />
                </button>
              </div>
              <div className="metrics">
                <Metric
                  label="قبولی بار اول"
                  value={number(a.fpy, 1)}
                  unit="٪"
                  icon={ShieldCheck}
                  color="#08a995"
                  detail={"FPY • هدف نمایشی: ۹۵٪"}
                />
                <Metric
                  label="خودروهای بازرسی‌شده"
                  value={number(a.inspected)}
                  unit="دستگاه"
                  icon={Factory}
                  color="#6366f1"
                  detail={number(a.firstPass) + " دستگاه قبول در بار اول"}
                />
                <Metric
                  label="نرخ دوباره‌کاری"
                  value={number(a.reworkRate, 1)}
                  unit="٪"
                  icon={Gauge}
                  color="#f97335"
                  detail={number(a.rework) + " دستگاه نیازمند اصلاح"}
                />
                <Metric
                  label="هزینه کیفیت ثبت‌شده"
                  value={number(a.cost / 1000, 2)}
                  unit="میلیارد تومان"
                  icon={Wallet}
                  color="#3b82f6"
                  detail="بازرسی + دوباره‌کاری + ضایعات"
                />
              </div>
              <div className="grid two-one">
                <Card
                  title="روند قبولی بار اول"
                  sub="درصد خودروهای قبول بدون دوباره‌کاری در بازرسی اول"
                  action={
                    <span className="legend">
                      <i />
                      قبولی بار اول
                    </span>
                  }
                >
                  <TrendChart rows={rows} />
                </Card>
                <Card title="نتیجه بازرسی اول" sub="تقسیم خودروهای بازرسی‌شده">
                  <div className="donut">
                    <div dir="ltr" className="donut-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            isAnimationActive={false}
                            data={[
                              { name: "قبول بار اول", value: a.firstPass },
                              { name: "دوباره‌کاری", value: a.rework },
                              { name: "ضایعات", value: a.scrap },
                            ]}
                            innerRadius={72}
                            outerRadius={92}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {["#08b6a8", "#f97335", "#6366f1"].map((c) => (
                              <Cell key={c} fill={c} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="donut-center">
                      <strong>
                        {number(a.fpy, 1)}
                        <small>٪</small>
                      </strong>
                      <span>قبولی بار اول</span>
                    </div>
                  </div>
                  <div className="donut-legend">
                    {[
                      { name: "قبول بار اول", value: a.firstPass },
                      { name: "دوباره‌کاری", value: a.rework },
                      { name: "ضایعات", value: a.scrap },
                    ].map((r, i) => (
                      <div key={r.name}>
                        <span>
                          <i
                            style={{
                              background: ["#08b6a8", "#f97335", "#6366f1"][i],
                            }}
                          />
                          {r.name}
                        </span>
                        <b>{number(r.value)}</b>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="grid half">
                <Card
                  title="پارتوی عیوب"
                  sub="تعداد رخداد عیب و سهم تجمعی؛ هر خودرو می‌تواند چند عیب داشته باشد"
                  action={
                    <button
                      className="text-button"
                      onClick={() => go("defects")}
                    >
                      جزئیات
                      <ChevronLeft size={14} />
                    </button>
                  }
                >
                  <Pareto
                    rows={rows}
                    onSelect={(n) => {
                      setSelected(n);
                      go("defects");
                    }}
                  />
                </Card>
                <Card
                  title="کیفیت خطوط در یک نگاه"
                  sub="مقایسه FPY • هر خط در این نمونه یک محصول دارد"
                >
                  <div className="line-comparison">
                    {lineStats.map((r) => (
                      <button
                        key={r.line}
                        onClick={() => {
                          setF({ ...f, model: r.model });
                          go("lines");
                        }}
                      >
                        <div className="line-label">
                          <div className="line-icon">
                            <Factory size={18} />
                          </div>
                          <div>
                            <b>{r.line}</b>
                            <small>
                              {r.model} • {number(r.inspected)} خودرو
                            </small>
                          </div>
                          <strong>{number(r.fpy, 1)}٪</strong>
                        </div>
                        <div className="progress-track">
                          <div
                            style={{
                              width: r.fpy + "%",
                              background: r.fpy >= 95 ? "#08b6a8" : "#f97335",
                            }}
                          />
                        </div>
                        <span className="line-status">
                          {r.fpy >= 95
                            ? "در محدوده هدف نمایشی"
                            : "پایین‌تر از هدف نمایشی"}
                          <ChevronLeft size={14} />
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
              <Card
                title="اقدامات نیازمند پیگیری"
                sub="مسئول، وضعیت و موعد رسیدگی به مسائل شناسایی‌شده"
                action={
                  <button className="text-button" onClick={() => go("actions")}>
                    همه اقدامات
                    <ChevronLeft size={14} />
                  </button>
                }
              >
                <ActionTable
                  tasks={tasks.filter((t) => t.status !== "بسته")}
                  onSelect={setAction}
                />
              </Card>
            </>
          )}

          {page === "defects" && (
            <>
              <div className="metrics three">
                <Metric
                  label="رخدادهای عیب"
                  value={number(a.totalDefects)}
                  icon={BarChart3}
                  color="#f97335"
                  detail="شمارش رخداد؛ مستقل از تعداد خودرو معیوب"
                />
                <Metric
                  label="عیب به ازای هر خودرو"
                  value={number(a.totalDefects / a.inspected, 3)}
                  icon={Gauge}
                  color="#6366f1"
                  detail="رخداد عیب ÷ خودروهای بازرسی‌شده"
                />
                <Metric
                  label="سهم دو گروه اول"
                  value={number(
                    (a.pareto.slice(0, 2).reduce((s, d) => s + d.value, 0) /
                      a.totalDefects) *
                      100,
                    1,
                  )}
                  unit="٪"
                  icon={Target}
                  color="#08b6a8"
                  detail="اولویت پیشنهادی برای بررسی علت"
                />
              </div>
              <Card
                title="پارتوی عیوب و سهم تجمعی"
                sub="روی ستون یک گروه کلیک کنید تا جزئیات آن نمایش داده شود"
              >
                <Pareto rows={rows} onSelect={setSelected} />
              </Card>
              <div className="grid half">
                <Card
                  title={selected ? "جزئیات " + selected : "سهم گروه‌های عیب"}
                  sub="توزیع رخدادها در محدوده انتخاب‌شده"
                >
                  {a.pareto
                    .filter((d) => !selected || d.name === selected)
                    .map((d) => (
                      <div className="defect-row" key={d.name}>
                        <i style={{ background: d.color }} />
                        <b>{d.name}</b>
                        <span>{number(d.value)} رخداد</span>
                        <strong>
                          {number((d.value / a.totalDefects) * 100, 1)}٪
                        </strong>
                      </div>
                    ))}
                  {selected && (
                    <button
                      className="text-button"
                      onClick={() => setSelected(null)}
                    >
                      نمایش همه گروه‌ها
                    </button>
                  )}
                </Card>
                <Card
                  title="توزیع عیب در خطوط"
                  sub={
                    selected
                      ? "گروه انتخاب‌شده: " + selected
                      : "تمام گروه‌های عیب"
                  }
                >
                  <div className="chart" dir="ltr">
                    <ResponsiveContainer>
                      <BarChart
                        data={lineStats.map((r) => ({
                          name: r.model,
                          value: rows
                            .filter((x) => x.line === r.line)
                            .reduce(
                              (s, x) =>
                                s +
                                (selected
                                  ? x.defects[categories.indexOf(selected)]
                                  : x.defects.reduce((a, b) => a + b, 0)),
                              0,
                            ),
                        }))}
                      >
                        <CartesianGrid vertical={false} stroke="#edf0f4" />
                        <XAxis
                          dataKey="name"
                          tick={chartStyle}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={chartStyle}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => number(v)}
                        />
                        <Tooltip content={<ChartTip />} />
                        <Bar
                          isAnimationActive={false}
                          dataKey="value"
                          name="رخداد عیب"
                          fill="#6366f1"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={70}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
              <p className="method-note">
                فراوانی عیب برای اولویت‌بندی مناسب است؛ اثبات علت نیازمند بررسی
                فرایند، قطعه و شواهد میدانی است.
              </p>
            </>
          )}

          {page === "lines" && (
            <>
              <div className="metrics three">
                <Metric
                  label="قبولی بار اول"
                  value={number(a.fpy, 1)}
                  unit="٪"
                  icon={ShieldCheck}
                  color="#08b6a8"
                  detail="نسبت مجموع قبولی به مجموع بازرسی"
                />
                <Metric
                  label="نرخ ضایعات"
                  value={number(a.scrapRate, 2)}
                  unit="٪"
                  icon={PackageCheck}
                  color="#f97335"
                  detail={number(a.scrap) + " خودرو از بازرسی اول"}
                />
                <Metric
                  label="خطوط در محدوده هدف"
                  value={
                    number(lineStats.filter((r) => r.fpy >= 95).length) +
                    " / " +
                    number(lineStats.length)
                  }
                  icon={Factory}
                  color="#6366f1"
                  detail="هدف نمایشی FPY ≥ ۹۵٪"
                />
              </div>
              <Card
                title="مقایسه عملکرد خطوط"
                sub="تفاوت محصول و ترکیب تولید باید هنگام مقایسه خطوط در نظر گرفته شود"
              >
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>خط / محصول</th>
                        <th>بازرسی‌شده</th>
                        <th>قبولی بار اول</th>
                        <th>دوباره‌کاری</th>
                        <th>ضایعات</th>
                        <th>وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineStats.map((r) => (
                        <tr key={r.line}>
                          <td>
                            <b>{r.line}</b>
                            <small>{r.model}</small>
                          </td>
                          <td>{number(r.inspected)}</td>
                          <td className="teal">{number(r.fpy, 1)}٪</td>
                          <td>{number(r.rework)}</td>
                          <td>{number(r.scrap)}</td>
                          <td>
                            <Badge
                              text={r.fpy >= 95 ? "مطلوب" : "نیازمند بررسی"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <div className="grid half">
                <Card
                  title="روند کیفیت در محدوده انتخابی"
                  sub="هدف نمایشی ۹۵ درصد"
                >
                  <TrendChart rows={rows} />
                </Card>
                <Card
                  title="دوباره‌کاری و ضایعات به تفکیک شیفت"
                  sub="تعداد خودرو؛ مقایسه حجم بدون نرمال‌سازی نرخ"
                >
                  <div className="chart" dir="ltr">
                    <ResponsiveContainer>
                      <BarChart
                        data={["صبح", "عصر"]
                          .filter(
                            (s) => f.shift === "همه شیفت‌ها" || f.shift === s,
                          )
                          .map((s) => ({
                            name: s,
                            ...summarize(rows.filter((r) => r.shift === s)),
                          }))}
                      >
                        <CartesianGrid vertical={false} stroke="#edf0f4" />
                        <XAxis
                          dataKey="name"
                          tick={chartStyle}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={chartStyle}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTip />} />
                        <Bar
                          isAnimationActive={false}
                          dataKey="rework"
                          name="دوباره‌کاری"
                          fill="#f97335"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={60}
                        />
                        <Bar
                          isAnimationActive={false}
                          dataKey="scrap"
                          name="ضایعات"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </>
          )}

          {page === "suppliers" && (
            <>
              <div className="metrics three">
                <Metric
                  label="قطعات بازرسی‌شده ورودی"
                  value={number(a.received)}
                  unit="قطعه"
                  icon={Truck}
                  color="#3b82f6"
                  detail="مخرج شاخص PPM ورودی"
                />
                <Metric
                  label="قطعات نامنطبق"
                  value={number(a.rejected)}
                  unit="قطعه"
                  icon={PackageCheck}
                  color="#f97335"
                  detail="هر قطعه نامنطبق یک بار شمارش می‌شود"
                />
                <Metric
                  label="عدم انطباق قطعات ورودی"
                  value={number(a.ppm)}
                  unit="PPM"
                  icon={Gauge}
                  color="#6366f1"
                  detail="قطعات نامنطبق ÷ بازرسی‌شده × یک میلیون"
                />
              </div>
              <div className="grid half">
                <Card
                  title="مقایسه تأمین‌کنندگان بر اساس PPM"
                  sub="نرخ عدم انطباق؛ مقدار کمتر مطلوب‌تر است"
                >
                  <div className="chart" dir="ltr">
                    <ResponsiveContainer>
                      <BarChart
                        data={supplierStats}
                        layout="vertical"
                        margin={{ left: 15, right: 30 }}
                      >
                        <CartesianGrid horizontal={false} stroke="#edf0f4" />
                        <XAxis
                          type="number"
                          tick={chartStyle}
                          tickFormatter={(v) => number(v)}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={125}
                          tick={chartStyle}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTip />} />
                        <Bar
                          isAnimationActive={false}
                          dataKey="ppm"
                          name="PPM"
                          radius={[0, 7, 7, 0]}
                          maxBarSize={40}
                        >
                          {supplierStats.map((r, i) => (
                            <Cell key={r.name} fill={colors[i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card
                  title="تصمیم پیشنهادی خرید و کیفیت"
                  sub="حد هشدار نمایشی: بیش از ۱۰٬۰۰۰ PPM"
                >
                  {supplierStats.map((r) => (
                    <div className="supplier-note" key={r.name}>
                      <Truck size={21} />
                      <div>
                        <b>{r.name}</b>
                        <p>
                          {r.ppm > 10000
                            ? "بررسی نمونه ورودی و درخواست برنامه اصلاح از تأمین‌کننده"
                            : "ادامه پایش کیفیت محموله‌های ورودی"}
                        </p>
                      </div>
                      <Badge text={r.ppm > 10000 ? "نیازمند بررسی" : "مطلوب"} />
                    </div>
                  ))}
                </Card>
              </div>
              <Card
                title="کارنامه کیفیت تأمین‌کنندگان"
                sub="نام تأمین‌کنندگان و کارنامه‌ها ساختگی هستند"
              >
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>تأمین‌کننده</th>
                        <th>قطعات بازرسی‌شده</th>
                        <th>قطعات نامنطبق</th>
                        <th>PPM</th>
                        <th>وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierStats.map((r) => (
                        <tr key={r.name}>
                          <td>
                            <b>{r.name}</b>
                          </td>
                          <td>{number(r.received)}</td>
                          <td>{number(r.rejected)}</td>
                          <td>{number(r.ppm)}</td>
                          <td>
                            <Badge
                              text={r.ppm > 10000 ? "نیازمند بررسی" : "مطلوب"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {page === "cost" && (
            <>
              <div className="metrics three">
                <Metric
                  label="هزینه دوباره‌کاری"
                  value={number(a.reworkCost, 1)}
                  unit="میلیون تومان"
                  icon={Gauge}
                  color="#f97335"
                  detail="تعداد اصلاح × هزینه واحد نمایشی"
                />
                <Metric
                  label="هزینه ضایعات"
                  value={number(a.scrapCost, 1)}
                  unit="میلیون تومان"
                  icon={Wallet}
                  color="#6366f1"
                  detail="تعداد ضایعات × هزینه واحد نمایشی"
                />
                <Metric
                  label="هزینه بازرسی"
                  value={number(a.inspectionCost, 1)}
                  unit="میلیون تومان"
                  icon={ShieldCheck}
                  color="#08b6a8"
                  detail="تعداد خودرو بازرسی‌شده × هزینه بازرسی"
                />
              </div>
              <div className="grid half">
                <Card title="روند هزینه کیفیت ثبت‌شده" sub="واحد: میلیون تومان">
                  <TrendChart rows={rows} type="cost" />
                </Card>
                <Card
                  title="سهم سرفصل‌های هزینه"
                  sub="دامنه نمونه: بازرسی، دوباره‌کاری و ضایعات"
                >
                  {[
                    {
                      name: "دوباره‌کاری",
                      value: a.reworkCost,
                      color: colors[0],
                    },
                    { name: "ضایعات", value: a.scrapCost, color: colors[1] },
                    {
                      name: "بازرسی",
                      value: a.inspectionCost,
                      color: colors[2],
                    },
                  ].map((r) => (
                    <div className="cost-row" key={r.name}>
                      <div>
                        <b>{r.name}</b>
                        <strong>
                          {number(r.value, 1)} <small>میلیون تومان</small>
                        </strong>
                      </div>
                      <div className="progress-track">
                        <div
                          style={{
                            width: (100 * r.value) / a.cost + "%",
                            background: r.color,
                          }}
                        />
                      </div>
                      <span>
                        {number((r.value / a.cost) * 100, 1)}٪ از هزینه ثبت‌شده
                      </span>
                    </div>
                  ))}
                  <div className="cost-total">
                    <span>هزینه به ازای هر خودرو بازرسی‌شده</span>
                    <b>{number((a.cost / a.inspected) * 1e6)} تومان</b>
                  </div>
                </Card>
              </div>
              <Card title="تفسیر مدیریتی">
                <p className="prose">
                  کاهش تعداد عیب باید به کاهش هزینه قابل اندازه‌گیری تبدیل شود.
                  در استقرار واقعی، مبالغ با حسابداری تطبیق داده می‌شوند و هزینه
                  پیشگیری، گارانتی، برگشت و شکایت مشتری نیز به مدل اضافه می‌شود.
                  جمع حاضر فقط سه سرفصل ثبت‌شده در داده نمونه را پوشش می‌دهد و
                  کل هزینه کیفیت سازمان نیست.
                </p>
              </Card>
            </>
          )}

          {page === "spc" && (
            <>
              <div className="filters">
                <div className="filter-title">
                  <Activity size={18} />
                  <b>آزمون گشتاور اتصال</b>
                </div>
                <label>
                  محصول / خط
                  <select
                    aria-label="محصول کنترل آماری"
                    value={spcModel}
                    onChange={(e) => {
                      setSpcModel(e.target.value);
                    }}
                  >
                    {models.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <span className="record-count">
                  ۳۰ نمونه مستقل • واحد نیوتن‌متر
                </span>
              </div>
              <p className="method-note">
                این بخش مجموعه نمونه‌برداری مستقل دارد و تابع فیلتر دوره و شیفت
                صفحات تولید نیست. محصول فعال: {spcModel}.
              </p>
              <div className="metrics three">
                <Metric
                  label="میانگین مبنا"
                  value={number(control.center, 2)}
                  unit="نیوتن‌متر"
                  icon={Target}
                  color="#08b6a8"
                  detail="میانگین ۲۰ نمونه نخست"
                />
                <Metric
                  label="حد کنترل بالا"
                  value={number(control.ucl, 2)}
                  unit="نیوتن‌متر"
                  icon={ArrowUpLeft}
                  color="#6366f1"
                  detail="میانگین + ۲٫۶۶ × میانگین دامنه متحرک"
                />
                <Metric
                  label="سیگنال خارج از کنترل"
                  value={number(control.signals.length)}
                  unit="نمونه"
                  icon={Activity}
                  color="#f97335"
                  detail="قاعده نمایشی: نقطه خارج از حدود کنترل"
                />
              </div>
              <Card
                title="نمودار افراد برای گشتاور اتصال"
                sub="حدود از ۲۰ نمونه مبنا محاسبه شده‌اند؛ ۱۰ نمونه بعد برای پایش"
              >
                <div className="chart tall" dir="ltr">
                  <ResponsiveContainer>
                    <LineChart
                      data={control.rows}
                      margin={{ top: 20, left: 0, right: 25, bottom: 5 }}
                    >
                      <CartesianGrid vertical={false} stroke="#edf0f4" />
                      <XAxis
                        dataKey="label"
                        tick={chartStyle}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[44, 53]}
                        tick={chartStyle}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => number(v)}
                      />
                      <Tooltip content={<ChartTip />} />
                      <ReferenceLine
                        y={control.ucl}
                        stroke="#f97335"
                        strokeDasharray="5 5"
                        label={{
                          value: "UCL",
                          fill: "#f97335",
                          position: "insideTopLeft",
                        }}
                      />
                      <ReferenceLine
                        y={control.lcl}
                        stroke="#f97335"
                        strokeDasharray="5 5"
                        label={{
                          value: "LCL",
                          fill: "#f97335",
                          position: "insideBottomLeft",
                        }}
                      />
                      <ReferenceLine
                        y={control.center}
                        stroke="#08b6a8"
                        strokeDasharray="4 4"
                        label={{
                          value: "CL",
                          fill: "#08b6a8",
                          position: "insideTopLeft",
                        }}
                      />
                      <ReferenceLine
                        x={number(20)}
                        stroke="#bcc5d1"
                        label={{
                          value: "پایان مبنا",
                          fontFamily: "Vazirmatn",
                          fontSize: 11,
                          fill: "#728095",
                        }}
                      />
                      <Line
                        isAnimationActive={false}
                        dataKey="value"
                        name="گشتاور نیوتن‌متر"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={({ cx, cy, payload }) => (
                          <circle
                            key={payload.sample}
                            cx={cx}
                            cy={cy}
                            r={
                              payload.value > control.ucl ||
                              payload.value < control.lcl
                                ? 6
                                : 3
                            }
                            fill={
                              payload.value > control.ucl ||
                              payload.value < control.lcl
                                ? "#f97335"
                                : "#6366f1"
                            }
                            stroke="white"
                            strokeWidth={2}
                          />
                        )}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <div className="insight">
                <div className="insight-icon">
                  <Activity size={24} />
                </div>
                <div>
                  <b>
                    نمونه {number(control.signals[0]?.sample || 0)} نیازمند
                    بررسی فرایند است
                  </b>
                  <p>
                    کنترل ابزار، بررسی شرایط ایستگاه و نمونه‌برداری مجدد پیشنهاد
                    می‌شود. حدود کنترل آماری با حدود مشخصات مهندسی تفاوت دارند؛
                    در این نمونه Cpk محاسبه نشده است.
                  </p>
                </div>
              </div>
              <p className="method-note">
                روش نمایشی I-MR: مرکز = میانگین مبنا؛ حدود نمودار افراد = مرکز ±
                ۲٫۶۶ × میانگین |اختلاف نمونه‌های متوالی|. فرض: ترتیب زمانی معتبر
                و شرایط مبنا پایدار؛ در اجرای واقعی باید بررسی شود.
              </p>
            </>
          )}

          {page === "actions" && (
            <>
              <div className="metrics three">
                <Metric
                  label="اقدامات فعال"
                  value={number(
                    tasks.filter((t) => t.status !== "بسته").length,
                  )}
                  icon={ClipboardCheck}
                  color="#6366f1"
                  detail="باز یا در حال اجرا در محدوده انتخابی"
                />
                <Metric
                  label="اولویت بالا"
                  value={number(
                    tasks.filter(
                      (t) => t.priority === "بالا" && t.status !== "بسته",
                    ).length,
                  )}
                  icon={Target}
                  color="#f97335"
                  detail="نیازمند تمرکز مسئول فرایند"
                />
                <Metric
                  label="اقدامات بسته"
                  value={number(
                    tasks.filter((t) => t.status === "بسته").length,
                  )}
                  icon={Check}
                  color="#08b6a8"
                  detail="اثربخشی باید در دوره بعد پایش شود"
                />
              </div>
              <Card
                title="فهرست اقدامات اصلاحی"
                sub="روی عنوان اقدام کلیک کنید تا فرضیه علت و گام بعد نمایش داده شود"
              >
                <ActionTable tasks={tasks} onSelect={setAction} />
              </Card>
              <Card
                title="چرخه پیشنهادی پیگیری"
                sub="گردش کار در نسخه واقعی به سامانه کیفیت متصل می‌شود"
              >
                <div className="steps">
                  {[
                    "شناسایی عدم انطباق",
                    "بررسی علت و شواهد",
                    "تعریف مسئول و موعد",
                    "اجرای اصلاح",
                    "سنجش اثربخشی",
                  ].map((s, i) => (
                    <div key={s}>
                      <span>{number(i + 1)}</span>
                      <b>{s}</b>
                    </div>
                  ))}
                </div>
                <p className="method-note">
                  وضعیت‌ها و درصد پیشرفت در این نمونه از پیش تعریف شده‌اند؛ ثبت
                  و ویرایش سازمانی به اتصال سامانه و سطح دسترسی نیاز دارد.
                </p>
              </Card>
            </>
          )}

          {page === "proposal" && (
            <>
              <div className="proposal-hero">
                <div className="proposal-symbol">
                  <FileText size={38} />
                </div>
                <div>
                  <span className="eyebrow">پیشنهاد اجرایی / ۴ صفحه</span>
                  <h2>هوش تجاری برای کنترل کیفیت خودرو</h2>
                  <p>
                    از تعریف BI و ضرورت آن، تا داشبوردهای کاربردی و نقشه راه
                    پایلوت.
                  </p>
                  <div className="heading-actions">
                    <a
                      className="btn primary"
                      href={base + "/proposal.pdf"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download size={16} />
                      دریافت پروپوزال PDF
                    </a>
                    <a
                      className="btn"
                      href={base + "/proposal.html"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText size={16} />
                      نسخه قابل چاپ
                    </a>
                  </div>
                </div>
              </div>
              <Card title="چه چیزی در این نمونه می‌بینید؟">
                <div className="proposal-grid">
                  {nav.slice(0, 7).map((n) => (
                    <button key={n.id} onClick={() => go(n.id)}>
                      <n.icon size={23} />
                      <b>{n.name}</b>
                      <ChevronLeft size={16} />
                    </button>
                  ))}
                </div>
              </Card>
              <Card title="تعریف شاخص‌ها و دامنه داده">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>شاخص</th>
                        <th>تعریف محاسباتی</th>
                        <th>کاربرد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [
                          "FPY",
                          "قبولی بدون اصلاح در بازرسی اول ÷ بازرسی‌شده × ۱۰۰",
                          "پایش کیفیت خروجی",
                        ],
                        [
                          "نرخ دوباره‌کاری",
                          "خودروهای نیازمند اصلاح ÷ بازرسی‌شده × ۱۰۰",
                          "تشخیص اتلاف ظرفیت",
                        ],
                        [
                          "نرخ ضایعات",
                          "خودروهای ضایعاتی ÷ بازرسی‌شده × ۱۰۰",
                          "پایش اتلاف محصول",
                        ],
                        [
                          "PPM ورودی",
                          "قطعات نامنطبق ÷ قطعات بازرسی‌شده × ۱٬۰۰۰٬۰۰۰",
                          "مقایسه کیفیت تأمین‌کنندگان",
                        ],
                        [
                          "رخداد عیب",
                          "مجموع رخدادهای ثبت‌شده؛ چند عیب برای یک خودرو ممکن است",
                          "پارتو و اولویت بررسی",
                        ],
                        [
                          "هزینه کیفیت ثبت‌شده",
                          "هزینه بازرسی + دوباره‌کاری + ضایعات",
                          "پیوند کیفیت و اثر مالی",
                        ],
                      ].map((r) => (
                        <tr key={r[0]}>
                          {r.map((v, i) => (
                            <td key={i}>{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card title="درباره داده‌های این نمونه">
                <p className="prose">
                  ۱۸۰ رکورد تجمیعی ساختگی برای ۳۰ روز، سه محصول، سه خط و دو شیفت
                  تولید شده است. هر خط در این نمونه تنها یک محصول دارد؛ بنابراین
                  اثر خط و محصول از هم قابل تفکیک نیست. تأمین‌کنندگان، اقدامات،
                  هزینه‌ها، اهداف و حدود هشدار نمایشی هستند. نمودار کنترل آماری
                  از مجموعه مستقل ۳۰ نمونه گشتاور استفاده می‌کند. هیچ‌یک از این
                  اعداد بیانگر عملکرد واقعی سایپا نیست.
                </p>
              </Card>
            </>
          )}
          <footer className="footer">
            <span>
              <span className="orange-dot" />
              نمونه نمایشی • داده ساختگی • بدون بک‌اند و پایگاه داده
            </span>
            <button onClick={() => go("proposal")}>
              <CircleHelp size={14} />
              تعاریف شاخص‌ها
            </button>
          </footer>
        </div>
      </main>
      {action && (
        <div className="modal-backdrop" onClick={() => setAction(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="بستن جزئیات"
              onClick={() => setAction(null)}
            >
              <X size={21} />
            </button>
            <span className="eyebrow">{action.id} • اقدام اصلاحی نمونه</span>
            <h2 id="action-title">{action.title}</h2>
            <div className="modal-tags">
              <Badge text={action.status} />
              <Badge text={action.priority} />
              <span>
                {action.line} / {action.model}
              </span>
            </div>
            <dl>
              <dt>مسئول</dt>
              <dd>{action.owner}</dd>
              <dt>موعد نمونه</dt>
              <dd>{action.due} ۱۴۰۵</dd>
              <dt>وضعیت بررسی علت</dt>
              <dd>{action.cause}</dd>
              <dt>گام بعد</dt>
              <dd>{action.next}</dd>
            </dl>
            <div className="progress-track">
              <div
                style={{ width: action.progress + "%", background: "#6366f1" }}
              />
            </div>
            <p className="method-note">
              پیشرفت نمایشی: {number(action.progress)}٪
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
function ActionTable({
  tasks,
  onSelect,
}: {
  tasks: typeof actions;
  onSelect: (a: (typeof actions)[number]) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>موضوع اقدام</th>
            <th>مسئول</th>
            <th>اولویت</th>
            <th>وضعیت</th>
            <th>موعد نمونه</th>
            <th>پیشرفت</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>
                <button className="action-title" onClick={() => onSelect(t)}>
                  {t.title}
                </button>
                <small>
                  {t.id} • {t.line}
                </small>
              </td>
              <td>{t.owner}</td>
              <td>
                <Badge text={t.priority} />
              </td>
              <td>
                <Badge text={t.status} />
              </td>
              <td>{t.due}</td>
              <td>
                <div className="table-progress">
                  <div className="progress-track">
                    <div
                      style={{ width: t.progress + "%", background: "#6366f1" }}
                    />
                  </div>
                  <span>{number(t.progress)}٪</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!tasks.length && (
        <p className="empty">در محدوده انتخابی اقدام نمونه‌ای ثبت نشده است.</p>
      )}
    </div>
  );
}
