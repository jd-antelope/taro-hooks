import { useEffect, useRef } from 'react';
import { useUpdateEffect, useVisible } from '@jd-antelope/taro-hooks';
import type { Plugin, Timeout } from '../types';

const usePollingPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { pollingInterval, pollingWhenHidden = true },
) => {
  const timerRef = useRef<Timeout>();
  const documentVisible = useVisible();

  const stopPolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useUpdateEffect(() => {
    if (!pollingInterval) {
      stopPolling();
    }
  }, [pollingInterval]);

  useUpdateEffect(() => {
    if (!pollingWhenHidden && documentVisible) {
      fetchInstance.refresh();
    }
  }, [pollingWhenHidden, documentVisible])

  if (!pollingInterval) {
    return {};
  }

  return {
    onBefore: () => {
      stopPolling();
    },
    onFinally: () => {
      // if pollingWhenHidden = false && document is hidden, then stop polling and subscribe revisable
      if (!pollingWhenHidden && !documentVisible) {
        return;
      }

      timerRef.current = setTimeout(() => {
        fetchInstance.refresh();
      }, pollingInterval);
    },
    onCancel: () => {
      stopPolling();
    },
  };
};

export default usePollingPlugin;
