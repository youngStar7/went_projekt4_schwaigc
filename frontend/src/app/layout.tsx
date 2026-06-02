import type { Metadata } from "next";
import "./globals.css";
import { fetchNavigation } from "@/lib/sulu";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Sulu Website",
  description: "Powered by Sulu CMS + Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = await fetchNavigation("main", "en");

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <a href="/" className="site-logo">Sulu Site</a>
            <Navigation items={navItems} />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
