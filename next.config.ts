import { spawnSync } from 'node:child_process';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants.js';
import { NextConfig } from 'next';

export default async function config(phase: string, _defaultConfig: NextConfig) {
  // 1. Forzamos el modo standalone para que Azure no necesite todos los node_modules
  const nextConfig: NextConfig = {
    output: 'standalone', 
  };

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    let revision: string;
    
    try {
      // Intentamos obtener el hash de git, pero con un timeout para que no bloquee
      const gitProcess = spawnSync('git', ['rev-parse', 'HEAD'], { 
        encoding: 'utf-8',
        timeout: 5000 // Si en 5 segundos no responde, abortamos
      });
      revision = gitProcess.stdout?.trim() || crypto.randomUUID();
    } catch (e) {
      revision = crypto.randomUUID();
    }

    const withSerwist = (await import('@serwist/next')).default({
      additionalPrecacheEntries: [],
      swSrc: 'app/sw.ts',
      swDest: 'public/sw.js',
      // Pass the revision to Serwist if needed
    });
    
    return withSerwist(nextConfig);
  }

  return nextConfig;
}