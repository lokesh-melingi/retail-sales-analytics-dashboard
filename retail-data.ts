// Synthetic but realistic retail superstore-style dataset.
// Generated deterministically (seeded RNG) so every render matches the
// "analysis" produced offline. ~2,500 rows across 24 months.

export type Segment = "Consumer" | "Corporate" | "Home Office";
export type Region = "North" | "South" | "East" | "West" | "Central";
export type Category =
  | "Technology"
  | "Furniture"
  | "Office Supplies"
  | "Apparel"
  | "Home & Kitchen";

export interface Order {
  orderId: string;
  orderDate: string; // ISO yyyy-mm-dd
  category: Category;
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
  segment: Segment;
  region: Region;
  discount: number;
}

const PRODUCTS: Record<Category, { name: string; price: [number, number]; margin: [number, number] }[]> = {
  Technology: [
    { name: "Wireless Mouse Pro", price: [25, 70], margin: [0.18, 0.32] },
    { name: "Mechanical Keyboard", price: [80, 220], margin: [0.2, 0.35] },
    { name: "27\" 4K Monitor", price: [320, 720], margin: [0.12, 0.22] },
    { name: "USB-C Hub", price: [35, 95], margin: [0.25, 0.4] },
    { name: "Noise-Cancel Headset", price: [120, 380], margin: [0.2, 0.34] },
    { name: "Smartphone Stand", price: [15, 45], margin: [0.3, 0.45] },
  ],
  Furniture: [
    { name: "Ergonomic Office Chair", price: [180, 620], margin: [0.08, 0.18] },
    { name: "Standing Desk", price: [320, 880], margin: [0.1, 0.2] },
    { name: "Bookshelf 5-Tier", price: [110, 260], margin: [0.12, 0.2] },
    { name: "Filing Cabinet", price: [90, 240], margin: [0.1, 0.18] },
    { name: "Conference Table", price: [450, 1400], margin: [0.06, 0.14] },
  ],
  "Office Supplies": [
    { name: "Premium Notebook (Pack)", price: [12, 38], margin: [0.35, 0.5] },
    { name: "Gel Pen Set", price: [8, 24], margin: [0.4, 0.55] },
    { name: "Sticky Notes Bulk", price: [10, 28], margin: [0.4, 0.55] },
    { name: "Paper Shredder", price: [70, 220], margin: [0.18, 0.28] },
    { name: "Desk Organizer", price: [22, 65], margin: [0.3, 0.45] },
  ],
  Apparel: [
    { name: "Cotton Polo Shirt", price: [22, 55], margin: [0.35, 0.5] },
    { name: "Performance Hoodie", price: [45, 110], margin: [0.32, 0.48] },
    { name: "Casual Sneakers", price: [55, 160], margin: [0.25, 0.4] },
    { name: "Slim-Fit Jeans", price: [38, 95], margin: [0.3, 0.45] },
    { name: "Wool Blend Coat", price: [120, 380], margin: [0.22, 0.36] },
  ],
  "Home & Kitchen": [
    { name: "Espresso Machine", price: [150, 720], margin: [0.14, 0.26] },
    { name: "Non-Stick Cookware Set", price: [80, 280], margin: [0.18, 0.3] },
    { name: "Air Purifier", price: [120, 420], margin: [0.16, 0.28] },
    { name: "Cordless Vacuum", price: [180, 540], margin: [0.14, 0.24] },
    { name: "Smart LED Bulbs (4-pk)", price: [25, 70], margin: [0.3, 0.45] },
  ],
};

const CATEGORIES = Object.keys(PRODUCTS) as Category[];
const SEGMENTS: Segment[] = ["Consumer", "Corporate", "Home Office"];
const REGIONS: Region[] = ["North", "South", "East", "West", "Central"];

// Mulberry32 — small deterministic PRNG so the dataset is identical run-to-run.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: () => number, arr: readonly T[]) {
  return arr[Math.floor(r() * arr.length)];
}

function buildDataset(): Order[] {
  const r = rng(20240615);
  const orders: Order[] = [];
  const start = new Date("2023-01-01");
  const months = 24;
  let id = 100000;

  for (let m = 0; m < months; m++) {
    // Seasonality: Nov/Dec spike, summer dip; year-over-year growth ~14%.
    const monthIdx = (start.getMonth() + m) % 12;
    const yearGrowth = 1 + 0.14 * Math.floor(m / 12);
    const seasonal =
      1 +
      0.55 * Math.exp(-Math.pow(monthIdx - 10.5, 2) / 3) + // holiday peak
      0.15 * Math.sin((monthIdx / 12) * Math.PI * 2);
    const baseOrders = Math.round(80 * seasonal * yearGrowth);

    for (let i = 0; i < baseOrders; i++) {
      const category = pick(r, CATEGORIES);
      const product = pick(r, PRODUCTS[category]);
      const day = 1 + Math.floor(r() * 28);
      const date = new Date(start.getFullYear(), start.getMonth() + m, day);

      const unitPrice =
        product.price[0] + r() * (product.price[1] - product.price[0]);
      const quantity = 1 + Math.floor(r() * 5);
      const discount = r() < 0.35 ? Math.round(r() * 30) / 100 : 0;
      const sales = +(unitPrice * quantity * (1 - discount)).toFixed(2);
      const margin =
        product.margin[0] + r() * (product.margin[1] - product.margin[0]);
      // Heavy discounts can flip profit negative — realistic.
      const profit = +(
        sales * margin -
        sales * discount * 0.6
      ).toFixed(2);

      orders.push({
        orderId: `ORD-${id++}`,
        orderDate: date.toISOString().slice(0, 10),
        category,
        productName: product.name,
        sales,
        profit,
        quantity,
        segment: pick(r, SEGMENTS),
        region: pick(r, REGIONS),
        discount,
      });
    }
  }

  return orders.sort((a, b) => a.orderDate.localeCompare(b.orderDate));
}

export const DATASET: Order[] = buildDataset();

export const DATE_RANGE = {
  start: DATASET[0].orderDate,
  end: DATASET[DATASET.length - 1].orderDate,
};
