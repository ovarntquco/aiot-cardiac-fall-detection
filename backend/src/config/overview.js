function readPositiveNumber(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") return fallback;

  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive finite number.`);
  }

  return value;
}

export const overviewConfig = Object.freeze({
  staleAfterMinutes: readPositiveNumber("CAREWATCH_OVERVIEW_STALE_AFTER_MINUTES", 15),
});
