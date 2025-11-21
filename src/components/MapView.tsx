"use client";

import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import L, { Layer } from "leaflet";
import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, Geometry } from "geojson";

// Fix des icÃ´nes Leaflet dans Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

type Props = {
  scoresByIso3: Record<string, number | undefined>;
  onCountryClick?: (iso3: string) => void;
  zoomToCountry?: string; // Nouveau prop pour dÃ©clencher le zoom
  tooltipInfoByIso3?: Record<string, string>; // Info supplémentaire pour tooltip
};

/** Invalidate la taille aprÃ¨s montage/changements (corrige les rendus partiels) */
function UseAutosize({ deps = [] as unknown[] }) {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return null;
}

/** Palette de couleurs uniques par pays (sans notion de score) */
export function colorForCountry(iso3?: string): string {
  if (!iso3) return "#e5e7eb"; // Gris pour pays sans donnÃ©es

  // Palette Ã©tendue de couleurs distinctes et harmonieuses
  const colors = [
    // Bleus principaux (tons de mer et ciel)
    "#7B9FE0", "#6B8DD6", "#5A7BC7", "#4969B8", "#3857A9",

    // Rouges/Corails (architecture et Ã©lÃ©ments dÃ©coratifs)
    "#E85A4F", "#D63447", "#C42E3F", "#B22837", "#A0222F",

    // Bleus clairs (nuances douces)
    "#9BB5E8", "#B3C7F0", "#CBD9F8", "#E3EBFF", "#F1F5FF",

    // Rouges/Roses clairs
    "#F07167", "#F48C82", "#F8A79D", "#FBC2B8", "#FEDDD3",

    // Bleus moyens
    "#4E79A7", "#6289B7", "#7699C7", "#8AA9D7", "#9EB9E7",

    // Corails et saumons
    "#E76F51", "#EA7F69", "#ED8F81", "#F09F99", "#F3AFB1",

    // Bleus profonds
    "#2E4057", "#3D5068", "#4C6079", "#5B708A", "#6A809B",

    // Rouges terreux
    "#C44536", "#D05547", "#DC6558", "#E87569", "#F4857A",

    // Bleus pastel
    "#A8C8EC", "#BCD4F0", "#D0E0F4", "#E4ECF8", "#F8FAFC",

    // Tons chauds complÃ©mentaires
    "#FF8A80", "#FF9E95", "#FFB2AA", "#FFC6BF", "#FFDAD4"
  ];

  // GÃ©nÃ©rer un hash stable basÃ© sur l'ISO3
  const hash = iso3.split('').reduce((acc, char) => {
    acc = ((acc << 5) - acc) + char.charCodeAt(0);
    return acc & acc; // Convertir en entier 32-bit
  }, 0);

  // SÃ©lectionner une couleur basÃ©e sur le hash
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}

/** Plusieurs variantes de clÃ©s ISO dans les GeoJSON du monde */
const ISO_KEYS = [
  "iso_a3",
  "ISO_A3",
  "ADM0_A3",
  "SU_A3",
  "GU_A3",
  "SOV_A3",
  "BRK_A3",
] as const;

function getISO3(props: Record<string, unknown>): string {
  for (const k of ISO_KEYS) {
    const v = props?.[k];
    if (v) return String(v).toUpperCase();
  }
  return "";
}

