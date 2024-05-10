import { useRef } from 'react';

function useLatest<T>(value: T): ReturnType<typeof useRef<T>> {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

export default useLatest;
