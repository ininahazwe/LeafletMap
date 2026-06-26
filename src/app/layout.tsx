import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    metadataBase: new URL("https://west-africa-mediascape.com"), // À remplacer par ton domaine réel

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
            name: "West Africa Mediascape",
            url: "https://west-africa-mediascape.com",
        },
    ],
    creator: "West Africa Mediascape",
    publisher: "West Africa Mediascape",

    openGraph: {
        type: "website",
        locale: "en_US",
        alternateLocale: ["fr_FR"],
        url: "https://west-africa-mediascape.com",
        siteName: "West Africa Mediascape",
        title: "West Africa Mediascape — Interactive Press Freedom Map",
        description: "Explore media freedom and press environment across 16 West African countries",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "West Africa Media Freedom Map",
                type: "image/png",
            },
            {
                url: "/og-image-square.png",
                width: 800,
                height: 800,
                alt: "West Africa Mediascape Logo",
                type: "image/png",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "West Africa Mediascape",
        description: "Interactive map of press freedom across West Africa",
        images: ["/og-image.png"],
        creator: "@mediascape_wa",
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
        canonical: "https://west-africa-mediascape.com",
        languages: {
            en: "https://west-africa-mediascape.com/en",
            fr: "https://west-africa-mediascape.com/fr",
        },
    },

    icons: {
        icon: "/favicon.ico",
        apple: "/apple-icon.png",
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

            {/* JSON-LD Schema (Organisation) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        name: "West Africa Mediascape",
                        url: "https://west-africa-mediascape.com",
                        logo: "https://west-africa-mediascape.com/logo.png",
                        description:
                            "Interactive map visualizing media freedom and press environment across West Africa",
                        sameAs: [
                            "https://twitter.com/mediascape_wa",
                            "https://linkedin.com/company/mediascape",
                        ],
                        contactPoint: {
                            "@type": "ContactPoint",
                            contactType: "Customer Support",
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
                        name: "West Africa Mediascape",
                        description: "Interactive press freedom monitoring map",
                        url: "https://west-africa-mediascape.com",
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