import  type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const geistSans = Geist({
    variable: "--fonts-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--fonts-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#2E4057",
};

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default: "West Africa Mediascape — Interactive Press Freedom Map",
        template: "%s | West Africa Mediascape",
    },
    description: "Interactive map visualizing media freedom, press environment, and digital rights across 16 West African countries. Explore legal frameworks, media regulators, and journalism landscapes.",

    keywords: [
        "media freedom",
        "press freedom",
        "West Africa",
        "journalism",
        "Reporters Without Borders",
        "RSF",
        "media environment",
        "digital rights",
        "Africa",
        "press",
    ],

    authors: [
        {
            name: SITE_NAME,
            url: SITE_URL,
        },
    ],
    creator: SITE_NAME,
    publisher: SITE_NAME,

    openGraph: {
        type: "website",
        locale: "en_US",
        alternateLocale: ["fr_FR"],
        url: SITE_URL,
        siteName: SITE_NAME,
        title: "West Africa Mediascape — Interactive Press Freedom Map",
        description: "Explore media freedom and press environment across 16 West African countries",
        // TODO: remplacer par de vraies images og-image.png (1200x630) / og-image-square.png
        // une fois produites — /logo.png sert de repli pour éviter un aperçu social cassé.
        images: [
            {
                url: "/logo.png",
                width: 800,
                height: 220,
                alt: "West Africa Mediascape",
                type: "image/png",
            },
        ],
    },

    twitter: {
        card: "summary",
        title: "West Africa Mediascape",
        description: "Interactive map of press freedom across West Africa",
        images: ["/logo.png"],
    },

    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },

    alternates: {
        canonical: SITE_URL,
    },

    icons: {
        icon: "/favicon.ico",
    },

    category: "News & Media",
    classification: "Media Freedom Monitoring",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            {/* Preconnect aux ressources externes */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://flagcdn.com" />
            <link rel="preconnect" href="https://cdnjs.cloudflare.com" />

            {/* DNS prefetch */}
            <link rel="dns-prefetch" href="https://api.wordpress.com" />

            {/* JSON-LD Schema (Organisation) — signal d'entité/confiance pour Google et les moteurs IA */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        name: SITE_NAME,
                        url: SITE_URL,
                        logo: `${SITE_URL}/logo.png`,
                        description:
                            "Interactive map visualizing media freedom and press environment across West Africa",
                        parentOrganization: {
                            "@type": "Organization",
                            name: "Media Foundation for West Africa",
                            url: "https://mfwa.org",
                        },
                    }),
                }}
            />

            {/* JSON-LD Schema (WebApplication) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        name: SITE_NAME,
                        description: "Interactive press freedom monitoring map",
                        url: SITE_URL,
                        applicationCategory: "NewsApplication",
                        offers: {
                            "@type": "Offer",
                            price: "0",
                            priceCurrency: "USD",
                        },
                    }),
                }}
            />
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <div className="grid-lines">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div className="show-tablet"></div>
            <div className="show-tablet"></div>
            <div className="show-tablet"></div>
            <div className="show-tablet"></div>
            <div className="show-desktop"></div>
            <div className="show-desktop"></div>
            <div className="show-desktop"></div>
            <div className="show-desktop"></div>
        </div>
        <main role="main">
            {children}
        </main>

        {/* Google Analytics (optionnel) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
            <>
                <script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
                    }}
                />
            </>
        )}
        </body>
        </html>
    );
}