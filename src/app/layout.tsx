import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const metadata: Metadata = {
  metadataBase: new URL("https://krownedhands.com"),
  title: {
    default: "Krowned Hands | Mobile Massage Kingston & Montego Bay, Jamaica",
    template: "%s · Krowned Hands",
  },
  description:
    "Transformational body work by Jordan King. Premium mobile massage and therapeutic bodywork in Kingston, Montego Bay, and across Jamaica: homes, hotels, villas, and resorts. Reserve an in-home or on-property session.",
  keywords: [
    "mobile massage Kingston",
    "massage therapist Montego Bay",
    "in-home massage Jamaica",
    "hotel massage Kingston Jamaica",
    "therapeutic massage Montego Bay",
    "mobile massage therapist Jamaica",
    "Krowned Hands",
  ],
  openGraph: {
    title: "Krowned Hands | Mobile Massage Kingston, Montego Bay & Jamaica",
    description:
      "Therapeutic mobile massage in Kingston, Montego Bay, and across Jamaica. Home, hotel, villa, and resort sessions by reservation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CurrencyProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
        </CurrencyProvider>
      </body>
    </html>
  );
}
