import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import CricketFab from "@/components/CricketFab";

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
      <body className="antialiased bg-navy-950 text-ivory-50">
        <Preloader />
        <Navbar />
        <main className="pt-[64px]">{children}</main>
        <Footer />
        <CricketFab />
      </body>
    </html>
  );
}
