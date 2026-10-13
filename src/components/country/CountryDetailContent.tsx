// components/country/CountryDetailContent.tsx
// Contenu partagé entre la modal (drawer latéral) et la page indexable /country/[iso3].
// Design minimaliste : fond blanc, pas de blocs colorés, lignes de grille décoratives.
// Layout : onglets Media Landscape / Alerts en colonne verticale sticky à gauche ;
// sections du Media Landscape navigables via une barre d'ancres horizontale sticky.
// Chaque section : titre sticky à gauche (jusqu'à la section suivante) + texte à droite.
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
    case "urgent": return "alert-dot--urgent";
    case "report": return "alert-dot--report";
    default: return "alert-dot--default";
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
    const targets = navItems.map((n) => n.id);
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
          // clearProps : ne pas laisser de transform résiduel sur la section (libellé sticky)
          onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", clearProps: "transform" }),
        })
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, [activeTab, navItems, embedded]);

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

  // Hauteur de la barre d'ancres horizontale (sticky) : sert d'offset pour les
  // libellés sticky des sections et pour le scroll vers une ancre.
  const [anchorNavH, setAnchorNavH] = useState(64);
  const anchorNavRef = useRef<HTMLElement | null>(null);
  const anchorListRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const el = anchorNavRef.current;
    if (!el) return;
    const update = () => setAnchorNavH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeTab, navItems.length]);

  const stickyLabelTop = anchorNavH + 32;

  // Lignes de contenu (ordre = ordre de la nav) : sections texte + bloc Media Outlets.
  const rows = useMemo(() => {
    const byId = new Map(detailSections.map((s) => [s.id, s]));
    return navItems.map((item, i) => ({
      id: item.id,
      label: item.label,
      number: String(i + 1).padStart(2, "0"),
      html: byId.get(item.id)?.html ?? null,
    }));
  }, [navItems, detailSections]);

  // Garde l'ancre active visible dans la barre horizontale (mobile / petits écrans).
  useEffect(() => {
    const list = anchorListRef.current;
    if (!list || !activeSectionId) return;
    const item = list.querySelector<HTMLElement>(`[data-item="${activeSectionId}"]`);
    if (!item) return;
    const left = item.offsetLeft - list.clientWidth / 2 + item.offsetWidth / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeSectionId]);

  const scrollToSection = (id: string) => {
    const el = sectionElsRef.current[id];
    if (!el) return;
    const offsetY = anchorNavH + 16;
    gsap.to(embedded && scrollContainerRef.current ? scrollContainerRef.current : window, {
      duration: 0.6,
      ease: "power2.inOut",
      scrollTo: { y: el, offsetY },
    });
  };

  const yearItems = useMemo(
    () => [
      { id: "all", label: "All" },
      ...sortedYears.map((y) => ({ id: String(y), label: String(y) })),
    ],
    [sortedYears]
  );

  return (
      <div
          ref={embedded ? scrollContainerRef : undefined}
          className={`country-page ${
              embedded ? "country-page--embedded content-grid-embedded" : "country-page--full content-grid"
          }`}
      >
          {/* Retour à la carte : ferme le drawer si embarqué, navigue sinon */}
          {embedded ? (
              <button onClick={onClose} className="country-back">
                ← Back to map
              </button>
          ) : (
              <Link href="/" className="country-back">
                ← Back to map
              </Link>
          )}

          {/* Header */}
          <div className="country-header">
            <img
                src={`https://flagcdn.com/w80/${iso3ToIso2(iso3).toLowerCase()}.png`}
                alt={`Flag of ${countryData?.name_fr || countryData?.name_en || iso3}`}
                className="country-flag"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://purecatamphetamine.github.io/country-flag-icons/3x2/${iso3}.svg`;
                }}
            />
            <h1 className="country-title">
              {countryData?.name_fr || countryData?.name_en || iso3}
            </h1>
          </div>

          <div className="country-body">
            {/* Onglets Media Landscape / Alerts : colonne verticale sticky (ligne sur mobile) */}
            <aside className="country-tabs">
              <div className="country-tablist" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`country-tab ${activeTab === tab.key ? "is-active" : ""}`}
                    >
                      {tab.label}
                      {tab.key === "alerts" && alerts.length > 0 && (
                          <span className="country-tab-count">({alerts.length})</span>
                      )}
                    </button>
                ))}
              </div>
            </aside>

            {/* Contenu */}
            <div className="country-content">
              {loading ? (
                  <div className="country-state">
                    <div className="country-spinner" />
                  </div>
              ) : error ? (
                  <div className="country-state country-state--error">
                    <div>
                      <p className="country-state__title">Loading error</p>
                      <p className="country-state__message">{error}</p>
                    </div>
                  </div>
              ) : !countryData ? (
                  <div className="country-state">
                    <p>No data available for {iso3}</p>
                  </div>
              ) : (
                  <div>
                    {/* ===== Media Landscape : barre d'ancres horizontale + sections ===== */}
                    {activeTab === "media" && (
                        <div>
                          {rows.length === 0 ? (
                              <p className="country-empty">No media landscape data available for this country.</p>
                          ) : (
                              <>
                                <StickyBar
                                    ariaLabel="Sections"
                                    navRef={anchorNavRef}
                                    listRef={anchorListRef}
                                    items={rows.map((r) => ({ id: r.id, label: r.label, kicker: `${r.number}.` }))}
                                    activeId={activeSectionId}
                                    onSelect={scrollToSection}
                                />

                                <div className="country-sections">
                                  {rows.map((row) => (
                                      <section
                                          key={row.id}
                                          id={row.id}
                                          ref={(el) => {
                                            sectionElsRef.current[row.id] = el;
                                          }}
                                          className="country-section"
                                      >
                                        {/* Titre sticky jusqu'à la section suivante (desktop) */}
                                        <div className="country-section__label" style={{top: stickyLabelTop}}>
                                          <h2 className="country-section__title">{row.label}</h2>
                                        </div>

                                        <div className="country-section__body">
                                          {row.html !== null ? (
                                              <div className="country-richtext">{parse(row.html)}</div>
                                          ) : (
                                              <div className="country-cards">
                                                {gridItems.map((g) => (
                                                    <div className="card-list-item" key={g.id}>
                                                      <h3 className="country-card__title">{g.label}</h3>
                                                      <div className="country-richtext">{parse(g.html)}</div>
                                                    </div>
                                                ))}
                                              </div>
                                          )}
                                          <div className="ligne-sur-mesure"></div>
                                        </div>
                                      </section>
                                  ))}
                                </div>
                              </>
                          )}
                        </div>
                    )}

                    {/* ===== Alerts : années en barre sticky (même style que les sections) ===== */}
                    {activeTab === "alerts" && (
                        <div>
                          <StickyBar
                              ariaLabel="Years"
                              items={yearItems}
                              activeId={String(selectedYear)}
                              onSelect={(id) => setSelectedYear(id === "all" ? "all" : Number(id))}
                          />

                          <div className="country-alerts">
                            {alertsLoading ? (
                                <div className="country-state country-state--compact">
                                  <div className="country-spinner country-spinner--sm" />
                                </div>
                            ) : alertsError ? (
                                <div className="country-error-inline">
                                  <AlertTriangle />
                                  <p>{alertsError}</p>
                                </div>
                            ) : filteredAlerts.length === 0 ? (
                                <p className="country-empty country-empty--center">
                                  No alerts{selectedYear !== "all" ? ` in ${selectedYear}` : ""} for this country.
                                </p>
                            ) : (
                                <div ref={alertsGridRef} className="alert-grid">
                                  {filteredAlerts.map((alert) => (
                                      <a
                                          key={alert.id}
                                          href={/^https?:\/\//i.test(alert.link) ? alert.link : "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="alert-card"
                                      >
                                        <div className="alert-card__meta">
                                          <span className={`alert-dot ${categoryDotClass(alert.category)}`} />
                                          <span className="alert-card__date">
                                            {new Date(alert.date).toLocaleDateString("en-US")}
                                          </span>
                                        </div>
                                        <h4 className="alert-card__title">{alert.title}</h4>
                                        {alert.excerpt && (
                                            <p className="alert-card__excerpt">{alert.excerpt}</p>
                                        )}
                                      </a>
                                  ))}
                                </div>
                            )}
                          </div>
                        </div>
                    )}
                  </div>
              )}
            </div>
          </div>
      </div>
  );
}

// Barre de navigation horizontale sticky (sections du Media Landscape, années des Alerts).
// Défile horizontalement sur petits écrans ; soulignement noir sous l'élément actif.
function StickyBar({
  items,
  activeId,
  onSelect,
  ariaLabel,
  navRef,
  listRef,
}: {
  items: { id: string; label: string; kicker?: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
  navRef?: React.Ref<HTMLElement>;
  listRef?: React.Ref<HTMLUListElement>;
}) {
  return (
      <nav ref={navRef} aria-label={ariaLabel} className="sticky-bar">
        <ul ref={listRef} className="sticky-bar__list">
          {items.map((item) => {
            const active = activeId === item.id;
            return (
                <li key={item.id} data-item={item.id} className="sticky-bar__item">
                  <button
                      onClick={() => onSelect(item.id)}
                      aria-current={active ? "true" : undefined}
                      className={`sticky-bar__button ${active ? "is-active" : ""}`}
                  >
                    {item.kicker && <span className="sticky-bar__kicker">{item.kicker}</span>}
                    <span className="sticky-bar__label">{item.label}</span>
                    <span className="sticky-bar__line" />
                  </button>
                </li>
            );
          })}
        </ul>
      </nav>
  );
}
