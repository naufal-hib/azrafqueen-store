import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter, Amiri } from "next/font/google";
import { SessionProvider } from "next-auth/react"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Azraf Queen Store - Premium Islamic Fashion",
    template: "%s | Azraf Queen Store"
  },
  description: "Toko online terpercaya untuk fashion muslimah berkualitas premium",
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

  verification: {
    // TODO: Add verification codes when ready
    // google: "your-google-verification-code",
    // other: "your-other-verification-code",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${inter.variable} ${amiri.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}