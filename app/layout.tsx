import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import FloatingHearts from "@/components/ui/FloatingHearts";


import { AlertProvider } from "@/components/ui/AlertProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dating & Map App",
  description: "Web dating and map tracking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-white min-h-[100dvh] relative`}>
        <AlertProvider>
          <FloatingHearts />
          <TopNav />
          <main className="z-10 relative">
            {children}
          </main>
        </AlertProvider>
      </body>
    </html>
  );
}