/** Composant qui gÃ¨re le zoom automatique sur un pays */
function AutoZoomToCountry({
                             zoomToCountry,
                             worldRef
                           }: {
  zoomToCountry?: string;
  worldRef: React.RefObject<L.GeoJSON | null>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!zoomToCountry || !worldRef.current) return;

    const layer = worldRef.current;
    let targetLayer: L.Layer | null = null;

    // Chercher la couche correspondant au pays
    layer.eachLayer((subLayer: L.Layer) => {
      const feature = (subLayer as L.Layer & { feature?: { properties?: Record<string, unknown> } }).feature;
      if (feature) {
        const iso3 = getISO3(feature.properties ?? {});
        if (iso3 === zoomToCountry.toUpperCase()) {
          targetLayer = subLayer;
        }
      }
    });

    const modalElement = document.querySelector('.alert-carousel-container');
    const modalHeight = modalElement ? modalElement.clientHeight : 280;
    const bottomPadding = modalHeight + 50;

    // Zoomer sur le pays trouvÃ©
    if (targetLayer) {
      const bounds = (targetLayer as L.Layer & { getBounds?: () => L.LatLngBounds }).getBounds?.();
      if (bounds && bounds.isValid()) {
        setTimeout(() => {
          map.fitBounds(bounds, {
            paddingTopLeft: [50, 50],              // Normal en haut
            paddingBottomRight: [50, bottomPadding], // Plus en bas pour le modal
            duration: 1.5,
            easeLinearity: 0.1
          });
        }, 300); // DÃ©lai pour permettre l'ouverture du modal
      }
    }
  }, [zoomToCountry, worldRef, map]);

  return null;
}

/** Hook pour gÃ©rer la map dans onEachFeature */
function useMapReference() {
  const map = useMap();
  return map;
}

type CountryInteractionsProps = {
  worldData: FeatureCollection<Geometry>;
  scoresByIso3: Record<string, number | undefined>;
  worldRef: React.RefObject<L.GeoJSON | null>;
  onCountryClick?: (iso3: string) => void;
  tooltipInfoByIso3?: Record<string, string>; // Info supplémentaire pour tooltip
};

/** Composant qui gÃ¨re les interactions avec les pays */
function CountryInteractions({
                               worldData,
                               scoresByIso3,
                               worldRef,
                               onCountryClick,
                               tooltipInfoByIso3
                             }: CountryInteractionsProps) {
  const map = useMapReference();

  const styleFn = (feat?: { properties?: Record<string, unknown> }): L.PathOptions => {
    if (!feat) return { color: "#ffffff", weight: 1, fillColor: "#d4d4d4", fillOpacity: 0.2 };

    const iso3 = getISO3(feat.properties ?? {});
    const score = scoresByIso3[iso3];
    const hasData = score != null;

    return {
      color: "#ffffff",
      weight: 1,
      fillColor: hasData ? colorForCountry(iso3) : "#d4d4d4",
      fillOpacity: hasData ? 1 : 0.2,
    };
  };


  const onEachFeature = (feature: { properties?: Record<string, unknown> } | undefined, layer: Layer) => {
    if (!feature) return;
    const props = feature?.properties ?? {};
    const iso3 = getISO3(props);
    const score = scoresByIso3[iso3];
    const name = (props.NAME as string) || (props.ADMIN as string) || (props.name as string) || iso3;

    // Tooltip adaptatif
    const tooltipInfo = tooltipInfoByIso3?.[iso3];
    const tooltipContent = score != null
        ? `<div style="font-weight:600">${name}</div>${tooltipInfo ? `<div style="color:#666; font-size:13px; margin-top:4px">${tooltipInfo}</div>` : ''}`
        : `<div style="font-weight:600">${name}</div><div style="color:#999">No data available</div>`;

    (layer as L.Layer & { bindTooltip: (content: string, options?: { sticky?: boolean }) => void }).bindTooltip(tooltipContent, { sticky: true });

    // Variables pour gÃ©rer les timeouts
    let hoverTimeout: NodeJS.Timeout | null = null;

    // Clic seulement si le pays a des donnÃ©es
    const el = (layer as L.Layer & { getElement?: () => HTMLElement | undefined }).getElement?.();
    layer.on("click", () => {
      if (iso3 && score != null && onCountryClick) { // VÃ©rification score != null
        onCountryClick(iso3);
      }
    });

    // DÃ©finir le curseur selon si le pays a des donnÃ©es
    if (el) {
      el.style.cursor = score != null ? 'pointer' : 'default';
      el.setAttribute("tabindex", score != null ? "0" : "-1");
      el.setAttribute("role", score != null ? "button" : "");
      el.setAttribute("aria-label", score != null ? `Voir ${name}` : `${name} - Aucune donnÃ©e`);

      if (score != null) {
        el.addEventListener("keydown", (ev: KeyboardEvent) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            if (onCountryClick) {
              onCountryClick(iso3);
            }
          }
        });
      }
    }

    // Interaction survol avec auto-fit SEULEMENT si le pays a des donnÃ©es
    (layer as L.Path).on("mouseover", () => {
      // Style highlight immÃ©diat
      (layer as L.Path).setStyle({ weight: 2 }); // Plus visible sans carte d'arriÃ¨re-plan

      // Auto-fit avec dÃ©lai SEULEMENT si le pays a un score (donc des donnÃ©es)
      if (score != null) { // VÃ©rifie si le pays a des donnÃ©es
        if (hoverTimeout) clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          const bounds = (layer as L.Layer & { getBounds?: () => L.LatLngBounds }).getBounds?.();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [50, 50],
              duration: 1.2,
              easeLinearity: 0.1
            });
          }
        }, 1000);
      }
    });

    (layer as L.Path).on("mouseout", () => {
      // Retour style normal
      (layer as L.Path).setStyle({ weight: 1 });

      // Annule l'auto-fit si on quitte avant 1s
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
    });

    // Cleanup au dÃ©montage du layer
    layer.on("remove", () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
    });
  };

  return (
      <GeoJSON
          ref={worldRef}
          data={worldData}
          style={styleFn}
          onEachFeature={onEachFeature}
      />
  );
}

