// Lightweight time-series forecaster.
// Model: linear trend + 12-month seasonal multiplier, fit via OLS on
// monthly aggregates. Adequate for the dataset's scale and explainable —
// which is what a student internship project should ship.

export interface MonthPoint { month: string; sales: number; label?: string }
export interface ForecastPoint extends MonthPoint { forecast: number; lower: number; upper: number; isFuture: boolean }
export interface ModelMetrics { r2: number; mae: number; rmse: number; mape: number; slopePerMonth: number; intercept: number }

function olsLinear(y: number[]): { a: number; b: number } {
  const n = y.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (y[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const b = den ? num / den : 0;
  const a = my - b * mx;
  return { a, b };
}

export function trainAndForecast(history: MonthPoint[], horizon = 6) {
  const y = history.map((p) => p.sales);
  const { a, b } = olsLinear(y);

  // Detrended seasonality (12-month cycle).
  const detrended = y.map((v, i) => v - (a + b * i));
  const seasonal = new Array(12).fill(0).map((_, k) => {
    const vals = detrended.filter((_, i) => i % 12 === k);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  });

  const fitted = y.map((_, i) => a + b * i + seasonal[i % 12]);
  const residuals = y.map((v, i) => v - fitted[i]);
  const resStd = Math.sqrt(residuals.reduce((s, v) => s + v * v, 0) / residuals.length);

  const ssRes = residuals.reduce((s, v) => s + v * v, 0);
  const meanY = y.reduce((s, v) => s + v, 0) / y.length;
  const ssTot = y.reduce((s, v) => s + (v - meanY) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  const mae = residuals.reduce((s, v) => s + Math.abs(v), 0) / residuals.length;
  const rmse = Math.sqrt(ssRes / residuals.length);
  const mape =
    (y.reduce((s, v, i) => s + Math.abs((v - fitted[i]) / Math.max(v, 1)), 0) / y.length) * 100;

  const metrics: ModelMetrics = {
    r2: +r2.toFixed(3),
    mae: +mae.toFixed(0),
    rmse: +rmse.toFixed(0),
    mape: +mape.toFixed(2),
    slopePerMonth: +b.toFixed(2),
    intercept: +a.toFixed(2),
  };

  // Build combined series: historical fit + future projection.
  const out: ForecastPoint[] = history.map((p, i) => ({
    month: p.month,
    label: p.label,
    sales: p.sales,
    forecast: +fitted[i].toFixed(0),
    lower: +(fitted[i] - 1.96 * resStd).toFixed(0),
    upper: +(fitted[i] + 1.96 * resStd).toFixed(0),
    isFuture: false,
  }));

  const last = history[history.length - 1].month; // YYYY-MM
  const [ly, lm] = last.split("-").map(Number);
  for (let h = 1; h <= horizon; h++) {
    const date = new Date(ly, lm - 1 + h, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const idx = history.length - 1 + h;
    const f = a + b * idx + seasonal[idx % 12];
    out.push({
      month,
      label: date.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      sales: NaN,
      forecast: +f.toFixed(0),
      lower: +(f - 1.96 * resStd).toFixed(0),
      upper: +(f + 1.96 * resStd).toFixed(0),
      isFuture: true,
    });
  }

  return { metrics, series: out, seasonal };
}
