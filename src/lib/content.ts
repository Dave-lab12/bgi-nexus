export function sortByOrder<T extends { data?: { sort_order?: number } }>(
  items: T[],
) {
  return [...items].sort(
    (a, b) => (a.data?.sort_order ?? 0) - (b.data?.sort_order ?? 0),
  );
}

export function sectionsFrom(
  entry: { data?: { sections?: unknown } } | null | undefined,
) {
  const sections = entry?.data?.sections;
  return sections && typeof sections === "object"
    ? (sections as Record<string, any>)
    : {};
}

export function asArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function termsFrom<T extends { data?: { tag?: string } }>(items: T[]) {
  return Array.from(
    new Set(items.map((item) => item.data?.tag).filter(Boolean) as string[]),
  );
}
