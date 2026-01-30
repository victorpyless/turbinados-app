import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google"; // Import Google Fonts
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Turbinados App",
  description: "Workflow Management for Automotive Channel",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Turbinados'
  },
  formatDetection: {
    telephone: false
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-garage-dark text-white`}
      >
        {children}
      </body>
    </html>
  );
}
