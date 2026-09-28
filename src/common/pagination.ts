export interface PaginationQuery {
  page?: string | number;
  size?: string | number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function parsePagination(query: PaginationQuery, defaultSortField = 'id', defaultSortOrder: 'asc' | 'desc' = 'desc') {
  const page = Math.max(0, parseInt(String(query.page || 0), 10) || 0);
  const size = Math.min(100, Math.max(1, parseInt(String(query.size || 20), 10) || 20));

  let orderBy: Record<string, 'asc' | 'desc'> = { [defaultSortField]: defaultSortOrder };

  if (query.sort && typeof query.sort === 'string') {
    const [field, direction] = query.sort.split(',');
    if (field) {
      orderBy = { [field.trim()]: (direction?.toLowerCase() === 'asc' ? 'asc' : 'desc') };
    }
  }

  return {
    skip: page * size,
    take: size,
    page,
    size,
    orderBy,
  };
}

export function toPageResponse<T>(content: T[], totalElements: number, page: number, size: number): PageResponse<T> {
  const totalPages = Math.ceil(totalElements / size) || 1;
  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
  };
}
