import { getStorageSync, setStorage, removeStorage } from "@tarojs/taro";
import { cloneDeep } from "lodash";

// type Timer = ReturnType<typeof setTimeout>;
type CachedKey = string | number;

export interface CachedData<TData = any, TParams = any> {
  data: TData;
  params: TParams;
  time: number;
}
interface RecordData extends CachedData {
  cacheTime: number;
  preTimer: number;
}

const cache = new Map<CachedKey, RecordData>();

// 设置缓存
const setCache = (params: any, isFilter: boolean = false) => {
  const { key, cacheTime, cachedData, supportStorage, cacheVersion } = params;
  let cachedDataResponse = isFilter
    ? cacheFilterDataResponse(params)
    : cachedData;
  // const currentCache = cache.get(key);
  // if (currentCache?.preTimer) {
  //   clearTimeout(currentCache.preTimer);
  // }

  // let timer: Timer | undefined;

  // if (cacheTime > -1) {
  //   // if cache out, clear it
  //   timer = setTimeout(() => {
  //     cache.delete(key);
  //     supportStorage && removeStorage({
  //       key: String(key)
  //     })
  //   }, cacheTime);
  // }

  if (!supportStorage) {
    cache.set(key, {
      ...cachedDataResponse,
      cacheTime,
      cacheVersion,
      preTimer: new Date().getTime(),
    });
  }

  try {
    supportStorage &&
      setStorage({
        key: String(key),
        data: {
          ...cachedDataResponse,
          cacheTime,
          cacheVersion,
          preTimer: new Date().getTime(),
        },
        fail: () => {
          removeStorage({
            key: String(key),
          });
        },
      });
  } catch (error) {
    console.error(error);
    removeStorage({
      key: String(key),
    });
  }
};

// 获取缓存
const getCache = ({
  key,
  supportStorage,
  cacheVersion,
  cacheKeyParams,
  onGetCacheBefore,
  onGetCacheAfter,
  isReal,
}: {
  key: CachedKey;
  cacheVersion?: string;
  supportStorage?: boolean;
  cacheKeyParams?: any; // Add cacheKeyParams property to the type definition
  /**获取缓存前 */
  onGetCacheBefore?: Function;
  /**获取缓存后 */
  onGetCacheAfter?: Function;
  /**是否真实获取数据 */
  isReal?: boolean;
}) => {
  isReal && onGetCacheBefore && onGetCacheBefore();
  const response = supportStorage
    ? getStorageSync(String(key))
    : (cache.get(String(key)) as any);
  isReal && onGetCacheAfter && onGetCacheAfter();
  if (response.cacheTime && response.preTimer) {
    const currentTime = new Date().getTime();
    if (
      currentTime - response.cacheTime > response.preTimer ||
      (cacheVersion &&
        response.cacheVersion &&
        cacheVersion !== response.cacheVersion)
    ) {
      cache.delete(key);
      supportStorage &&
        removeStorage({
          key: String(key),
        });
      return null;
    }
  }

  if (!response) {
    return null;
  }

  if (!response.isCacheParams || !cacheKeyParams) {
    return response;
  }

  return response[`${key}-${Object.values(cacheKeyParams).join("-")}`];
};

// 清除缓存
const clearCache = (key?: string | string[]) => {
  if (key) {
    const cacheKeys = Array.isArray(key) ? key : [key];
    cacheKeys.forEach((cacheKey) => cache.delete(cacheKey));
    cacheKeys.map((cacheKey) => removeStorage({ key: cacheKey }));
  } else {
    cache.clear();
  }
};

// 过滤缓存数据
const cacheFilterDataResponse: (_: any) => any = ({
  key,
  cachedData,
  fn = () => {},
  cacheKeyParams,
  supportStorage,
  cacheKeyDataNum = 3,
}: {
  key: string;
  cachedData: CachedData;
  fn: (data: any) => any;
  cacheKeyParams?: any;
  supportStorage?: boolean;
  cacheKeyDataNum?: number;
}) => {
  let cacheDataResponse = {} as any;
  const cacheDataCopy = cloneDeep(cachedData);
  cacheDataCopy.data = fn(cacheDataCopy.data);

  if (!cacheDataCopy.data) {
    return;
  }

  if (Object.keys(cacheDataCopy).length) {
    const data = getCache({
      key,
      supportStorage,
    }) as any;

    cacheDataResponse = data?.isCacheParams
      ? data
      : {
          isCacheParams: true,
        };

    // 判断是否超过缓存数量，超过则删除最早的缓存
    if (Object.keys(cacheDataResponse).length >= cacheKeyDataNum + 4) {
      const list = Object.keys(cacheDataResponse).filter(
        (res) => res !== "isCacheParams" && res !== "timer"
      );
      list.sort((a, b) => {
        return cacheDataResponse[a].time - cacheDataResponse[b].time;
      });
      if (list.length) {
        const firstItem = list[0];
        if (firstItem) {
          delete cacheDataResponse[firstItem];
        }
      }
    }

    // 缓存数据
    if (cacheKeyParams) {
      cacheDataResponse[
        `${key}-${Object.values({
          ...(cacheKeyParams || {}),
        }).join("-")}`
      ] = {
        ...cacheDataCopy,
        time: new Date().getTime(),
      };
    } else {
      cacheDataResponse[key] = {
        ...cacheDataCopy,
        time: new Date().getTime(),
      };
    }
  } else {
    cacheDataResponse = cacheDataCopy;
  }
  return {
    cacheDataResponse,
    cacheDataCopy,
  };
};

export { getCache, setCache, clearCache, cacheFilterDataResponse };
