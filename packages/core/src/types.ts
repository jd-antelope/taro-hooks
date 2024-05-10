export type DependencyList = ReadonlyArray<any>;

export interface MutableRefObject<T> {
  current: T;
}

export type Timeout = ReturnType<typeof setTimeout>;
