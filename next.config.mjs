import { fileURLToPath } from 'node:url';

import withPWA from '@ducanh2912/next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createJiti from 'jiti';

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti('./src/libs/Env');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  scope: '/',
  sw: 'sw.js',
  cacheStartUrl: true,
  reloadOnOnline: true,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

/** @type {import('next').NextConfig} */
export default withSentryConfig(
  pwaConfig(
    bundleAnalyzer({
      eslint: {
        dirs: ['.'],
      },
      poweredByHeader: false,
      reactStrictMode: true,
      experimental: {
        serverComponentsExternalPackages: ['@electric-sql/pglite'],
      },
      webpack: (config) => {
        // Exclude SVG from default file-loader
        config.module.rules.forEach((rule) => {
          if (rule.oneOf) {
            rule.oneOf.forEach((oneOf) => {
              if (oneOf.test && oneOf.test.toString().includes('svg')) {
                oneOf.exclude = /\.svg$/;
              }
            });
          }
        });

        // Add SVGR rule for SVG files - default export
        config.module.rules.push({
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        });

        // Handle missing React Native modules that are imported by @metamask/sdk
        config.resolve.fallback = {
          ...config.resolve.fallback,
          '@react-native-async-storage/async-storage': false,
        };

        return config;
      },
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**',
          },
        ],
      },
      async headers() {
        return [
          // Manifest - important for PWA
          {
            source: '/manifest.json',
            headers: [
              {
                key: 'Content-Type',
                value: 'application/manifest+json; charset=utf-8',
              },
              {
                key: 'Cache-Control',
                value: 'public, max-age=0, must-revalidate',
              },
            ],
          },
          // Service Worker - must not redirect
          {
            source: '/sw.js',
            headers: [
              {
                key: 'Content-Type',
                value: 'application/javascript; charset=utf-8',
              },
              {
                key: 'Cache-Control',
                value: 'public, max-age=0, must-revalidate',
              },
            ],
          },
          // Logo - force cache revalidation
          {
            source: '/logo.png',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=0, must-revalidate',
              },
            ],
          },
        ];
      },
    }),
  ),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options
    // FIXME: Add your Sentry organization and project names
    org: 'nextjs-boilerplate-org',
    project: 'nextjs-boilerplate',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Disable Sentry telemetry
    telemetry: false,

    // Automatically delete source maps after upload to Sentry
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
  },
);
