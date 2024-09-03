/**Shortcut to get Swagger schema response body */
export type SchemaResponseBody<
  T,
  K extends keyof T
> = T[K]['responses']['200']['content']['application/json'];

/** Shortcut to get Swagger created(201) response body */
export type SchemaCreateResponseBody<
  T,
  K extends keyof T
> = T[K]['responses']['201']['content']['application/json'];

export type SchemaRequestBody<
  T,
  K extends keyof T
> = T[K]['requestBody']['content']['application/json'];

export type SchemaRequestQuery<
  T,
  K extends keyof T
> = T[K]['parameters']['query'];
export type SchemaRequestParams<
  T,
  K extends keyof T
> = T[K]['parameters']['path'];
