export function generateOrderNumber(): string {
  const now = new Date();

  const date = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");

  const time = [
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0"),
  ].join("");

  const random = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `${date}-${time}-${random}`;
}
