// components/country/CountryDetailContent.tsx
// Contenu partagé entre la modal (drawer latéral) et la page indexable /country/[iso3].
// Design minimaliste : fond blanc, pas de blocs colorés, lignes de grille décoratives.
// Layout unique (page = drawer) : lien "← Back to map", header, tabs et contenu dans une
// seule colonne max-w-6xl qui scrolle en un bloc. Seule la nav par ancres est sticky.
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Shield, Users, Building, Gavel, AlertTriangle } from "lucide-react";
import parse from "html-react-parser";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useCountryDetails } from "@/hooks/useCountryDetails";
import { useCountryAlerts, type CountryAlert } from "@/hooks/useCountryAlerts";
import { cleanHtml } from "@/lib/cleanHtml";
import type { MediaEnvironment } from "@/app/types/database";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

type TabKey = "media" | "alerts";

const ALL_TABS: { key: TabKey; label: string }[] = [
  { key: "media", label: "Media Landscape" },
  { key: "alerts", label: "Alerts" },
];

// Sections longues : nav par ancre dédiée, texte pleine largeur.
const DETAIL_SECTION_DEFS: {
  key: keyof MediaEnvironment;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "legal_environment", label: "Legal Environment", icon: Gavel },
  { key: "media_regulators", label: "Media Regulators", icon: Building },
  { key: "journalists_associations", label: "Journalists Associations", icon: Users },
  { key: "internet_freedom", label: "Internet Freedom", icon: Shield },
];

// Sections courtes : regroupées dans une grille de cartes (style "Media Outlets").
const GRID_SECTION_DEFS: { key: keyof MediaEnvironment; label: string }[] = [
  { key: "radio_stations", label: "Radio Stations" },
  { key: "tv_stations", label: "TV Stations" },
  { key: "newspapers", label: "Newspapers" },
  { key: "state_owned_media", label: "State-owned Media" },
  { key: "news_agency", label: "News Agency" },
  { key: "international_media", label: "International Media" },
  { key: "online_media", label: "Online Media" },
  { key: "leading_media", label: "Leading Media" },
];

