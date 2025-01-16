import { useRef } from "react";
import { useCreation, useUnmount } from "@jd-antelope/taro-hooks";
import type { Plugin } from "../types";
import * as cache from "../utils/cache";
import type { CachedData } from "../utils/cache";
import * as cachePromise from "../utils/cachePromise";
import * as cacheSubscribe from "../utils/cacheSubscribe";

const useCachePlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    cacheKey,
    cacheTime = 24 * 60 * 1000,
    staleTime = 0,
    cacheFilterData = (data) => data,
    setCache: customSetCache,
    getCache: customGetCache,
    supportStorage = false,
    cacheKeyParams,
    cacheKeyDataNum = 3,
    cacheVersion = "",
    onGetCacheBefore,
    onGetCacheAfter,
    isHasErrorDataFn,
    sliceRender,
  }
) => {
  const unSubscribeRef = useRef<() => void>();

  const currentPromiseRef = useRef<Promise<any>>();

  const _setCache = (key: string, cachedData: CachedData) => {
    const { cacheDataResponse, cacheDataCopy } = cache.cacheFilterDataResponse({
      key,
      cachedData,
      fn: cacheFilterData,
      cacheKeyParams: {
        ...(cacheKeyParams || {}),
        ...(fetchInstance.state.cacheKeyParams || {}),
      },
      supportStorage,
      cacheKeyDataNum,
    });

    if (customSetCache) {
      customSetCache(cacheDataResponse);
    } else {
      cache.setCache({
        key,
        cacheTime,
        cachedData: cacheDataResponse,
        supportStorage,
        cacheVersion,
      });
    }
    cacheSubscribe.trigger(key, cacheDataCopy.data);
  };

  const _getCache = (key: string, params: any[] = [], isReal?: boolean) => {
    if (customGetCache) {
      return customGetCache(params);
    }
    return cache.getCache({
      key,
      supportStorage,
      cacheVersion,
      onGetCacheBefore,
      onGetCacheAfter,
      isReal,
      cacheKeyParams: {
        ...(cacheKeyParams || {}),
        ...(fetchInstance.state.cacheKeyParams || {}),
      },
    });
  };

  useCreation(() => {
    if (!cacheKey) {
      return;
    }

    // get data from cache when init
    const cacheData = _getCache(cacheKey);
    if (cacheData && Object.hasOwnProperty.call(cacheData, "data")) {
      fetchInstance.state.data = cacheData.data;
      fetchInstance.state.params = cacheData.params;
      if (
        staleTime === -1 ||
        new Date().getTime() - cacheData.time <= staleTime
      ) {
        fetchInstance.state.loading = false;
      }
    }

    // subscribe same cachekey update, trigger update
    unSubscribeRef.current = cacheSubscribe.subscribe(cacheKey, (data) => {
      fetchInstance.setState({ data });
    });
  }, []);

  useUnmount(() => {
    unSubscribeRef.current?.();
  });

  if (!cacheKey) {
    return {};
  }

  return {
    onBefore: (params) => {
      const cacheData = _getCache(cacheKey, params, true);
      if (
        !cacheData ||
        !Object.hasOwnProperty.call(cacheData, "data") ||
        params?.[0]?.onlySetCache
      ) {
        console.log("[cache]-仅使用缓存数据");
        return {};
      }
      // If the data is fresh, stop request
      if (
        staleTime === -1 ||
        new Date().getTime() - cacheData.time <= staleTime
      ) {
        return {
          loading: false,
          data: cacheData
            ? {
                ...cacheData?.data,
                isCache: true,
              }
            : undefined,
          returnNow: true,
        };
      } else {
        // If the data is stale, return data, and request continue
        return {
          data: cacheData
            ? {
                ...cacheData?.data,
                isCache: true,
              }
            : undefined,
        };
      }
    },
    onRequest: (service, args) => {
      let servicePromise = cachePromise.getCachePromise(cacheKey);
      // If has servicePromise, and is not trigger by self, then use it
      if (servicePromise && servicePromise !== currentPromiseRef.current) {
        return { servicePromise };
      }

      servicePromise = service(...args);
      currentPromiseRef.current = servicePromise;
      cachePromise.setCachePromise(cacheKey, servicePromise);
      return { servicePromise };
    },
    onSuccess: (data, params) => {
      const cacheData = _getCache(cacheKey, params, true);
      if (isHasErrorDataFn?.(data) && cacheData) {
        fetchInstance.setState({
          error: new Error("Request failed with status code 200"),
          loading: false,
        });
        return;
      } else {
        // 是否启动切片
        if (sliceRender && typeof sliceRender === "function") {
          sliceRender(data, fetchInstance);
        } else {
          fetchInstance.setState({
            data: data,
            error: undefined,
            loading: false,
            // 标识是真实接口
            isReal: true,
          });
        }
      }
      if (cacheKey && !isHasErrorDataFn?.(data)) {
        // cancel subscribe, avoid trgger self
        unSubscribeRef.current?.();
        _setCache(cacheKey, {
          data,
          params,
          time: new Date().getTime(),
        });
        // resubscribe
        unSubscribeRef.current = cacheSubscribe.subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
    onMutate: (data) => {
      if (cacheKey) {
        // cancel subscribe, avoid trgger self
        unSubscribeRef.current?.();
        _setCache(cacheKey, {
          data,
          params: fetchInstance.state.params,
          time: new Date().getTime(),
        });
        // resubscribe
        unSubscribeRef.current = cacheSubscribe.subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
  };
};

export default useCachePlugin;
