"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CountryModal from "@/components/CountryModal";
import { useAllCountries } from "../hooks/useAllCountriesData";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-gray-100 animate-pulse rounded-xl" />
  ),
});

export default function Page() {
  const [selectedCountryIso3, setSelectedCountryIso3] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook simplifié qui récupère tous les pays
  const { countries, loading, error } = useAllCountries();

  // Handler pour l'ouverture du modal
  const handleCountryClick = (iso3: string) => {
    setSelectedCountryIso3(iso3);
    setIsModalOpen(true);
  };

  // Carte sans scores (tous les pays en gris ou couleur neutre)
  const neutralScores = countries.reduce((acc, country) => {
    acc[country.iso_a3.toUpperCase()] = 50; // Score neutre pour affichage uniforme
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Atlas des Environnements Médiatiques</h1>
        <p className="text-gray-600 mt-2">
          Explorez les environnements médiatiques des pays du monde
        </p>
      </header>

      {/* Zone de debug */}
      <div className="bg-blue-50 p-4 rounded-lg text-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="font-medium text-blue-800">État</p>
            <p className="text-blue-600">
              {loading ? "Chargement..." : error ? "Erreur" : "Prêt"}
            </p>
          </div>
          <div>
            <p className="font-medium text-blue-800">Pays disponibles</p>
            <p className="text-blue-600">{countries.length}</p>
          </div>
          <div>
            <p className="font-medium text-blue-800">Pays sélectionné</p>
            <p className="text-blue-600">{selectedCountryIso3 || "Aucun"}</p>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            <p className="font-medium">Erreur:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Liste des pays par région */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Pays disponibles</h2>
        
        {loading ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des pays...</p>
          </div>
        ) : countries.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-500">Aucun pays disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries.map((country) => (
              <div
                key={country.id}
                className="bg-white border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleCountryClick(country.iso_a3)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{country.name_fr}</p>
                    <p className="text-sm text-gray-500">
                      {country.region || "Non spécifiée"} • {country.iso_a3}
                    </p>
                  </div>
                  <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-600">🌍</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Carte interactive (sans scores) */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Carte interactive</h2>
        <MapView 
          scoresByIso3={neutralScores} 
          onCountryClick={handleCountryClick}
        />
        <div className="text-sm text-gray-600">
          Cliquez sur un pays pour explorer son environnement médiatique.
        </div>
      </section>

      {/* Modal des détails du pays */}
      <CountryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        iso3={selectedCountryIso3}
      />
    </main>
  );
}