const MEDIA_OUTLETS_ID = "media-outlets";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export const iso3ToIso2 = (iso3: string): string => {
  const mapping: Record<string, string> = {
    AFG:"AF",ALB:"AL",DZA:"DZ",AND:"AD",AGO:"AO",ARG:"AR",ARM:"AM",AUS:"AU",AUT:"AT",AZE:"AZ",
    BHS:"BS",BHR:"BH",BGD:"BD",BRB:"BB",BLR:"BY",BEL:"BE",BLZ:"BZ",BEN:"BJ",BTN:"BT",BOL:"BO",
    BIH:"BA",BWA:"BW",BRA:"BR",BRN:"BN",BGR:"BG",BFA:"BF",BDI:"BI",KHM:"KH",CMR:"CM",CAN:"CA",
    CPV:"CV",CAF:"CF",TCD:"TD",CHL:"CL",CHN:"CN",COL:"CO",COM:"KM",COG:"CG",COD:"CD",CRI:"CR",
    CIV:"CI",HRV:"HR",CUB:"CU",CYP:"CY",CZE:"CZ",DNK:"DK",DJI:"DJ",DMA:"DM",DOM:"DO",ECU:"EC",
    EGY:"EG",SLV:"SV",GNQ:"GQ",ERI:"ER",EST:"EE",ETH:"ET",FJI:"FJ",FIN:"FI",FRA:"FR",GAB:"GA",
    GMB:"GM",GEO:"GE",DEU:"DE",GHA:"GH",GRC:"GR",GRD:"GD",GTM:"GT",GIN:"GN",GNB:"GW",GUY:"GY",
    HTI:"HT",HND:"HN",HUN:"HU",ISL:"IS",IND:"IN",IDN:"ID",IRN:"IR",IRQ:"IQ",IRL:"IE",ISR:"IL",
    ITA:"IT",JAM:"JM",JPN:"JP",JOR:"JO",KAZ:"KZ",KEN:"KE",KIR:"KI",PRK:"KP",KOR:"KR",KWT:"KW",
    KGZ:"KG",LAO:"LA",LVA:"LV",LBN:"LB",LSO:"LS",LBR:"LR",LBY:"LY",LIE:"LI",LTU:"LT",LUX:"LU",
    MKD:"MK",MDG:"MG",MWI:"MW",MYS:"MY",MDV:"MV",MLI:"ML",MLT:"MT",MHL:"MH",MRT:"MR",MUS:"MU",
    MEX:"MX",FSM:"FM",MDA:"MD",MCO:"MC",MNG:"MN",MNE:"ME",MAR:"MA",MOZ:"MZ",MMR:"MM",NAM:"NA",
    NRU:"NR",NPL:"NP",NLD:"NL",NZL:"NZ",NIC:"NI",NER:"NE",NGA:"NG",NOR:"NO",OMN:"OM",PAK:"PK",
    PLW:"PW",PSE:"PS",PAN:"PA",PNG:"PG",PRY:"PY",PER:"PE",PHL:"PH",POL:"PL",PRT:"PT",QAT:"QA",
    ROU:"RO",RUS:"RU",RWA:"RW",KNA:"KN",LCA:"LC",VCT:"VC",WSM:"WS",SMR:"SM",STP:"ST",SAU:"SA",
    SEN:"SN",SRB:"RS",SYC:"SC",SLE:"SL",SGP:"SG",SVK:"SK",SVN:"SI",SLB:"SB",SOM:"SO",ZAF:"ZA",
    SSD:"SS",ESP:"ES",LKA:"LK",SDN:"SD",SUR:"SR",SWZ:"SZ",SWE:"SE",CHE:"CH",SYR:"SY",TWN:"TW",
    TJK:"TJ",TZA:"TZ",THA:"TH",TLS:"TL",TGO:"TG",TON:"TO",TTO:"TT",TUN:"TN",TUR:"TR",TKM:"TM",
    TUV:"TV",UGA:"UG",UKR:"UA",ARE:"AE",GBR:"GB",USA:"US",URY:"UY",UZB:"UZ",VUT:"VU",VAT:"VA",
    VEN:"VE",VNM:"VN",YEM:"YE",ZMB:"ZM",ZWE:"ZW",
  };
  return mapping[iso3] || iso3.toLowerCase();
};

function categoryDotClass(category: CountryAlert["category"]): string {
  switch (category) {
    case "urgent": return "bg-red-500";
    case "report": return "bg-blue-500";
    default: return "bg-gray-400";
  }
}

export interface CountryDetailContentProps {
  iso3: string;
  /** true = utilisé dans le drawer modal (bouton "Back to map" ferme le drawer,
   *  scroll interne). false = page complète indexable (lien "Back to map" vers /). */
  embedded?: boolean;
  onClose?: () => void;
}

