import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Quicksand } from 'next/font/google';
import { Providers } from './providers';
import { ConfigProvider } from './config-provider';
import './globals.css';
import Navbar from './navbar';
import NavbarBottom from './navbar-bottom';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
});

const APP_NAME = 'Donde Siempre';
const APP_DEFAULT_TITLE = 'Donde Siempre';
const APP_TITLE_TEMPLATE = '%s – Donde Siempre';
const APP_DESCRIPTION = 'Tiendas locales al alcance de tu mano';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
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
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" dir="ltr" className={quicksand.variable}>
      <head />
      <body
        className={`${quicksand.className} max-sm:[&::-webkit-scrollbar]:hidden flex flex-col min-h-screen`}
      >
        <ConfigProvider
          backendUrl={process.env.BACKEND_URL ?? ''}
          webUrl={process.env.WEB_URL ?? ''}
          dirBack={process.env.DIR_BACKEND ?? ''}
        >
          <Providers>
            <Navbar />
            <div className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col pb-20 sm:pb-0">{children}</div>
            </div>
            <NavbarBottom />
          </Providers>
        </ConfigProvider>
      </body>
    </html>
  );
}
