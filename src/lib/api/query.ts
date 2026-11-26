export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "20", 10) || 20),
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function parseDateRange(searchParams: URLSearchParams) {
  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");
  const from = fromRaw ? new Date(fromRaw) : undefined;
  const to = toRaw ? new Date(toRaw) : undefined;
  if (from && Number.isNaN(from.getTime())) {
    throw new Error("Invalid from date");
  }
  if (to && Number.isNaN(to.getTime())) {
    throw new Error("Invalid to date");
  }
  return { from, to };
}

export function paginationMeta(page: number, pageSize: number, total: number) {
  return { page, pageSize, total };
}