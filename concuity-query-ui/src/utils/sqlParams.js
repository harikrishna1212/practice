// Parses Oracle-style bind parameters (:paramName) from SQL text.
// Assumption confirmed with stakeholder on 2026-06-10: client-side parsing,
// :name syntax, parsed as the user types. Skips string literals and
// PL/SQL assignment operator (:=).
export function parseSqlParameters(sqlText) {
  if (!sqlText) return [];
  const withoutLiterals = sqlText.replace(/'(?:[^']|'')*'/g, "''");
  const matches = withoutLiterals.match(/(?<![:\w]):([a-zA-Z_]\w*)/g) || [];
  const seen = new Set();
  const names = [];
  for (const match of matches) {
    const name = match.slice(1);
    if (!seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      names.push(name);
    }
  }
  return names;
}
