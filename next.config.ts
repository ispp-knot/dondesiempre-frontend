import { spawnSync } from 'node:child_process';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants.js';
import { NextConfig } from 'next';

export default async function config(phase: string, _defaultConfig: NextConfig) {
  const nextConfig: NextConfig = {
    output: 'standalone',
  };

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    // This is optional!
    // A revision helps Serwist version a precached page. This
    // avoids outdated precached responses being used. Using
    // `git rev-parse HEAD` might not the most efficient way
    // of determining a revision, however. You may prefer to use
    // the hashes of every extra file you precache.
    const _revision =
      spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout ?? crypto.randomUUID();

    const withSerwist = (await import('@serwist/next')).default({
      additionalPrecacheEntries: [],
      swSrc: 'app/sw.ts',
      swDest: 'public/sw.js',
    });
    return withSerwist(nextConfig);
  }

  return nextConfig;
}
