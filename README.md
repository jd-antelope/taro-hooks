# taro hooks
一款基于 Taro 开发的 Hooks.

引用
```shell
npm i @qzc/taro-hooks
npm i @qzc/use-request
# yarn
yarn add @qzc/taro-hooks
yarn add @qzc/use-request
# pnpm
pnpm add @qzc/taro-hooks
pnpm add @qzc/use-request
```

## base taro-hooks
+ useLatest,
+ useUnmount,
+ useCreation,
+ useMemoizedFn,
+ useMount,
+ useUpdate

## use-request
```js
import useRequest from '@qzc/use-request';
const { data, error, loading } = useRequest(getData, {
  
});
```
手动触发
```js
const { loading, run } = useRequest(getData, {
  manual: true,
});
```

### Result

| 参数         | 说明                                                     | 类型                            |
| ------------ | ------------------------------------------------------- |-------------------------------- |
| data         | service 返回的数据                                        | `TData` \| `undefined`      |
| error        | service 抛出的异常                                        | `Error` \| `undefined`     |
| loading      | service 是否正在执行                                     | `boolean`                    |
| params       | 当次执行的 service 的参数数组。                            | `TParams` \| `[]`           |
| run          | 手动触发 service 执行                                    | `(...params: TParams) => void`   |
| runAsync     | 与 `run` 用法一致，但返回的是 Promise，需要自行处理异常。   | `(...params: TParams) => Promise<TData>`  |
| refresh      | 使用上一次的 params，重新调用 `run`                     | `() => void`    |
| refreshAsync | 使用上一次的 params，重新调用 `runAsync`                | `() => Promise<TData>`     |
| mutate       | 直接修改 `data`                                    | `(data?: TData / ((oldData?: TData) => (TData / undefined))) => void` |
| cancel       | 取消当前正在进行的请求                                | `() => void`    | 

### Options

| 参数          | 说明                           | 类型                                                 | 默认值  |
| ------------- | ------------------------------ | ---------------------------------------------------- | ------- |
| manual        | 默认 `false`。                      | `boolean`                                            | `false` |
| defaultParams | 首次默认执行时，传递给 service 的参数   |                   `TParams`                | -       |
| onBefore      | service 执行前触发             | `(params: TParams) => void`                          | -       |
| onSuccess     | service resolve 时触发         | `(data: TData, params: TParams) => void`             | -       |
| onError       | service reject 时触发          | `(e: Error, params: TParams) => void`                | -       |
| onFinally     | service 执行完成时触发         | `(params: TParams, data?: TData, e?: Error) => void` | -       |
| cacheFilterData | 缓存数据过滤                 | `(data: CachedData<TData, TParams>) => void`  | - |
| supportStorage | 是否支持Storage              ｜ `boolean` | `false` |
| cacheKeyParams | 缓存标识参数 |  `any` | - |
| cacheKeyDataNum | 缓存数量 | `number` | - |
