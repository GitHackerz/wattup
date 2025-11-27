import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WattUP - Smart Energy Management Solutions",
  description: "Transform your energy management with WattUP's advanced electricity monitoring system. Real-time insights, predictive analytics, and anomaly detection to reduce costs by up to 30%.",
  keywords: ["electricity monitoring", "energy management", "smart grid", "energy analytics", "power monitoring", "energy efficiency", "IoT energy", "predictive maintenance", "WattUP"],
  authors: [{ name: "WattUP Team" }],
  creator: "WattUP",
  publisher: "WattUP Solutions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wattup.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wattup.com',
    title: 'WattUP - Smart Energy Management',
    description: 'Advanced electricity monitoring with real-time insights, predictive analytics, and anomaly detection. Reduce energy costs by up to 30%.',
    siteName: 'WattUP',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WattUP Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WattUP - Smart Energy Management',
    description: 'Advanced electricity monitoring with real-time insights and predictive analytics. Reduce energy costs by up to 30%.',
    creator: '@wattup_official',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