export default function CountryDetailContent({ iso3, embedded = false, onClose }: CountryDetailContentProps) {
  const { countryData, loading, error } = useCountryDetails(iso3);
  const { alerts, years, loading: alertsLoading, error: alertsError } =
    useCountryAlerts(countryData?.iso_a3, countryData?.name_en);

  const tabs = ALL_TABS;

  const [activeTab, setActiveTab] = useState<TabKey>("media");
  const [selectedYear, setSelectedYear] = useState<"all" | number>("all");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sectionElsRef = useRef<Record<string, HTMLElement | null>>({});
  const alertsGridRef = useRef<HTMLDivElement | null>(null);

  // Reset des onglets/filtres quand on change de pays
  useEffect(() => {
    setActiveTab("media");
    setSelectedYear("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso3]);

  const mediaData = countryData?.media_environment;

  const detailSections = useMemo(() => {
    if (!mediaData) return [];
    return DETAIL_SECTION_DEFS.filter((def) => mediaData[def.key])
      .map((def) => ({
        id: slugify(def.label),
        label: def.label,
        icon: def.icon,
        html: cleanHtml(mediaData[def.key] as string),
      }))
      .filter((s) => s.html.length > 0);
  }, [mediaData]);

  const gridItems = useMemo(() => {
    if (!mediaData) return [];
    return GRID_SECTION_DEFS.filter((def) => mediaData[def.key])
      .map((def) => ({
        id: slugify(def.label),
        label: def.label,
        html: cleanHtml(mediaData[def.key] as string),
      }))
      .filter((s) => s.html.length > 0);
  }, [mediaData]);

  // Navigation par ancres : sections longues + un item "Media Outlets" pour la grille,
  // inséré juste après "Journalists Associations" (ou en fin de liste si absente).
  const navItems = useMemo(() => {
    const items: { id: string; label: string }[] = [];
    let inserted = false;
    detailSections.forEach((s) => {
      items.push({ id: s.id, label: s.label });
      if (s.label === "Journalists Associations" && gridItems.length > 0) {
        items.push({ id: MEDIA_OUTLETS_ID, label: "Media Outlets" });
        inserted = true;
      }
    });
    if (!inserted && gridItems.length > 0) {
      items.push({ id: MEDIA_OUTLETS_ID, label: "Media Outlets" });
    }
    return items;
  }, [detailSections, gridItems]);

  const sortedYears = useMemo(() => [...years].sort((a, b) => b - a), [years]);
  const filteredAlerts = useMemo(
    () => (selectedYear === "all" ? alerts : alerts.filter((a) => a.year === selectedYear)),
    [alerts, selectedYear]
  );

  // Scrollspy : le titre en vue devient actif (sections longues + bloc grille)
  useEffect(() => {
    if (activeTab !== "media" || navItems.length === 0) return;

    const triggers = navItems.map((item) =>
      ScrollTrigger.create({
        trigger: sectionElsRef.current[item.id] ?? undefined,
        scroller: embedded ? scrollContainerRef.current ?? undefined : undefined,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) setActiveSectionId(item.id);
        },
      })
    );

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [activeTab, navItems, embedded]);

  // Apparition smooth du texte quand la section entre dans le viewport (une fois).
  useEffect(() => {
    if (activeTab !== "media") return;
    const targets = [...detailSections.map((s) => s.id), ...gridItems.map((g) => g.id)];
    if (targets.length === 0) return;

    const triggers: ScrollTrigger[] = [];
    targets.forEach((id) => {
      const el = sectionElsRef.current[id];
      if (!el) return;
      gsap.set(el, { opacity: 0, y: 16 });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          scroller: embedded ? scrollContainerRef.current ?? undefined : undefined,
          start: "top 90%",
          once: true,
          onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }),
        })
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, [activeTab, detailSections, gridItems, embedded]);

  // Entrée en douceur des cartes d'alertes (GSAP)
  useEffect(() => {
    if (activeTab !== "alerts" || !alertsGridRef.current) return;
    const cards = alertsGridRef.current.querySelectorAll(".alert-card");
    if (cards.length === 0) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
    );
  }, [activeTab, filteredAlerts]);

  const scrollToSection = (id: string) => {
    const el = sectionElsRef.current[id];
    if (!el) return;
    if (embedded && scrollContainerRef.current) {
      gsap.to(scrollContainerRef.current, {
        duration: 0.6,
        ease: "power2.inOut",
        scrollTo: { y: el, offsetY: 8 },
      });
    } else {
      gsap.to(window, {
        duration: 0.6,
        ease: "power2.inOut",
        scrollTo: { y: el, offsetY: 96 },
      });
    }
  };

  return (
      <div
          ref={embedded ? scrollContainerRef : undefined}
          className={`bg-white py-10 ${
              embedded ? "h-full overflow-y-auto content-grid-embedded" : "min-h-screen content-grid"
          }`}
      >
          {/* Retour à la carte : ferme le drawer si embarqué, navigue sinon */}
          {embedded ? (
              <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
              >
                ← Back to map
              </button>
          ) : (
              <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
              >
                ← Back to map
              </Link>
          )}

          {/* Header */}
          <div className="flex items-center gap-4">
            <img
                src={`https://flagcdn.com/w80/${iso3ToIso2(iso3).toLowerCase()}.png`}
                alt={`Flag of ${countryData?.name_fr || countryData?.name_en || iso3}`}
                className="w-12 h-8 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://purecatamphetamine.github.io/country-flag-icons/3x2/${iso3}.svg`;
                }}
            />
            <h1 className="text-2xl font-bold text-gray-900">
              {countryData?.name_fr || countryData?.name_en || iso3}
            </h1>
          </div>

          {/* Onglets (soulignés, sans bordure de séparation) */}
          <div className="flex gap-6 mt-5 items-center">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`text-xl font-medium transition-all duration-200 ${
                        activeTab === tab.key
                            ? "bg-[#f5f5dc] text-gray-900 px-5 py-1.5 rounded-[20px]" /* Style beige uniquement pour l'actif */
                            : "text-gray-400 hover:text-gray-600 px-5 py-1.5" /* Même padding pour éviter les sauts de mise en page */
                    }`}
                >
                  {tab.label}
                  {tab.key === "alerts" && alerts.length > 0 && (
                      <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-gray-600" : "text-gray-400"}`}>
            ({alerts.length})
          </span>
                  )}
                </button>
            ))}
        </div>

        {/* Contenu */}
          <div className="mt-8">
            {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400"/>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center text-red-500 py-24">
                  <div className="text-center">
                    <p className="text-base font-medium">Loading error</p>
                    <p className="text-sm mt-2">{error}</p>
                  </div>
                </div>
            ) : !countryData ? (
                <div className="flex items-center justify-center text-gray-500 py-24">
                  <p>No data available for {iso3}</p>
                </div>
            ) : (
                <div>
                  {/* ===== Media Landscape : anchor nav + texte ===== */}
                  {activeTab === "media" && (
                      <div>
                        {navItems.length === 0 ? (
                            <p className="text-gray-400 italic">No media landscape data available for this country.</p>
                        ) : (
                            <div className="flex gap-12">
                              {/* Navigation par ancres, sticky à 5vh du haut */}
                              <nav className="hidden md:block w-56 shrink-0 self-start sticky bg-white" style={{top: "5vh"}}>
                                <ul className="space-y-4">
                                  {navItems.map((item) => {
                                    const active = activeSectionId === item.id;
                                    return (
                                        <li key={item.id}>
                                          <button
                                              onClick={() => scrollToSection(item.id)}
                                              className={`flex items-center gap-2 text-left text-sm transition-all duration-300 ${
                                                  active
                                                      ? "font-semibold text-gray-900"
                                                      : "font-normal text-gray-400 hover:text-gray-600"
                                              }`}
                                          >
                                  <span
                                      className={`inline-block w-0 h-0 shrink-0 border-y-4 border-y-transparent border-l-4 transition-opacity duration-300 ${
                                          active ? "border-l-gray-900 opacity-100" : "opacity-0"
                                      }`}
                                  />
                                            {item.label}
                                          </button>
                                        </li>
                                    );
                                  })}
                                </ul>
                              </nav>

                              {/* Texte */}
                              <div className="flex-1 min-w-0 max-w-3xl space-y-16" style={{fontSize: "1.2rem"}}>
                                {detailSections.map((s) => {
                                  const Icon = s.icon;
                                  return (
                                      <React.Fragment key={s.id}>
                                        <section
                                            id={s.id}
                                            ref={(el) => {
                                              sectionElsRef.current[s.id] = el;
                                            }}
                                            className="scroll-mt-8 bg-white"
                                        >
                                          <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-xl font-semibold text-gray-900">{s.label}</h3>
                                          </div>
                                          <div className="text-gray-700 leading-relaxed">{parse(s.html)}</div>
                                        </section>

                                        {/* Bloc "Media Outlets" inséré après Journalists Associations */}
                                        {s.label === "Journalists Associations" && gridItems.length > 0 && (
                                            <section
                                                id={MEDIA_OUTLETS_ID}
                                                ref={(el) => {
                                                  sectionElsRef.current[MEDIA_OUTLETS_ID] = el;
                                                }}
                                                className="scroll-mt-8"
                                            >
                                              <h3 className="font-semibold mb-6">Media
                                                Outlets</h3>
                                              <div className="card-list grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                                                {gridItems.map((g) => (
                                                    <div
                                                        className="card-list-item"
                                                        key={g.id}
                                                        ref={(el) => {
                                                          sectionElsRef.current[g.id] = el;
                                                        }}
                                                    >
                                                      <h4 className="font-semibold mb-1.5">{g.label}</h4>
                                                      <div className="leading-relaxed"
                                                           style={{fontSize: "1.2rem"}}>
                                                        {parse(g.html)}
                                                      </div>
                                                    </div>
                                                ))}
                                              </div>
                                            </section>
                                        )}
                                      </React.Fragment>
                                  );
                                })}

                                {/* Si aucune section détaillée n'a de contenu, la grille s'affiche seule */}
                                {detailSections.every((s) => s.label !== "Journalists Associations") &&
                                    gridItems.length > 0 && (
                                        <section
                                            id={MEDIA_OUTLETS_ID}
                                            ref={(el) => {
                                              sectionElsRef.current[MEDIA_OUTLETS_ID] = el;
                                            }}
                                            className="scroll-mt-8"
                                        >
                                          <h3 className="text-base font-semibold text-gray-900 mb-6">Media Outlets</h3>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                                            {gridItems.map((g) => (
                                                <div key={g.id} ref={(el) => {
                                                  sectionElsRef.current[g.id] = el;
                                                }}>
                                                  <h4 className="font-semibold text-gray-900 mb-1.5">{g.label}</h4>
                                                  <div className="text-gray-600 leading-relaxed"
                                                       style={{fontSize: "1.2rem"}}>
                                                    {parse(g.html)}
                                                  </div>
                                                </div>
                                            ))}
                                          </div>
                                        </section>
                                    )}
                              </div>
                            </div>
                        )}
                      </div>
                  )}

                  {/* ===== Alerts : grille 3 colonnes ===== */}
                  {activeTab === "alerts" && (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-6 bg-white">
                          <button
                              onClick={() => setSelectedYear("all")}
                              className={`px-3 py-1 text-sm border-b-2 transition-colors ${
                                  selectedYear === "all"
                                      ? "border-gray-900 text-gray-900 font-medium"
                                      : "border-transparent text-gray-400 hover:text-gray-600"
                              }`}
                          >
                            All
                          </button>
                          {sortedYears.map((year) => (
                              <button
                                  key={year}
                                  onClick={() => setSelectedYear(year)}
                                  className={`px-3 py-1 text-sm border-b-2 transition-colors ${
                                      selectedYear === year
                                          ? "border-gray-900 text-gray-900 font-medium"
                                          : "border-transparent text-gray-400 hover:text-gray-600"
                                  }`}
                              >
                                {year}
                              </button>
                          ))}
                        </div>

                        {alertsLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"/>
                            </div>
                        ) : alertsError ? (
                            <div className="flex items-center gap-2 text-red-500 py-8">
                              <AlertTriangle className="w-5 h-5"/>
                              <p>{alertsError}</p>
                            </div>
                        ) : filteredAlerts.length === 0 ? (
                            <p className="text-gray-400 italic py-8 text-center">
                              No alerts{selectedYear !== "all" ? ` in ${selectedYear}` : ""} for this country.
                            </p>
                        ) : (
                            <div ref={alertsGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {filteredAlerts.map((alert) => (
                                  <a
                                      key={alert.id}
                                      href={alert.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="alert-card bg-white rounded-lg p-4 hover:border-gray-400 transition-colors flex flex-col"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`w-2 h-2 rounded-full ${categoryDotClass(alert.category)}`}/>
                                      <span className="text-xs text-gray-400">
                              {new Date(alert.date).toLocaleDateString("en-US")}
                            </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1 leading-snug">{alert.title}</h4>
                                    {alert.excerpt && (
                                        <p className="text-sm text-gray-600 line-clamp-3">{alert.excerpt}</p>
                                    )}
                                  </a>
                              ))}
                            </div>
                        )}
                      </div>
                  )}
                </div>
            )}
          </div>
      </div>
  );
}
