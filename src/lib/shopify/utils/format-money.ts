export function formatMoney(amount: string | number, currencyCode: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}
