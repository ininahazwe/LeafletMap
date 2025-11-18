// components/CountryModal.tsx — Bottom sheet ancré bas avec dépliage au scroll/drag
import React, { useEffect, useRef, useState } from "react";
import {X, ExternalLink, Radio, Tv, Newspaper, Globe, Shield, Users, Building, Gavel, NewspaperIcon, ListCheck, WholeWord, HomeIcon} from "lucide-react";
import { useCountryDetails } from "@/hooks/useCountryDetails";
import parse from 'html-react-parser';

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  iso3: string;
}

/** Hauteurs en vh pour la feuille */
const MIN_VH = 50;   // hauteur compacte (état initial — cf. screenshot 1)
const MAX_VH = 100;   // quasi plein écran (état final — cf. screenshot 2)
const STEP_VH = 10;  // incrément via molette
const DRAG_SENS = 0.35; // sensibilité du drag (px -> vh)

const regionColors = {
  Africa: "from-orange-500 to-red-600",
  Americas: "from-orange-400 to-red-500",
  Asia: "from-red-500 to-red-700",
  Europe: "from-yellow-400 to-orange-500",
  Oceania: "from-green-400 to-blue-500",
  default: "from-gray-500 to-gray-700",
} as const;

const iso3ToIso2 = (iso3: string): string => {
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

export default function CountryModal({ isOpen, onClose, iso3 }: CountryModalProps) {
  const { countryData, loading, error } = useCountryDetails(iso3);

  const [vh, setVh] = useState<number>(MIN_VH);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Drag state
  const dragStartY = useRef<number | null>(null);
  const dragStartVh = useRef<number>(MIN_VH);

  const region = countryData?.region || "default";
  const gradientClass = regionColors[region as keyof typeof regionColors] || regionColors.default;
  const mediaData = countryData?.media_environment;

  // Ouverture : repartir du format compact
  useEffect(() => {
    if (!isOpen) return;
    setVh(MIN_VH);
    // On garde le body scrollable (pas d’overlay bloquant)
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Molette : déplier/replier la feuille avant de scroller le contenu
  const onWheel = (e: React.WheelEvent) => {
    if (!contentRef.current) return;
    const el = contentRef.current;

    const atTop = el.scrollTop <= 0;
    const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight - 1;

    // Scroll vers le bas → agrandir la feuille d'abord
    if (e.deltaY > 0 && vh < MAX_VH) {
      e.preventDefault();
      setVh((p) => Math.min(MAX_VH, p + STEP_VH));
      return;
    }

    // Scroll vers le haut au tout début du contenu → replier la feuille
    if (e.deltaY < 0 && atTop && vh > MIN_VH) {
      e.preventDefault();
      setVh((p) => Math.max(MIN_VH, p - STEP_VH));
      return;
    }

    // Cas limites: empêcher l'effet “rebond” quand on pourrait encore ajuster la hauteur
    if ((e.deltaY > 0 && atBottom && vh < MAX_VH) || (e.deltaY < 0 && atTop && vh > MIN_VH)) {
      e.preventDefault();
    }
  };

  // Drag tactile/souris (poignée)
  const onDragStart = (clientY: number) => {
    dragStartY.current = clientY;
    dragStartVh.current = vh;
  };
  const onDragMove = (clientY: number) => {
    if (dragStartY.current == null) return;
    const dy = dragStartY.current - clientY; // vers le haut = positif
    const deltaVh = (dy * DRAG_SENS) / (window.innerHeight / 100);
    const next = Math.max(MIN_VH, Math.min(MAX_VH, dragStartVh.current + deltaVh));
    setVh(next);
  };
  const onDragEnd = () => { dragStartY.current = null; };

  // ESC pour fermer
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-modal-overlay">
      {/* Sheet ancré bas */}
      <div
        className="z-modal-content mx-auto w-full max-w-6xl bg-white shadow-2xl rounded-t-xl scrollable-modal"
        style={{
          height: `${vh}vh`,
          transform: "translateZ(0)",
          transition: dragStartY.current == null ? "height 160ms ease" : "none",
        }}
        onWheel={onWheel}
      >
        {/* Poignée (drag) */}
        <div
          className="sheet-grip"
          onMouseDown={(e) => onDragStart(e.clientY)}
          onMouseMove={(e) => dragStartY.current != null && onDragMove(e.clientY)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
          onTouchEnd={onDragEnd}
          aria-label="Redimensionner le panneau"
        >
          <span className="sheet-grip-bar" />
        </div>

        {/* Header sticky */}
        <div className="modal-header sticky top-0 left-0 right-0 z-50 shadow-md">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-12 bg-opacity-20 flex items-center justify-center overflow-hidden">
              <img
                src={`https://flagcdn.com/w80/${iso3ToIso2(iso3).toLowerCase()}.png`}
                alt={`Drapeau ${countryData?.name_fr || countryData?.name_en || iso3}`}
                className="w-12 h-8 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://purecatamphetamine.github.io/country-flag-icons/3x2/${iso3}.svg`;
                  target.onerror = () => {
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-12 h-8 bg-white bg-opacity-30 flex items-center justify-center text-white text-xs font-bold">${iso3}</div>`;
                    }
                  };
                }}
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {countryData?.name_fr || countryData?.name_en || iso3}
              </h2>
              <div className="flex items-center gap-4 text-white text-opacity-90">
                <span>{countryData?.region || "—"} • Media Environment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu scrollable interne */}
        <div
          ref={contentRef}
          className="h-[calc(100%-120px)] overflow-y-auto"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <div className="text-center">
                <p className="text-lg font-medium">Loading error</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            </div>
          ) : !countryData ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No data available for {iso3}</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Layout 2/3 – 1/3 (mobile: 1 colonne) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Colonne principale = 2/3 */}
                <div className="md:col-span-8 space-y-6 min-w-0 colonne-principale">
                  <div className="background-left"></div>
                  {mediaData?.legal_environment && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Gavel className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Legal Environment</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{parse(mediaData.legal_environment)}</p>
                    </div>
                  )}

                  {mediaData?.media_regulators && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Media Regulators</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{parse(mediaData.media_regulators)}</p>
                    </div>
                  )}

                  {mediaData?.journalists_associations && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Journalists Associations</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{parse(mediaData.journalists_associations)}</p>
                    </div>
                  )}

                   {mediaData?.international_media && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <WholeWord className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold">International media</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{parse(mediaData.international_media)}</p>
                    </div>
                  )}

                  {mediaData?.internet_freedom && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold">State of internet freedom</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{parse(mediaData.internet_freedom)}</p>
                    </div>
                  )}
                </div>

                {/* Sidebar = 1/3 (option: sticky dans le modal) */}
                <aside className="md:col-span-4 space-y-4 lg:sticky lg:top-4">
                  {mediaData?.radio_stations && (
                    <div className="bg-white p-4 titre-sidebar">
                      <div className="flex items-center gap-3 mb-3">
                        <Radio className="w-5 h-5 text-orange-500" />
                        <h4 className="font-semibold">Radio Stations</h4>
                      </div>
                      <p className="text-sm text-gray-600">{parse(mediaData.radio_stations)}</p>
                    </div>
                  )}

                  {mediaData?.tv_stations && (
                    <div className="bg-white p-4 titre-sidebar">
                      <div className="flex items-center gap-3 mb-3">
                        <Tv className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">TV Stations</h4>
                      </div>
                      <p className="text-sm text-gray-600">{parse(mediaData.tv_stations)}</p>
                    </div>
                  )}

                  {mediaData?.state_owned_media && (
                    <div className="bg-white p-4 titre-sidebar">
                      <div className="flex items-center gap-3 mb-3">
                        <ListCheck className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">State-owned media</h4>
                      </div>
                      <p className="text-sm text-gray-600">{parse(mediaData.state_owned_media)}</p>
                    </div>
                  )}

                  {mediaData?.news_agency && (
                    <div className="bg-white p-4 titre-sidebar">
                      <div className="flex items-center gap-3 mb-3">
                        <HomeIcon className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">News agency</h4>
                      </div>
                      <p className="text-sm text-gray-600">{parse(mediaData.news_agency)}</p>
                    </div>
                  )}

                  {mediaData?.newspapers && (
                    <div className="bg-white p-4 titre-sidebar">
                      <div className="flex items-center gap-3 mb-3">
                        <Newspaper className="w-5 h-5 text-green-500" />
                        <h4 className="font-semibold">Newspapers</h4>
                      </div>
                      <p className="text-sm text-gray-600">{parse(mediaData.newspapers)}</p>
                    </div>
                  )}

                  {mediaData?.online_media && (
                    <div className="bg-white p-4 titre-sidebar">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-5 h-5 text-purple-500" />
                        <h4 className="font-semibold">Online Media</h4>
                      </div>
                      <p className="text-sm text-gray-600">{parse(mediaData.online_media)}</p>
                    </div>
                  )}

                  {mediaData?.leading_media && (
                    <div className="bg-white p-4 titre-sidebar">
                      <div className="flex items-center gap-3 mb-3">
                        <ExternalLink className="w-5 h-5 text-indigo-500" />
                        <h4 className="font-semibold">Leading Media</h4>
                      </div>
                      <p className="text-sm text-gray-600">{parse(mediaData.leading_media)}</p>
                    </div>
                  )}
                </aside>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}