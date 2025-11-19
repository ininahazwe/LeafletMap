"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L, { Layer } from "leaflet";
import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, Geometry } from "geojson";

// Fix des icônes Leaflet dans Next.js
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
  zoomToCountry?: string; // Nouveau prop pour déclencher le zoom
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

/** Palette de couleurs uniques par pays (sans notion de score) */
function colorForCountry(iso3?: string): string {
  if (!iso3) return "#e5e7eb"; // Gris pour pays sans données
  
  // Palette étendue de couleurs distinctes et harmonieuses
const colors = [
  // Bleus principaux (tons de mer et ciel)
  "#7B9FE0", "#6B8DD6", "#5A7BC7", "#4969B8", "#3857A9",
  
  // Rouges/Corails (architecture et éléments décoratifs)
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
  
  // Tons chauds complémentaires
  "#FF8A80", "#FF9E95", "#FFB2AA", "#FFC6BF", "#FFDAD4"
];
  
  // Générer un hash stable basé sur l'ISO3
  const hash = iso3.split('').reduce((acc, char) => {
    acc = ((acc << 5) - acc) + char.charCodeAt(0);
    return acc & acc; // Convertir en entier 32-bit
  }, 0);
  
  // Sélectionner une couleur basée sur le hash
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
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
/** Composant qui gère le zoom automatique sur un pays avec centrage DYNAMIQUE */
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
    
    // Zoomer sur le pays trouvé avec centrage dynamique
    if (targetLayer) {
      const bounds = (targetLayer as L.Layer & { getBounds?: () => L.LatLngBounds }).getBounds?.();
      if (bounds && bounds.isValid()) {
        setTimeout(() => {
          // 🎯 CALCUL DYNAMIQUE de la hauteur réelle du modal
          const modalElement = document.querySelector('.alert-carousel-container');
          let modalHeight = 280; // Valeur par défaut
          
          if (modalElement) {
            // Utiliser la hauteur réelle mesurée
            modalHeight = modalElement.clientHeight;
          }
          
          // Ajouter une marge de sécurité
          const bottomPadding = modalHeight + 50;
          
          // Centrer le pays dans la zone visible (au-dessus du modal)
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

/** Hook pour gérer la map dans onEachFeature */
function useMapReference() {
  const map = useMap();
  return map;
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
  tooltipInfoByIso3 = {}
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
      fillColor: hasData ? colorForCountry(iso3) : "#d1d1d1",
      fillOpacity: hasData ? 1 : 0.9,
    };
  };


  const onEachFeature = (feature: { properties?: Record<string, unknown> } | undefined, layer: Layer) => {
    if (!feature) return;
    const props = feature?.properties ?? {};
    const iso3 = getISO3(props);
    const score = scoresByIso3[iso3];
    const name = (props.NAME as string) || (props.ADMIN as string) || (props.name as string) || iso3;
    const tooltipInfo = tooltipInfoByIso3[iso3];

    // Tooltip adaptatif
    // Dans onEachFeature, remplacer le tooltipContent :

    const tooltipContent = score != null 
      ? `<div style="max-width:240px;">
           <div style="font-weight:600;color:#1a1a1a;margin-bottom:6px;">${name}</div>
           ${tooltipInfo ? `<div style="color:#555;font-size:12px;line-height:1.5;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;margin-bottom:6px;">${tooltipInfo}</div>` : ''}
           <div style="color:#999;font-size:11px;">Learn more</div>
         </div>`
      : `<div style="max-width:240px;">
           <div style="font-weight:600;color:#1a1a1a;margin-bottom:4px;">${name}</div>
           <div style="color:#999;font-size:12px;">No data available</div>
         </div>`;

    (layer as L.Layer & { bindTooltip: (content: string, options?: { sticky?: boolean }) => void }).bindTooltip(tooltipContent, { sticky: true });
    
    // Variables pour gérer les timeouts
    let hoverTimeout: NodeJS.Timeout | null = null;

    // Clic seulement si le pays a des données
    const el = (layer as L.Layer & { getElement?: () => HTMLElement | undefined }).getElement?.();
    layer.on("click", () => {
      if (iso3 && score != null && onCountryClick) { // Vérification score != null
        onCountryClick(iso3);
      }
    });
    
    // Définir le curseur selon si le pays a des données
    if (el) {
      el.style.cursor = score != null ? 'pointer' : 'default';
      el.setAttribute("tabindex", score != null ? "0" : "-1");
      el.setAttribute("role", score != null ? "button" : "");
      el.setAttribute("aria-label", score != null ? `Voir ${name}` : `${name} - Aucune donnée`);
      
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

    // Interaction survol avec auto-fit SEULEMENT si le pays a des données
    (layer as L.Path).on("mouseover", () => {
      // Juste changer le style du trait, PAS de zoom
      (layer as L.Path).setStyle({ weight: 2 });
    });

    (layer as L.Path).on("mouseout", () => {
      // Retour au style normal
      (layer as L.Path).setStyle({ weight: 1 });
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

export default function MapView({ scoresByIso3, onCountryClick, zoomToCountry, tooltipInfoByIso3 = {} }: Props) {
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
        center={[0, 20]}  // Centré sur l'Afrique : latitude 0°, longitude 20°E
        zoom={3}          // Zoom plus proche pour voir l'Afrique entière
        minZoom={2}       // Zoom minimum adapté pour éviter de trop dézoomer
        maxZoom={5}       // Limite le zoom maximum si besoin
        style={{ height: "100%", width: "100%", backgroundColor: "#e8f4f8" }}
        worldCopyJump
        // IMPORTANT: Définir une couleur de fond pour la carte
        className="map-background"
      >
        {/* Corrige les tailles quand les layouts se stabilisent / quand les données arrivent */}
        <UseAutosize deps={[worldData]} />

        {/* 
        SUPPRIMÉ : TileLayer pour masquer la carte d'arrière-plan
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
            {/* FitBoundsOnData supprimé pour garder le focus sur l'Afrique */}
          </>
        )}
      </MapContainer>

      {/* Légende simple - commentée car plus de scores
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
      </div>*/}
    </div>
  );
}