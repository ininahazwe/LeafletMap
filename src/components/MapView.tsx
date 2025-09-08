"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L, { Layer } from "leaflet";
import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, Geometry } from "geojson";

// Fix des icônes Leaflet dans Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
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
};

/** Invalidate la taille après montage/changements (corrige les rendus partiels) */
function UseAutosize({ deps = [] as any[] }) {
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

/** Fit sur les bounds du GeoJSON une fois chargé */
function FitBoundsOnData({
  layerRef,
}: {
  layerRef: React.RefObject<L.GeoJSON<any> | null>;
}) {
  const map = useMap();
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const timer = setTimeout(() => {
      const b = layer.getBounds?.();
      if (b && b.isValid()) {
        map.fitBounds(b, { padding: [20, 20] });
        setTimeout(() => map.invalidateSize(), 100);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [layerRef, map]);
  return null;
}

/** Palette */
function colorForScore(score?: number): string {
  if (score == null) return "#e5e7eb";
  if (score >= 80) return "#1f77b4";
  if (score >= 65) return "#2ca02c";
  if (score >= 50) return "#ff7f0e";
  if (score >= 35) return "#d62728";
  return "#9467bd";
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
function getISO3(props: any): string {
  for (const k of ISO_KEYS) {
    const v = props?.[k];
    if (v) return String(v).toUpperCase();
  }
  return "";
}

/** Hook pour gérer la map dans onEachFeature */
function useMapReference() {
  const map = useMap();
  return map;
}

type CountryInteractionsProps = { 
  worldData: FeatureCollection<Geometry>;
  scoresByIso3: Record<string, number | undefined>;
  worldRef: React.RefObject<L.GeoJSON<any> | null>;
  onCountryClick?: (iso3: string) => void;
};

/** Composant qui gère les interactions avec les pays */
function CountryInteractions({ 
  worldData, 
  scoresByIso3, 
  worldRef,
  onCountryClick 
}: CountryInteractionsProps) {
  const map = useMapReference();

  const styleFn = (feat: any): L.PathOptions => {
    const iso3 = getISO3(feat?.properties);
    const score = scoresByIso3[iso3];
    return {
      color: "#ffffff",
      weight: 0.8,
      fillColor: colorForScore(score),
      fillOpacity: 0.9,
    };
  };

  const onEachFeature = (feature: any, layer: Layer) => {
    const props = feature?.properties ?? {};
    const iso3 = getISO3(props);
    const score = scoresByIso3[iso3];
    const name = props.NAME || props.ADMIN || props.name || iso3;

    // Tooltip
    (layer as any).bindTooltip(
      `<div style="font-weight:600">${name}</div><div>Score: ${score ?? "–"}</div>`,
      { sticky: true }
    );

    // Variables pour gérer les timeouts
    let hoverTimeout: NodeJS.Timeout | null = null;

    // Clic & accessibilité clavier
    const el = (layer as any).getElement?.() as HTMLElement | undefined;
    layer.on("click", () => {
      if (iso3 && onCountryClick) {
        onCountryClick(iso3);
      }
    });
    
    if (el) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Voir ${name}`);
      el.addEventListener("keydown", (ev: any) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          if (iso3 && onCountryClick) {
            onCountryClick(iso3);
          }
        }
      });
    }

    // Interaction survol avec auto-fit
    (layer as L.Path).on("mouseover", () => {
      // Style highlight immédiat
      (layer as L.Path).setStyle({ weight: 1.2 });
      
      // Auto-fit avec délai de 1 seconde
      if (hoverTimeout) clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        const bounds = (layer as any).getBounds();
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds, { 
            padding: [50, 50], 
            duration: 1.2, // transition lente et fluide
            easeLinearity: 0.1 // transition plus smooth
          });
        }
      }, 1000);
    });

    (layer as L.Path).on("mouseout", () => {
      // Retour style normal
      (layer as L.Path).setStyle({ weight: 0.8 });
      
      // Annule l'auto-fit si on quitte avant 1s
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
    });

    // Cleanup au démontage du layer
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

export default function MapView({ scoresByIso3, onCountryClick }: Props) {
  const [worldData, setWorldData] = useState<FeatureCollection<Geometry> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const worldRef = useRef<L.GeoJSON<any> | null>(null);

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
      <div className="relative w-full h-[520px] rounded-xl border overflow-hidden flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-medium">Erreur lors du chargement de la carte</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[520px] rounded-xl border overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={1.5}
        style={{ height: "100%", width: "100%" }}
        worldCopyJump
      >
        {/* Corrige les tailles quand les layouts se stabilisent / quand les données arrivent */}
        <UseAutosize deps={[worldData]} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {worldData && (
          <>
            <CountryInteractions 
              worldData={worldData}
              scoresByIso3={scoresByIso3}
              worldRef={worldRef}
              onCountryClick={onCountryClick}
            />
            <FitBoundsOnData layerRef={worldRef} />
          </>
        )}
      </MapContainer>

      {/* Légende simple */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur rounded-md shadow px-3 py-2 text-sm">
        <div className="font-medium mb-1">Score global</div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#1f77b4'}} /> ≥ 80</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#2ca02c'}} /> 65–79.9</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#ff7f0e'}} /> 50–64.9</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#d62728'}} /> 35–49.9</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#9467bd'}} /> &lt; 35</li>
          <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{background:'#e5e7eb'}} /> n.d.</li>
        </ul>
      </div>
    </div>
  );
}