"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import CountryModal from "@/components/CountryModal";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-gray-100 animate-pulse rounded-xl" />
  ),
});

type Row = {
  id: number;
  position: number;
  score_global: number;
  country: { iso_a3: string; name_fr: string; name_en: string };
};

type CountryData = {
  iso3: string;
  name: string;
  score?: number;
};

export default function Page() {
  const [year, setYear] = useState<number>(2025);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("rankings")
          .select(
            "id, position, score_global, country:countries(iso_a3,name_fr,name_en)"
          )
          .eq("year", year)
          .order("position", { ascending: true });

        if (!ignore) {
          if (error) {
            console.error(error);
            setError(error.message);
            setRows([]);
          } else {
            setRows((data as any) ?? []);
          }
          setLoading(false);
        }
      } catch (e: any) {
        if (!ignore) {
          setError(e?.message ?? "Erreur inconnue");
          setLoading(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [year]);

  // Map ISO3 -> score
  const scoresByIso3 = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of rows) {
      const iso = r.country?.iso_a3?.toUpperCase?.();
      if (iso) map[iso] = r.score_global;
    }
    return map;
  }, [rows]);

  // Map ISO3 -> données complètes pour le modal
  const countryDataByIso3 = useMemo(() => {
    const map: Record<string, CountryData> = {};
    for (const r of rows) {
      const iso = r.country?.iso_a3?.toUpperCase?.();
      if (iso) {
        map[iso] = {
          iso3: iso,
          name: r.country?.name_fr ?? r.country?.name_en ?? iso,
          score: r.score_global
        };
      }
    }
    return map;
  }, [rows]);

  // Fallback de test si base vide (utile en dev)
  const testScores: Record<string, number> = {
    FRA: 85.5,
    GHA: 32.1,
    USA: 72.3,
    CAN: 83.2,
    DEU: 82.1,
    GBR: 78.9,
    JPN: 69.7,
    BRA: 41.8,
    AUS: 81.7,
    CHN: 58.4,
  };
  const finalScores =
    Object.keys(scoresByIso3).length > 0 ? scoresByIso3 : testScores;

  // Handler pour ouvrir le modal
  const handleCountryClick = (iso3: string) => {
    // Chercher dans les vraies données d'abord
    let countryData = countryDataByIso3[iso3];
    
    // Sinon utiliser les données de test
    if (!countryData && testScores[iso3]) {
      countryData = {
        iso3,
        name: iso3, // On n'a que l'ISO en test
        score: testScores[iso3]
      };
    }
    
    if (countryData) {
      setSelectedCountry(countryData);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Classement {year}</h1>
        <select
          className="border rounded px-3 py-2"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {[2025, 2024, 2023].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </header>

      {/* Zone debug rapide */}
      <div className="bg-blue-50 p-4 rounded-lg text-sm">
        <p>
          <strong>Chargement:</strong> {loading ? "Oui" : "Non"}
        </p>
        <p>
          <strong>Erreur:</strong> {error || "Aucune"}
        </p>
        <p>
          <strong>Pays (liste):</strong> {rows.length}
        </p>
        <p>
          <strong>Pays avec score (carte):</strong> {Object.keys(scoresByIso3).length}
        </p>
        <p>
          <strong>Données de test utilisées:</strong>{" "}
          {Object.keys(scoresByIso3).length === 0 ? "Oui" : "Non"}
        </p>
      </div>

      {/* Liste */}
      {loading ? (
        <p>Chargement…</p>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          <p>
            <strong>Erreur:</strong> {error}
          </p>
        </div>
      ) : (
        <ul className="divide-y bg-white rounded-xl border">
          {rows.length === 0 ? (
            <li className="p-4 text-gray-500">Aucune donnée pour {year}</li>
          ) : (
            rows.map((r) => (
              <li
                key={r.id}
                className="py-3 px-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => handleCountryClick(r.country?.iso_a3?.toUpperCase())}
              >
                <span className="w-12 text-right">{r.position}</span>
                <span className="flex-1 pl-4">
                  {r.country?.name_fr ?? r.country?.name_en}
                </span>
                <span className="w-24 text-right">
                  {r.score_global?.toFixed(3)}
                </span>
              </li>
            ))
          )}
        </ul>
      )}

      {/* Carte */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Carte {year}</h2>
        <MapView 
          scoresByIso3={finalScores} 
          onCountryClick={handleCountryClick}
        />
        <div className="text-sm text-gray-600">
          Légende : ≥80 bleu, ≥65 vert, ≥50 orange, ≥35 rouge, sinon violet.
        </div>
      </section>

      {/* Modal */}
      <CountryModal 
        country={selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
    </main>
  );
}