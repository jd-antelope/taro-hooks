import { default as fs } from 'fs-extra'
import type { Format, Options } from 'tsup'

import path from 'path'

type GetConfig = Omit<
  Options,
  'bundle' | 'clean' | 'dts' | 'entry' | 'format'
> & {
  entry?: string[]
  dev?: boolean
  noExport?: string[]
}

export function getConfig({ dev, noExport, ...options }: GetConfig): Options {
  return {
    entry: ['src/index.ts'],
    bundle: true,
    clean: true,
    dts: true,
    format: [(process.env.FORMAT as Format) ?? 'esm'],
    splitting: true,
    target: 'es2021',
    sourcemap: true,
    shims: true,
    async onSuccess() {
      console.log('onSuccess')
    },
    ...options,
  }
}