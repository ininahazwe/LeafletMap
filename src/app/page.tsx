"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Menu } from "lucide-react";
import alert from "../../public/alert.svg";

// Hooks
import { useAllCountries } from "@/hooks/useAllCountriesData";
import { useWordPressAlerts } from "@/hooks/useWordPressAlerts";

// Désactiver SSR pour TOUS les composants qui utilisent window/document
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
const CountryModal = dynamic(() => import("@/components/CountryModal"), { ssr: false });
const AlertCarousel = dynamic(() => import("@/components/AlertCarousel"), { ssr: false });

export default function Page() {
    const [selectedCountryIso3, setSelectedCountryIso3] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // S'assurer que le composant est monté côté client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [showIntro, setShowIntro] = useState(true);
    const [introFading, setIntroFading] = useState(false);

    // Fonction de fermeture avec fade
    const closeIntro = () => {
        setIntroFading(true);
        setTimeout(() => setShowIntro(false), 300);
    };

    // Auto-fermeture après 10s
    useEffect(() => {
        const timer = setTimeout(() => closeIntro(), 8000);
        return () => clearTimeout(timer);
    }, []);

    // Données pays
    const { countries, loading, error } = useAllCountries();

    // Données WordPress alertes
    const { alerts } = useWordPressAlerts();

    // Enrichir les alertes avec les noms de pays
    const alertsWithCountryNames = useMemo(() => {
        return alerts.map(alert => ({
            ...alert,
            countryName: alert.countryIso3
                ? countries.find(c => c.iso_a3.toUpperCase() === alert.countryIso3?.toUpperCase())?.name_fr
                : undefined
        }));
    }, [alerts, countries]);

    // Ouvre le modal + replie la sidebar
    const handleCountryClick = (iso3: string) => {
        setSelectedCountryIso3(iso3);
        setIsModalOpen(true);
        setSidebarOpen(false);
        setMobileMenuOpen(false);
    };

    // Ferme le modal + redéplie la sidebar
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSidebarOpen(true);
    };

    // Scores démos
    const scoresByIso3 = useMemo(() => {
        return countries.reduce((acc, country) => {
            const hash = country.iso_a3.split("").reduce((a, b) => {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
            const score = 30 + (Math.abs(hash) % 66);
            acc[country.iso_a3.toUpperCase()] = score;
            return acc;
        }, {} as Record<string, number>);
    }, [countries]);

    // Tooltip info
    const tooltipInfoByIso3 = useMemo(() => {
        return countries.reduce((acc, country) => {
            if (country.tooltip_info) {
                acc[country.iso_a3.toUpperCase()] = country.tooltip_info;
            }
            return acc;
        }, {} as Record<string, string>);
    }, [countries]);

    // Filtrage pour la recherche
    const filteredCountries = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return countries;
        return countries.filter(
            (c) =>
                c.name_fr.toLowerCase().includes(q) ||
                c.iso_a3.toLowerCase().includes(q)
        );
    }, [countries, searchTerm]);

    const countriesByRegion = useMemo(() => {
        return filteredCountries.reduce((acc, c) => {
            const region = c.region || "Non spécifiée";
            (acc[region] ||= []).push(c);
            return acc;
        }, {} as Record<string, typeof countries>);
    }, [filteredCountries]);

    const getCountryColorByISO3 = (iso3: string): string => {
        const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"];
        const hash = iso3
            .split("")
            .reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) & acc, 0);
        return colors[Math.abs(hash) % colors.length];
    };

    // Ne rien rendre tant que pas monté côté client
    if (!isMounted) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white">
            {/* LOGO en haut-gauche */}
            <div className="pointer-events-none fixed top-6 left-6 z-[1400] flex items-center">
                <div className="pointer-events-auto px-4 py-3">
                    <Link href="https://mfwa.org/" target="_blank" rel="noopener noreferrer">
                        <Image
                            src="/logo.png"
                            width={160}
                            height={44}
                            alt="West Africa Mediascape - Media Freedom Map"
                            priority
                        />
                    </Link>
                </div>
                <h1 className="text-xl font-bold hidden sm:block">West Africa Mediascape</h1>
            </div>

            {/* BANDEAU INTRO - sous le logo */}
            {showIntro && (
                <div
                    className={`fixed top-40 left-6 right-6 md:right-[360px] z-[1350] transition-all duration-300 ${
                        introFading ? 'opacity-0 translate-y-[-10px]' : 'opacity-100 translate-y-0'
                    }`}
                >
                    <div className="introduction sequential-appear">
                        <button
                            onClick={closeIntro}
                            className="close-button"
                            style={{ background: "none" }}
                            aria-label="Close introduction banner"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                        <Image
                            src={alert}
                            alt=""
                            width={32}
                            height={32}
                            aria-hidden="true"
                        />
                        <div>
                            <h2 className="font-bold">About West Africa Mediascape</h2>
                            <p>
                                An interactive map showcasing media environments across 16 West African countries.
                                Explore press freedom, legal frameworks, media regulators, and journalist associations.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* CARTE PRINCIPALE */}
            <div
                className="absolute inset-0"
                role="region"
                aria-label="Interactive map of West African press freedom and media environment"
            >
                {loading ? (
                    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading map data...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="w-full h-full flex items-center justify-center bg-red-50">
                        <div className="text-center text-red-600">
                            <p className="font-medium">Error loading map</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                ) : (
                    <MapView
                        scoresByIso3={scoresByIso3}
                        onCountryClick={handleCountryClick}
                        zoomToCountry={isModalOpen ? selectedCountryIso3 : undefined}
                        tooltipInfoByIso3={tooltipInfoByIso3}
                    />
                )}
            </div>

            {/* OVERLAY mobile */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[1450] md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* SIDEBAR flottante */}
            <aside
                className={[
                    "aside-initial-load",
                    "fixed top-6 transition-all duration-300",
                    "inset-x-4 md:inset-x-auto md:right-6",
                    mobileMenuOpen ? "translate-x-0 opacity-100 inset-x-4" : "translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto md:inset-x-auto md:right-6",
                    isModalOpen ? "z-[2000]" : "z-[1500]",
                    sidebarOpen && !isModalOpen ? "md:w-80" : "md:w-[420px]",
                ].join(" ")}
                role="complementary"
                aria-label="Country search and list"
            >
                {sidebarOpen && !isModalOpen ? (
                    <div className="overflow-hidden sidebar-custom">
                        {/* Header mobile avec bouton fermer */}
                        <div className="pt-4 md:pt-6 pr-6 pb-2 pl-6">
                            <div className="relative border border-gray-300 rounded-xl">
                                <label htmlFor="country-search" className="sr-only">
                                    Search for a country
                                </label>
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                    size={18}
                                    aria-hidden="true"
                                />
                                <input
                                    id="country-search"
                                    type="text"
                                    placeholder="Search for a country..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-8 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    aria-label="Search countries by name or code"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        style={{ background: "none" }}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hover:text-white"
                                        aria-label="Clear search"
                                        title="Clear search term"
                                    >
                                        <X size={16} aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <nav className="max-h-[60vh] md:max-h-[calc(100vh-480px)] overflow-y-auto" aria-label="West African countries">
                            {Object.entries(countriesByRegion).map(([region, list]) => (
                                <section key={region} className="border-b border-gray-100">
                                    <h2 className="px-6 py-3 bg-gray-50 font-semibold text-sm text-gray-700">
                                        {region}
                                    </h2>
                                    <ul className="list-none m-0 p-0">
                                        {list.map((country) => (
                                            <li key={country.id}>
                                                <button
                                                    onClick={() => handleCountryClick(country.iso_a3)}
                                                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                                        selectedCountryIso3 === country.iso_a3 ? "bg-orange-50" : ""
                                                    }`}
                                                    aria-pressed={selectedCountryIso3 === country.iso_a3}
                                                    title={`Learn more about ${country.name_fr}'s media environment`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                                style={{ backgroundColor:"#ebebeb" }}
                                                                aria-hidden="true"
                                                            />
                                                            <span className="font-bold text-gray-800">
                                                                {country.name_fr}
                                                            </span>
                                                        </div>
                                                        <code className="text-sm text-gray-600">{country.iso_a3}</code>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                            {filteredCountries.length === 0 && (
                                <div className="p-6 text-center text-gray-500">No countries found</div>
                            )}
                        </nav>
                    </div>
                ) : (
                    <div className="relative hidden">
                        <div className="rounded-2xl shadow-xl border border-gray-200 bg-white p-3">
                            <div className="relative">
                                <label htmlFor="country-search-compact" className="sr-only">
                                    Search for a country
                                </label>
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                    aria-hidden="true"
                                />
                                <input
                                    id="country-search-compact"
                                    type="text"
                                    placeholder="Search by country"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-[420px] pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    aria-label="Search countries"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-gray-400 hover:text-gray-600"
                                        aria-label="Clear search"
                                        title="Clear search term"
                                    >
                                        <X size={16} aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {searchTerm.trim().length >= 3 && (
                            <div className="absolute mt-2 w-[420px] max-h-[60vh] overflow-y-auto rounded-xl shadow-2xl border border-gray-200 bg-white transition-all duration-200">
                                {filteredCountries.length === 0 ? (
                                    <div className="p-4 text-sm text-gray-500">No results found</div>
                                ) : (
                                    <ul className="list-none m-0 p-0">
                                        {filteredCountries.map((c) => (
                                            <li key={c.id}>
                                                <button
                                                    onClick={() => handleCountryClick(c.iso_a3)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
                                                    title={`Learn more about ${c.name_fr}`}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <span
                                                            className="w-3.5 h-3.5 rounded-full border border-gray-300"
                                                            style={{ backgroundColor: getCountryColorByISO3(c.iso_a3) }}
                                                            aria-hidden="true"
                                                        />
                                                        <span className="text-gray-800">{c.name_fr}</span>
                                                    </span>
                                                    <code className="text-xs text-gray-500">{c.iso_a3}</code>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* CAROUSEL D'ALERTES EN BAS - caché sur mobile quand menu ouvert */}
            <div className={mobileMenuOpen ? "hidden md:block" : ""}>
                <AlertCarousel alerts={alertsWithCountryNames} isHidden={isModalOpen} />
            </div>

            {/* MODAL bottom sheet */}
            <CountryModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                iso3={selectedCountryIso3}
            />
        </div>
    );
}