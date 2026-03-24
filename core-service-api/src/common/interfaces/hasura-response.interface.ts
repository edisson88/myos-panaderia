export interface HasuraError {
  message: string;
  extensions?: {
    code?: string;
    path?: string;
    [key: string]: unknown;
  };
}

/**
 * Generic wrapper for every Hasura GraphQL HTTP response.
 * T represents the shape of the `data` field, which varies per query.
 */
export interface HasuraResponse<T> {
  data: T;
  errors?: HasuraError[];
}
