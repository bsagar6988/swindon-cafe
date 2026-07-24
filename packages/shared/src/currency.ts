// This app is UK-only, priced in GBP. Amounts are stored as integer pence
// (mirroring how the schema/API name them "*Cents" — that's just the generic
// minor-unit naming, not a USD assumption).

const GBP_FORMATTER = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatGBP(pence: number): string {
  return GBP_FORMATTER.format(pence / 100);
}
