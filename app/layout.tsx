import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { ClerkProvider } from "@clerk/nextjs";
import { RealityProvider } from "@/context/RealityThemeContext";
import DripegoLoader from "@/components/dripego/DripegoLoader";
import CustomCrosshair from "@/components/sutera/CustomCrosshair";
import TechnicalGridBackground from "@/components/sutera/TechnicalGridBackground";
import CartDrawer from "@/components/CartDrawer";
import CartToast from "@/components/CartToast";

export const metadata: Metadata = {
  title: "DRIPEGO — Presence, By Design // Luxury Streetwear Atelier",
  description:
    "We engineer garments that shape how bodies and spaces connect. From heavyweight 500 GSM drops to architectural silhouettes, our cut lives at the intersection of textile physics and unapologetic presence.",
  metadataBase: new URL("https://dripego.com"),
  openGraph: {
    title: "DRIPEGO — Presence, By Design",
    description:
      "We engineer garments that shape how bodies and spaces connect. Architectural luxury streetwear for those who stopped asking for permission.",
    siteName: "DRIPEGO",
    images: [
      {
        url: "/models/hero_model.png",
        width: 2048,
        height: 1365,
        alt: "DRIPEGO Drop 001 Campaign",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DRIPEGO — Presence, By Design",
    description:
      "Luxury streetwear engineered at the intersection of textile physics and architectural silhouette.",
    images: ["/models/hero_model.png"],
  },
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
    <ClerkProvider>
      <html lang="en" className="h-full scroll-smooth" data-reality="lab-light">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full antialiased transition-colors duration-400">
          <RealityProvider>
            <DripegoLoader />
            <TechnicalGridBackground />
            <CustomCrosshair />
            <SmoothScroll />
            <CartToast />
            <CartDrawer />
            {children}
          </RealityProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
