export class RequestMapper {
  static toPagination(query: any) {
    return {
      page: parseInt(query.page as string) || 1,
      limit: parseInt(query.limit as string) || 10,
      search: query.search as string | undefined,
    };
  }

  static toBoolean(value: any): boolean | undefined {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return undefined;
  }
}