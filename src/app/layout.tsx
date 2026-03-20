import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Healthy Base - Automated PostgreSQL Backup Creator",
  description:
    "Healthy Base is an app that helps automate the creation of PostgreSQL backups.",
  icons: {
    icon: "/logo.svg",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className={geist.className}>
        {children}
        <Toaster />
        <script defer src="https://umami.healthybase.cloud/script.js" data-website-id="1ce22985-3b2d-48f2-981d-a28b4ef69f7c"></script>
      </body>
    </html>
  );
}