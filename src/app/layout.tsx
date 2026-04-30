import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../index.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Dead & Injured",
    template: "%s | Dead & Injured",
  },
  description:
    "A focused, monochrome strategy game of pure deduction, tactile drag-to-guess play, and tactical power-ups.",
  applicationName: "Dead & Injured",
  authors: [{ name: "Dead & Injured" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Dead & Injured",
    description: "A focused, monochrome strategy game of pure deduction.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Dead & Injured" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dead & Injured",
    description: "A focused, monochrome strategy game of pure deduction.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0E0E10",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
