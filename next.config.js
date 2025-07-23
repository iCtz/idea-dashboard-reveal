// next.config.js
import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const configPath = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
//   swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,

  webpack: (config, { isServer, dev }) => {
    config.cache = {
      type: 'filesystem',
      compression: 'brotli',
      maxAge: 86400000,
      buildDependencies: {
        config: [path.join(configPath, 'next.config.js')]
      }
    };
    config.performance = {
      hints: dev ? false : 'warning',
      maxAssetSize: 500000,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false,
      fs: false,
    };

    // Safe watchOptions configuration
    const ignoredPaths = [
		'**/.git/**',
      '**/.next/**',
      '**/node_modules/**',
	  '**/prisma/migrations/**/*',
	  '**/.schemas/**/*'
	];
    //   path.join(configPath, 'prisma/migrations/**/*'),
    //   path.join(configPath, '.schemas/**/*')
    // ]; // Remove any empty strings
    // ].filter(Boolean); // Remove any empty strings

    config.watchOptions = {
      ...config.watchOptions,
	  ignored: ignoredPaths,
    //   ignored: [...existingIgnoredCondition, ...additionalIgnored].filter(pattern => typeof pattern === 'string' && pattern.trim() !== ''),
    };

    return config;
  },

  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
  },

  // Environment variables (if needed)
  env: {
    // Example: API_BASE_URL: process.env.API_BASE_URL,
  },

  // Experimental features (optional)
  experimental: {
    optimizeCss: true, // CSS minification
    scrollRestoration: true,
    // legacyBrowsers: false, // Drop older browsers
  },
};

export default withBundleAnalyzer({
enabled: process.env.ANALYZE === 'true',
})(nextConfig);