export default function MapView({ scoresByIso3, onCountryClick, zoomToCountry, tooltipInfoByIso3 }: Props) {
  const [worldData, setWorldData] = useState<FeatureCollection<Geometry> | null>(
      null
  );
  const [error, setError] = useState<string | null>(null);
  const worldRef = useRef<L.GeoJSON | null>(null);

  // Charger le GeoJSON depuis /public
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/world.geo.json");
        if (!res.ok) throw new Error(`Failed to fetch world.geo.json: ${res.status}`);
        const json = (await res.json()) as FeatureCollection<Geometry>;
        if (!cancel) setWorldData(json);
      } catch (err) {
        console.error(err);
        if (!cancel) setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (error) {
    return (
        <div className="relative w-full h-screen rounded-xl border overflow-hidden flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error loading map</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="relative w-full h-screen rounded-xl border overflow-hidden">
        <MapContainer
            center={[0, 20]}  // CentrÃ© sur l'Afrique : latitude 0Â°, longitude 20Â°E
            zoom={3}          // Zoom plus proche pour voir l'Afrique entiÃ¨re
            minZoom={2}       // Zoom minimum adaptÃ© pour Ã©viter de trop dÃ©zoomer
            maxZoom={5}       // Limite le zoom maximum si besoin
            style={{ height: "100%", width: "100%" }}
            worldCopyJump
            // IMPORTANT: DÃ©finir une couleur de fond pour la carte
            className="map-background"
        >
          {/* Corrige les tailles quand les layouts se stabilisent / quand les donnÃ©es arrivent */}
          <UseAutosize deps={[worldData]} />

          {/*
        SUPPRIMÃ‰ : TileLayer pour masquer la carte d'arriÃ¨re-plan
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        */}

          {worldData && (
              <>
                <CountryInteractions
                    worldData={worldData}
                    scoresByIso3={scoresByIso3}
                    worldRef={worldRef}
                    onCountryClick={onCountryClick}
                    tooltipInfoByIso3={tooltipInfoByIso3}
                />
                <AutoZoomToCountry
                    zoomToCountry={zoomToCountry}
                    worldRef={worldRef}
                />
                {/* FitBoundsOnData supprimÃ© pour garder le focus sur l'Afrique */}
              </>
          )}
        </MapContainer>

        {/* LÃ©gende simple - commentÃ©e car plus de scores
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur rounded-md shadow px-3 py-2 text-sm">
        <div className="font-medium mb-1">Score global</div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#1f77b4'}} /> â‰¥ 80</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#2ca02c'}} /> 65â€“79.9</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#ff7f0e'}} /> 50â€“64.9</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#d62728'}} /> 35â€“49.9</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#9467bd'}} /> &lt; 35</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#e5e7eb'}} /> n.d.</li>
        </ul>
      </div>*/}
      </div>
  );
}