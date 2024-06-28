import { useMemo } from "react";
import {
  useLatest,
  useMount,
  useUnmount,
  useUpdate,
  useMemoizedFn,
} from "@qzc/taro-hooks";
import Fetch from "./Fetch";
import type { Options, Plugin, Result, Service } from "./types";

function useRequestImplement<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options: Options<TData, TParams> = {},
  plugins: Plugin<TData, TParams>[] = []
) {
  const { manual = false, ...rest } = options;

  const fetchOptions: any = {
    manual,
    ...rest,
  };

  const serviceRef = useLatest(service);

  const update = useUpdate();

  const fetchInstance = useMemo(() => {
    const initState = plugins
      .map((p) => p?.onInit?.(fetchOptions))
      .filter(Boolean);

    const fetch = new Fetch<TData, TParams>(
      // @ts-ignore
      serviceRef,
      fetchOptions,
      update,
      Object.assign({}, ...initState)
    );

    return fetch;
  }, []);

  // react can not call hooks in other hooks. we use env to fix it
  fetchInstance.options = fetchOptions;
  // run all plugins hooks
  fetchInstance.pluginImpls = plugins
    .filter((p) => typeof p === "function")
    .map((p) => p?.(fetchInstance, fetchOptions));

  useMount(() => {
    if (!manual) {
      // useCachePlugin can set fetchInstance.state.params from cache when init
      const instance = fetchInstance;
      const params = instance.state.params || options.defaultParams || [];
      // @ts-ignore
      instance.run(...params);
    }
  });

  useUnmount(() => {
    fetchInstance?.cancel?.();
  });

  return {
    loading: fetchInstance.state.loading,
    data: fetchInstance.state.data,
    error: fetchInstance.state.error,
    isReal:fetchInstance.state.isReal,
    params: fetchInstance.state.params || [],
    cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
    refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
    refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
    run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
    runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)),
    mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance)),
  } as unknown as Result<TData, TParams>;
}

export default useRequestImplement;
