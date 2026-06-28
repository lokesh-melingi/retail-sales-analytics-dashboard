import { DATASET, type Order, type Region, type Category, type Segment } from "./retail-data";

export interface Filters {
  region?: Region | "All";
  category?: Category | "All";
  segment?: Segment | "All";
}

export function applyFilters(rows: Order[], f: Filters): Order[] {
  return rows.filter(
    (o) =>
      (!f.region || f.region === "All" || o.region === f.region) &&
      (!f.category || f.category === "All" || o.category === f.category) &&
      (!f.segment || f.segment === "All" || o.segment === f.segment),
  );
}

export function kpis(rows: Order[]) {
  const totalSales = rows.reduce((s, o) => s + o.sales, 0);
  const totalProfit = rows.reduce((s, o) => s + o.profit, 0);
  const totalOrders = rows.length;
  const totalQty = rows.reduce((s, o) => s + o.quantity, 0);
  return {
    totalSales,
    totalProfit,
    totalOrders,
    totalQty,
    avgOrderValue: totalOrders ? totalSales / totalOrders : 0,
    profitMargin: totalSales ? totalProfit / totalSales : 0,
  };
}

export function monthlyTrend(rows: Order[]) {
  const map = new Map<string, { month: string; sales: number; profit: number; orders: number }>();
  for (const o of rows) {
    const key = o.orderDate.slice(0, 7); // YYYY-MM
    const entry = map.get(key) ?? { month: key, sales: 0, profit: 0, orders: 0 };
    entry.sales += o.sales;
    entry.profit += o.profit;
    entry.orders += 1;
    map.set(key, entry);
  }
  return [...map.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      ...m,
      label: new Date(m.month + "-01").toLocaleString("en-US", { month: "short", year: "2-digit" }),
      sales: +m.sales.toFixed(0),
      profit: +m.profit.toFixed(0),
    }));
}

export function byCategory(rows: Order[]) {
  const map = new Map<string, { category: string; sales: number; profit: number; orders: number }>();
  for (const o of rows) {
    const e = map.get(o.category) ?? { category: o.category, sales: 0, profit: 0, orders: 0 };
    e.sales += o.sales;
    e.profit += o.profit;
    e.orders += 1;
    map.set(o.category, e);
  }
  return [...map.values()]
    .map((e) => ({ ...e, sales: +e.sales.toFixed(0), profit: +e.profit.toFixed(0) }))
    .sort((a, b) => b.sales - a.sales);
}

export function byRegion(rows: Order[]) {
  const map = new Map<string, { region: string; sales: number; profit: number; orders: number }>();
  for (const o of rows) {
    const e = map.get(o.region) ?? { region: o.region, sales: 0, profit: 0, orders: 0 };
    e.sales += o.sales;
    e.profit += o.profit;
    e.orders += 1;
    map.set(o.region, e);
  }
  return [...map.values()]
    .map((e) => ({ ...e, sales: +e.sales.toFixed(0), profit: +e.profit.toFixed(0) }))
    .sort((a, b) => b.sales - a.sales);
}

export function bySegment(rows: Order[]) {
  const map = new Map<string, { segment: string; value: number }>();
  for (const o of rows) {
    const e = map.get(o.segment) ?? { segment: o.segment, value: 0 };
    e.value += o.sales;
    map.set(o.segment, e);
  }
  return [...map.values()].map((e) => ({ ...e, value: +e.value.toFixed(0) }));
}

export function topProducts(rows: Order[], n = 10) {
  const map = new Map<string, { product: string; category: string; sales: number; profit: number; qty: number }>();
  for (const o of rows) {
    const e =
      map.get(o.productName) ?? { product: o.productName, category: o.category, sales: 0, profit: 0, qty: 0 };
    e.sales += o.sales;
    e.profit += o.profit;
    e.qty += o.quantity;
    map.set(o.productName, e);
  }
  return [...map.values()]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, n)
    .map((e) => ({ ...e, sales: +e.sales.toFixed(0), profit: +e.profit.toFixed(0) }));
}

export function correlationMatrix(rows: Order[]) {
  const fields = ["sales", "profit", "quantity", "discount"] as const;
  const cols = fields.map((f) => rows.map((r) => r[f]));
  function corr(a: number[], b: number[]) {
    const n = a.length;
    const ma = a.reduce((s, v) => s + v, 0) / n;
    const mb = b.reduce((s, v) => s + v, 0) / n;
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < n; i++) {
      const x = a[i] - ma, y = b[i] - mb;
      num += x * y; da += x * x; db += y * y;
    }
    return da && db ? num / Math.sqrt(da * db) : 0;
  }
  const cells: { x: string; y: string; v: number }[] = [];
  for (let i = 0; i < fields.length; i++) {
    for (let j = 0; j < fields.length; j++) {
      cells.push({ x: fields[j], y: fields[i], v: +corr(cols[i], cols[j]).toFixed(3) });
    }
  }
  return { fields: [...fields], cells };
}

export function describe(rows: Order[]) {
  const fields = ["sales", "profit", "quantity", "discount"] as const;
  return fields.map((f) => {
    const xs = rows.map((r) => r[f]).sort((a, b) => a - b);
    const n = xs.length;
    const mean = xs.reduce((s, v) => s + v, 0) / n;
    const variance = xs.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const q = (p: number) => xs[Math.floor(p * (n - 1))];
    return {
      field: f,
      count: n,
      mean: +mean.toFixed(2),
      std: +Math.sqrt(variance).toFixed(2),
      min: +xs[0].toFixed(2),
      q25: +q(0.25).toFixed(2),
      median: +q(0.5).toFixed(2),
      q75: +q(0.75).toFixed(2),
      max: +xs[n - 1].toFixed(2),
    };
  });
}

export const allRows = () => DATASET;
