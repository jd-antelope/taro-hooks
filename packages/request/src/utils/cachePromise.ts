type CachedKey = string | number;
const cachePromise = new Map<CachedKey, Promise<any>>();

// 获取缓存的promise
const getCachePromise = (cacheKey: CachedKey) => {
  return cachePromise.get(cacheKey);
};

// 应该缓存相同的promise，不能是promise.finally
const setCachePromise = (cacheKey: CachedKey, promise: Promise<any>) => {
  // Should cache the same promise, cannot be promise.finally
  // Because the promise.finally will change the reference of the promise
  cachePromise.set(cacheKey, promise);

  // no use promise.finally for compatibility
  promise
    .then((res) => {
      cachePromise.delete(cacheKey);
      return res;
    })
    .catch(() => {
      cachePromise.delete(cacheKey);
    });
};

export { getCachePromise, setCachePromise };
