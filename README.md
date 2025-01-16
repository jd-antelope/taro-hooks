# taro hooks
一款基于 Taro 开发的 Hooks.

引用
```shell
npm i @jd-antelope/taro-hooks
npm i @jd-antelope/use-request
# yarn
yarn add @jd-antelope/taro-hooks
yarn add @jd-antelope/use-request
# pnpm
pnpm add @jd-antelope/taro-hooks
pnpm add @jd-antelope/use-request
```

## base taro-hooks
+ useLatest 返回当前最新值的 Hook
+ useUnmount 在组件卸载（unmount）时执行的 Hook
+ useCreation
+ useMemoizedFn 持久化 function 的 Hook，一般情况下，可以使用 useMemoizedFn 完全代替 useCallback
+ useMount 只在组件初始化时执行的 Hook
+ useUpdate 会返回一个函数，调用该函数会强制组件重新渲染
+ useUpdateEffect 用法等同于 useEffect，但是会忽略首次执行，只在依赖更新时执行
+ useVisible 当需要根据页面显隐进行判断

## use-request
```js
import useRequest from '@jd-antelope/use-request';
const { data, error, loading } = useRequest(getData, {
  
});
```
手动触发
```js
const { loading, run } = useRequest(getData, {
  manual: true,
});
```