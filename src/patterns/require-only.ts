export type RequireOnly<T, K extends keyof T> = Required<Pick<T, K>> & Partial<T>
