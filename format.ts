export const fmtCurrency = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${n.toFixed(0)}`;

export const fmtNumber = (n: number) => n.toLocaleString("en-US");

export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
