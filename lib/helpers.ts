// Helpers
export const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const formatUSD = (n: number) => fmt.format(n);
export const DATE_FMT = (d?: string) => (d ? new Date(d).toLocaleDateString() : "—");

export function classNames(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

