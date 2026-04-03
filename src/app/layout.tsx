import '@/styles/global.css';

import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';

import { KaiaWalletInitializer } from '@/components/kaia-wallet-initializer';
import { Footer } from '@/components/layouts/footer';
import { Header } from '@/components/layouts/header/header';
import { Toaster } from '@/components/ui/toaster';
import { Env } from '@/libs/Env';

import { AuthProvider } from './auth-provider';
import Provider from './provider';

const APP_NAME = 'Forecast';
const APP_DEFAULT_TITLE = 'Forecast';
const APP_TITLE_TEMPLATE = '%s - Forecast';
const APP_DESCRIPTION
  = 'Kaia’s inaugural prediction ecosystem';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(Env.NEXT_PUBLIC_FE_URL),
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: APP_DEFAULT_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ['/logo.png'],
  },
};

const clashDisplay = localFont({
  src: './fonts/ClashDisplay-Variable.ttf',
  variable: '--font-clash-display',
});

const fontSatoshi = localFont({
  src: './fonts/Satoshi-Variable.ttf',
  variable: '--font-satoshi',
});

const baloo2 = localFont({
  src: './fonts/Baloo2-VariableFont_wght.ttf',
  variable: '--font-baloo-2',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout(props: {
  children: React.ReactNode;
  params?: { locale?: string };
}) {
  return (
    <html lang={props.params?.locale || 'en'}>
      <head>
        <KaiaWalletInitializer />
      </head>
      <body
        className={`${clashDisplay.variable} ${fontSatoshi.variable} ${baloo2.variable} flex min-h-screen flex-col`}
      >
        <Suspense>
          <Provider>
            <AuthProvider>
              <Header />
              <main className="flex-1">
                {props.children}
              </main>
              <Footer />
            </AuthProvider>
          </Provider>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
