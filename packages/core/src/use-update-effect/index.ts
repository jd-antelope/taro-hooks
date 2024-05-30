import { useEffect } from 'react';
import { createUpdateEffect } from '../create-update-effect';

const useUpdateEffect: typeof useEffect = createUpdateEffect(useEffect);

export default useUpdateEffect;
