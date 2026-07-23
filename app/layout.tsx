import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import FloatingHearts from "@/components/ui/FloatingHearts";


import { AlertProvider } from "@/components/ui/AlertProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import GlobalMatchNotifier from "@/components/GlobalMatchNotifier";
import ActiveTracker from "@/components/ActiveTracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rizz App",
  description: "Dating and matching app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white min-h-[100dvh] relative transition-colors`}>
        <ThemeProvider>
          <LanguageProvider>
            <AlertProvider>
              <ActiveTracker />
              <FloatingHearts />
              <TopNav />
              <GlobalMatchNotifier />
              <main className="z-10 relative">
                {children}
              </main>
            </AlertProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}