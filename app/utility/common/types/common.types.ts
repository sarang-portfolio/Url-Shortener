export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface IExcludedPaths {
  path: string;
  method: Method;
}
