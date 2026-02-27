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
  zoomToCountry?: string;
  tooltipInfoByIso3?: Record<string, string>;
};

/** Invalidate la taille après montage/changements (corrige les rendus partiels) */
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

/** Palette de couleurs uniques par pays (16 pays d'Afrique de l'Ouest) */
export function colorForCountry(iso3?: string): string {
  if (!iso3) return "#e5e7eb"; // Gris pour pays sans données

  // Palettes de couleurs avec déclinaisons
  const palettes = {
    // Eggshell (beige/crème) - 5 tons
    eggshell: ["#f4f1de", "#f9f7f0", "#ede8dd", "#dcd9c7", "#c5c2b0"],

    // Burnt Peach (corail/pêche) - 5 tons
    burntPeach: ["#e07a5f", "#efa38c", "#e78c73", "#c96d56", "#b2604d"],

    // Twilight Indigo (bleu foncé) - 5 tons
    twilightIndigo: ["#3d405b", "#575973", "#76788f", "#363951", "#2f3247"],

    // Muted Teal (turquoise discret) - 5 tons
    mutedTeal: ["#81b29a", "#a7cbb7", "#94bfaf", "#74a08b", "#678e7c"],

    // Apricot Cream (abricot/jaune) - 5 tons
    apricotCream: ["#f2cc8f", "#f9e0b7", "#f5d49f", "#dcc985", "#c6a67b"],
  };

  // Mapping explicite : chaque pays = couleur unique
  // Distribution : 3-4 pays par couleur de palette
  const countryColorMap: Record<string, string> = {
    // Eggshell (beige) - 3 pays
    BEN: palettes.eggshell[0], // #f4f1de
    BFA: palettes.eggshell[1], // #f9f7f0
    CPV: palettes.eggshell[2], // #ede8dd

    // Burnt Peach (corail) - 4 pays
    CIV: palettes.burntPeach[0], // #e07a5f
    GMB: palettes.burntPeach[1], // #efa38c
    GHA: palettes.burntPeach[2], // #e78c73
    GIN: palettes.burntPeach[3], // #c96d56

    // Twilight Indigo (bleu foncé) - 4 pays
    GNB: palettes.twilightIndigo[0], // #3d405b
    LBR: palettes.twilightIndigo[1], // #575973
    MLI: palettes.twilightIndigo[2], // #76788f
    MRT: palettes.twilightIndigo[3], // #363951

    // Muted Teal (turquoise) - 3 pays
    NER: palettes.mutedTeal[0], // #81b29a
    NGA: palettes.mutedTeal[1], // #a7cbb7
    SEN: palettes.mutedTeal[2], // #94bfaf

    // Apricot Cream (abricot) - 2 pays
    SLE: palettes.apricotCream[0], // #f2cc8f
    TGO: palettes.apricotCream[1], // #f9e0b7
  };

  return countryColorMap[iso3.toUpperCase()] || "#e5e7eb";
}

/** Plusieurs variantes de clés ISO dans les GeoJSON du monde */
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

/** Composant qui gère le zoom automatique sur un pays */
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

    // Zoomer sur le pays trouvé
    if (targetLayer) {
      const bounds = (targetLayer as L.Layer & { getBounds?: () => L.LatLngBounds }).getBounds?.();
      if (bounds && bounds.isValid()) {
        setTimeout(() => {
          map.fitBounds(bounds, {
            paddingTopLeft: [50, 50],
            paddingBottomRight: [50, bottomPadding],
            duration: 1.5,
            easeLinearity: 0.1
          });
        }, 300);
      }
    }
  }, [zoomToCountry, worldRef, map]);

  return null;
}

type CountryInteractionsProps = {
  worldData: FeatureCollection<Geometry>;
  scoresByIso3: Record<string, number | undefined>;
  worldRef: React.RefObject<L.GeoJSON | null>;
  onCountryClick?: (iso3: string) => void;
  tooltipInfoByIso3?: Record<string, string>;
};

/** Composant qui gère les interactions avec les pays */
function CountryInteractions({
                               worldData,
                               scoresByIso3,
                               worldRef,
                               onCountryClick,
                               tooltipInfoByIso3
                             }: CountryInteractionsProps) {
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

    // Tooltip construction
    const tooltipInfo = tooltipInfoByIso3?.[iso3];
    const tooltipContent = score != null
        ? `<div style="font-weight:600; margin-bottom: 4px;">${name}</div>${
            tooltipInfo
                ? `<div style="color:#666; font-size:13px; line-height:1.4; white-space:normal; max-width:280px;">
                 ${tooltipInfo}
                 <div style="color:#4E79A7; font-size:11px; font-weight:600; margin-top:8px; letter-spacing: 0.02em;">
                   Click to learn more &rarr;
                 </div>
               </div>`
                : ''
        }`
        : `<div style="font-weight:600">${name}</div><div style="color:#999">No data available</div>`;

    (layer as L.Layer & { bindTooltip: (content: string, options?: { sticky?: boolean }) => void }).bindTooltip(tooltipContent, { sticky: true });

    // Clic seulement si le pays a des données
    const el = (layer as L.Layer & { getElement?: () => HTMLElement | undefined }).getElement?.();
    layer.on("click", () => {
      if (iso3 && score != null && onCountryClick) {
        onCountryClick(iso3);
      }
    });

    // Accessibilité (curseur main)
    if (el) {
      el.style.cursor = score != null ? 'pointer' : 'default';
    }

    // Effet visuel au survol
    (layer as L.Path).on("mouseover", () => {
      (layer as L.Path).setStyle({ weight: 2 });
    });

    (layer as L.Path).on("mouseout", () => {
      (layer as L.Path).setStyle({ weight: 1 });
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
            center={[12, -4]}
            zoom={4}
            minZoom={3}
            maxZoom={6}
            style={{ height: "100%", width: "100%" }}
            worldCopyJump
            className="map-background"
        >
          <UseAutosize deps={[worldData]} />

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
              </>
          )}
        </MapContainer>
      </div>
  );
}