import type {
  FetchState,
  Options,
  PluginReturn,
  Service,
  Subscribe,
  MutableRefObject,
} from "./types";

export default class Fetch<TData, TParams extends any[]> {
  pluginImpls: PluginReturn<TData, TParams>[] | undefined;

  count: number = 0;

  state: FetchState<TData, TParams> = {
    loading: false,
    params: undefined,
    data: undefined,
    error: undefined,
    cacheKeyParams: undefined,
    isReal: undefined,
  };

  constructor(
    public serviceRef: MutableRefObject<Service<TData, TParams>>,
    public options: Options<TData, TParams>,
    public subscribe: Subscribe,
    public initState: Partial<FetchState<TData, TParams>> = {}
  ) {
    this.state = {
      ...this.state,
      loading: !!options.initLoading,
      ...initState,
    };
  }

  setState(s: Partial<FetchState<TData, TParams>> = {}) {
    this.state = {
      ...this.state,
      ...s,
    };
    this.subscribe();
  }

  runPluginHandler(event: keyof PluginReturn<TData, TParams>, ...rest: any[]) {
    // @ts-ignore
    const r = this.pluginImpls.map((i) => i[event]?.(...rest)).filter(Boolean);
    return Object.assign({}, ...r);
  }

  async runAsync(...params: any): Promise<TData> {
    if (params?.[0]?.cacheKeyParams) {
      this.setState({
        cacheKeyParams: params[0].cacheKeyParams,
      });
    }

    this.count += 1;
    const currentCount = this.count;
    // 得到缓存状态前
    if (!params?.[0]?.onlySetCache && params?.[0]?.onGetCacheBefore) {
      params?.[0]?.onGetCacheBefore();
    }
    const {
      stopNow = false,
      returnNow = false,
      ...state
    } = this.runPluginHandler("onBefore", params);

    if (!params?.[0]?.onlySetCache && params?.[0]?.onGetCacheAfter) {
      params?.[0]?.onGetCacheAfter(state);
    }

    // stop request
    if (stopNow) {
      return new Promise(() => {});
    }

    this.setState({
      loading: true,
      params,
      ...state,
    });

    // return now
    if (returnNow || params?.[0]?.returnNow) {
      return Promise.resolve(state.data);
    }

    this.options.onBefore?.(params);

    try {
      // replace service
      let { servicePromise } = this.runPluginHandler(
        "onRequest",
        this.serviceRef.current,
        params
      );

      if (!servicePromise) {
        servicePromise = this.serviceRef.current(...params);
      }

      if (params?.[0]?.getResBefore) {
        params?.[0]?.getResBefore(state);
      }

      const res = await servicePromise;

      if (params?.[0]?.getResAfter) {
        params?.[0]?.getResAfter(state);
      }

      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }
      if (!this.options.cacheKey) {
        // 是否启动切片
        if (
          this.options.sliceRender &&
          typeof this.options.sliceRender === "function"
        ) {
          this.options.sliceRender(res, this);
        } else {
          this.setState({
            data: res,
            error: undefined,
            loading: false,
            isReal: true,
          });
        }
      }

      this.options.onSuccess?.(res, params);
      this.runPluginHandler("onSuccess", res, params);

      this.options.onFinally?.(params, res, undefined);

      if (currentCount === this.count) {
        this.runPluginHandler("onFinally", params, res, undefined);
      }

      return res;
    } catch (error) {
      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }

      this.setState({
        error: error as Error,
        loading: false,
      });

      this.options.onError?.(error as Error, params);
      this.runPluginHandler("onError", error as Error, params);

      this.options.onFinally?.(params, undefined, error as Error);

      if (currentCount === this.count) {
        this.runPluginHandler("onFinally", params, undefined, error);
      }

      throw error;
    }
  }

  run(...params: TParams) {
    this.runAsync(...params).catch((error) => {
      if (!this.options.onError) {
        console.error(error);
      }
    });
  }

  cancel() {
    this.count += 1;
    this.setState({
      loading: false,
    });

    this.runPluginHandler("onCancel");
  }

  refresh() {
    // @ts-ignore
    this.run(...(this.state.params || []));
  }

  refreshAsync() {
    // @ts-ignore
    return this.runAsync(...(this.state.params || []));
  }

  mutate(data?: TData | ((oldData?: TData) => TData | undefined)) {
    const targetData: TData | undefined =
      data instanceof Function ? data(this.state.data) : data;

    this.runPluginHandler("onMutate", targetData);

    this.setState({
      data: targetData,
    });
  }
}
