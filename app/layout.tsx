import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import OfflineIndicator from "../components/OfflineIndicator";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlayStation Shop Admin",
  description: "Manage consoles, players, games, and sessions",
  manifest: "/manifest.json",
  themeColor: "#2D1B69",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PS Shop",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = cookieStore.get("ps-shop-session");
  const isAuthenticated = !!session;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <link rel="manifest" href="/manifest.json?v=4" />
        <meta name="theme-color" content="#2D1B69" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/web-app-manifest-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PS Shop" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isAuthenticated ? (
          <div className="flex flex-col lg:flex-row min-h-screen">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 min-h-screen overflow-x-hidden">{children}</main>
          </div>
        ) : (
          children
        )}
        <OfflineIndicator />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                  (registration) => {
                    console.log('Service Worker registered:', registration.scope);
                  },
                  (error) => {
                    console.log('Service Worker registration failed:', error);
                  }
                );
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
