export function formatCurrency(amount: number | string | undefined, currency: string = "EUR"): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (value === undefined || isNaN(value)) return "€0.00";
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2
  }).format(value);
}
