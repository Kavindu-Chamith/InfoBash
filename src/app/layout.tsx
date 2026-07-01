import type { Metadata } from "next";
import { Teko, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "InfoBash v5.0 — Faculty of Computing Cricket Tournament",
  description:
    "Register your team for InfoBash v5.0, the Faculty of Computing's annual one-day cricket tournament at Sabaragamuwa University of Sri Lanka.",
  icons: { icon: "/images/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${teko.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased bg-navy-950 text-ivory-50`}
      >
        <Navbar />
        <main className="pt-[64px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
