import type Fetch from "./Fetch";
import type { CachedData } from "./utils/cache";

export type DependencyList = ReadonlyArray<any>;

export interface MutableRefObject<T> {
  current: T;
}

export type Service<TData, TParams extends any[]> = (
  ...args: TParams
) => Promise<TData>;
export type Subscribe = () => void;

// for Fetch

export interface FetchState<TData, TParams extends any[]> {
  loading: boolean;
  params?: TParams;
  data?: TData;
  error?: Error;
  cacheKeyParams: any;
}

export interface PluginReturn<TData, TParams extends any[]> {
  onBefore?: (params: TParams) =>
    | ({
        stopNow?: boolean;
        returnNow?: boolean;
      } & Partial<FetchState<TData, TParams>>)
    | void;

  onRequest?: (
    service: Service<TData, TParams>,
    params: TParams
  ) => {
    servicePromise?: Promise<TData>;
  };

  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (e: Error, params: TParams) => void;
  onFinally?: (params: TParams, data?: TData, e?: Error) => void;
  onCancel?: () => void;
  onMutate?: (data: TData) => void;
}

// for useRequestImplement

export interface Options<TData, TParams extends any[]> {
  manual?: boolean;
  onGetCacheBefore?: (params?: TParams) => void;
  onGetCacheAfter?: (params?: TParams) => void;
  onInit?: (params?: TParams) => void;
  onBefore?: (params: TParams) => void;
  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (e: Error, params: TParams) => void;
  // formatResult?: (res: any) => TData;
  onFinally?: (params: TParams, data?: TData, e?: Error) => void;

  filterErrorData?: (res: any) => any;
  sliceRender?: (res: any, fetchInstance: Fetch<TData, TParams>) => any;
  defaultParams?: TParams;

  // refreshDeps
  refreshDeps?: DependencyList;
  refreshDepsAction?: () => void;

  // loading delay
  loadingDelay?: number;

  // polling
  pollingInterval?: number;
  pollingWhenHidden?: boolean;

  // refresh on window focus
  refreshOnWindowFocus?: boolean;
  focusTimespan?: number;

  // debounce
  debounceWait?: number;
  debounceLeading?: boolean;
  debounceTrailing?: boolean;
  debounceMaxWait?: number;

  // throttle
  throttleWait?: number;
  throttleLeading?: boolean;
  throttleTrailing?: boolean;

  // cache
  cacheKey?: string;
  cacheTime?: number;
  staleTime?: number;
  setCache?: (data: CachedData<TData, TParams>) => void;
  getCache?: (params: TParams) => CachedData<TData, TParams> | undefined;
  cacheFilterData?: (data: CachedData<TData, TParams>) => void;
  supportStorage?: boolean;
  cacheKeyParams?: any;
  cacheKeyDataNum?: number;
  cacheVersion?: string;
  onlySetCache?: boolean;

  // retry
  retryCount?: number;
  retryInterval?: number;

  // ready
  ready?: boolean;

  // [key: string]: any;
}

export type Plugin<TData, TParams extends any[]> = {
  (
    fetchInstance: Fetch<TData, TParams>,
    options: Options<TData, TParams>
  ): PluginReturn<TData, TParams>;
  onInit?: (
    options: Options<TData, TParams>
  ) => Partial<FetchState<TData, TParams>>;
};

export interface Result<TData, TParams extends any[]> {
  loading: boolean;
  data?: TData;
  error?: Error;
  params: TParams | [];
  cancel: Fetch<TData, TParams>["cancel"];
  refresh: Fetch<TData, TParams>["refresh"];
  refreshAsync: Fetch<TData, TParams>["refreshAsync"];
  run: (params: any) => void; //Fetch<TData, TParams>['run'];
  runAsync: Fetch<TData, TParams>["runAsync"];
  mutate: Fetch<TData, TParams>["mutate"];
}

export type Timeout = ReturnType<typeof setTimeout>;
