import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Voxora — Your Voice, Engineered.",
  description:
    "Transform text into lifelike speech with AI. Design unique voices, clone existing ones, or let AI craft the perfect tone. 30+ languages supported.",
  keywords: [
    "text to speech",
    "TTS",
    "AI voice",
    "voice cloning",
    "voice design",
    "speech synthesis",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-surface text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
