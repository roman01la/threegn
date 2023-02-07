export function toCamelCase(s) {
  return s
    ?.toLowerCase()
    .replace(/_/, " ")
    .replace(/^[a-z]|\s+[a-z]/g, (c) => c.toUpperCase());
}
