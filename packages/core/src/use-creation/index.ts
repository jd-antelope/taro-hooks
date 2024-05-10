import { useRef } from 'react';
import type { DependencyList } from '../types';
import { depsAreSame } from '../utils';

export default function useCreation<T>(factory: () => T, deps: DependencyList) {
  const creation = useRef(
    {
      deps,
      obj: undefined as undefined | T,
      initialized: false,
    },
    // @ts-ignore
    true,
  );
  if (
    creation.current.initialized === false ||
    !depsAreSame(creation.current.deps, deps)
  ) {
    creation.current = {
      deps,
      obj: factory(),
      initialized: true,
    };
  }
  return creation.current.obj as T;
}
