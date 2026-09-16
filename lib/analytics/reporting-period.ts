const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type ReportingPeriod = {
  from: Date;
  to: Date;
  timezone: string;
  date: string;
};

function assertValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    }).format();
  } catch {
    throw new Error("INVALID_TIMEZONE");
  }
}

function assertValidDateOnly(date: string) {
  if (!DATE_ONLY_REGEX.test(date)) {
    throw new Error("INVALID_REPORTING_DATE");
  }

  const parsed = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("INVALID_REPORTING_DATE");
  }

  const [year, month, day] = date
    .split("-")
    .map(Number);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error("INVALID_REPORTING_DATE");
  }
}

function getTimezoneOffsetMs(
  date: Date,
  timezone: string
) {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }
  ).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [
        part.type,
        Number(part.value),
      ])
  );

  const asUTC = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );

  return asUTC - date.getTime();
}

function zonedMidnightToUTC(
  date: string,
  timezone: string
) {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  const approximateUTC = new Date(
    Date.UTC(year, month - 1, day)
  );

  const offset = getTimezoneOffsetMs(
    approximateUTC,
    timezone
  );

  return new Date(
    approximateUTC.getTime() - offset
  );
}

function addOneCalendarDay(date: string) {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  const next = new Date(
    Date.UTC(year, month - 1, day + 1)
  );

  return [
    next.getUTCFullYear(),
    String(next.getUTCMonth() + 1).padStart(2, "0"),
    String(next.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function getReportingPeriod(
  date: string,
  timezone: string
): ReportingPeriod {
  assertValidDateOnly(date);
  assertValidTimezone(timezone);

  const nextDate = addOneCalendarDay(date);

  const from = zonedMidnightToUTC(
    date,
    timezone
  );

  const to = zonedMidnightToUTC(
    nextDate,
    timezone
  );

  return {
    from,
    to,
    timezone,
    date,
  };
}
