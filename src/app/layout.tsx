import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Raleway, Cinzel } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { GoogleAnalytics } from "@next/third-parties/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-inter",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-raleway",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: "The Vault",
  description: "Exclusividad • Tradición • Futuro",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${inter.variable} ${raleway.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#141210] text-[#EFEBE4]">
        <ClientProviders>{children}</ClientProviders>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}
