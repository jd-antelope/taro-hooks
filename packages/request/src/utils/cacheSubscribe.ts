type Listener = (data: any) => void;
const listeners: Record<string, Listener[]> = {};

// 触发 cache 变化
const trigger = (key: string, data: any) => {
  (listeners[key] ?? []).forEach((item) => item(data));
};

// 订阅 cache 变化
const subscribe = (key: string, listener: Listener) => {
  listeners[key] = listeners[key] ?? [];
  listeners[key]?.push(listener);

  return function unsubscribe() {
    const index = listeners[key]?.indexOf(listener);
    if (index !== undefined) {
      listeners[key]?.splice(index, 1);
    }
  };
};

export { trigger, subscribe };
