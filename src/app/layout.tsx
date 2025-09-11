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
  title: {
    default: "Azrafqueen Store - Fashion Islami & Barang Religius",
    template: "%s | Azrafqueen Store"
  },
  description: "Toko online terpercaya untuk fashion Islami berkualitas premium. Menyediakan abaya, hijab, pashmina, Al-Qur'an, dan perlengkapan ibadah untuk keluarga Muslim.",
  keywords: [
    "abaya",
    "hijab", 
    "kerudung",
    "pashmina",
    "al-quran",
    "baju muslim",
    "fashion islami",
    "toko muslim",
    "pakaian syari"
  ],
  authors: [{ name: "Azrafqueen Store" }],
  creator: "Azrafqueen Store",
  publisher: "Azrafqueen Store",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Azrafqueen Store",
    title: "Azrafqueen Store - Fashion Islami & Barang Religius",
    description: "Toko online terpercaya untuk fashion Islami berkualitas premium.",
    images: [
      {
        url: "/images/og-image.jpg", // TODO: Add this image
        width: 1200,
        height: 630,
        alt: "Azrafqueen Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Azrafqueen Store - Fashion Islami & Barang Religius",
    description: "Toko online terpercaya untuk fashion Islami berkualitas premium.",
    images: ["/images/og-image.jpg"], // TODO: Add this image
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    // TODO: Add verification codes when ready
    // google: "your-google-verification-code",
    // other: "your-other-verification-code",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}