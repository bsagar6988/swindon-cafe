// Formats timestamps in UK local time (Europe/London), which automatically
// accounts for the GMT/BST daylight-saving switch.

export function formatUKDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatUKTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

const UK_DAY_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// en-CA formats as YYYY-MM-DD, giving a stable string key for "which UK
// calendar day does this timestamp fall on" — used to group/filter orders
// by day regardless of the server's own timezone.
export function ukDayKey(iso: string): string {
  return UK_DAY_KEY_FORMATTER.format(new Date(iso));
}

export function isTodayUK(iso: string): boolean {
  return ukDayKey(iso) === ukDayKey(new Date().toISOString());
}
