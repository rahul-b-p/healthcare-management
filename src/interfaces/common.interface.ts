interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AggregationResult {
  data: any[];
  meta: Array<{ total: number }>;
}