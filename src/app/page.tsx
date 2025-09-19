"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CountryModal from "@/components/CountryModal";
import { useAllCountries } from "../hooks/useAllCountriesData";
import { Search, X, Menu, Globe, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Map loading...</p>
      </div>
    </div>
  ),
});

export default function Page() {
  const [selectedCountryIso3, setSelectedCountryIso3] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Hook simplifié qui récupère tous les pays
  const { countries, loading, error } = useAllCountries();

  // Handler pour l'ouverture du modal
  const handleCountryClick = (iso3: string) => {
    setSelectedCountryIso3(iso3);
    setIsModalOpen(true);
    // Replier la sidebar quand le modal s'ouvre
    setSidebarOpen(false);
  };

  // Handler pour la fermeture du modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Rouvrir la sidebar quand le modal se ferme
    setSidebarOpen(true);
  };

  // Créer des scores variés pour avoir des couleurs différentes par pays
  const generateScoresByIso3 = () => {
    return countries.reduce((acc, country) => {
      // Générer un score basé sur l'ISO3 pour avoir des couleurs différentes
      const hash = country.iso_a3.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      // Score entre 30 et 95 pour avoir toute la gamme de couleurs
      const score = 30 + (Math.abs(hash) % 66);
      acc[country.iso_a3.toUpperCase()] = score;
      return acc;
    }, {} as Record<string, number>);
  };

  const scoresByIso3 = generateScoresByIso3();

  // Filtrer les pays selon la Search
  const filteredCountries = countries.filter(country =>
    country.name_fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.iso_a3.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grouper les pays par région
  const countriesByRegion = filteredCountries.reduce((acc, country) => {
    const region = country.region || "Non spécifiée";
    if (!acc[region]) acc[region] = [];
    acc[region].push(country);
    return acc;
  }, {} as Record<string, typeof countries>);

  // Fonction identique pour cohérence avec MapView
  const getCountryColorByISO3 = (iso3: string): string => {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57",
      // ... même palette que dans MapView
    ];
    
    const hash = iso3.split('').reduce((acc, char) => {
      acc = ((acc << 5) - acc) + char.charCodeAt(0);
      return acc & acc;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Fonction pour obtenir la couleur du pays
  const getCountryColor = (iso3: string) => {
    const score = scoresByIso3[iso3.toUpperCase()];
    if (!score) return "#e5e7eb";
    
    if (score >= 80) return "#0066cc";
    if (score >= 65) return "#28a745";
    if (score >= 50) return "#ffc107";
    if (score >= 35) return "#fd7e14";
    return "#dc3545";
  };

  return (
    <div className="fixed inset-0 flex bg-gray-50">
      
      {/* Zone principale de la carte */}
      <div className={`transition-all duration-300 flex-1 relative ${
        sidebarOpen && !isModalOpen ? 'mr-96' : 
        !sidebarOpen && !isModalOpen ? 'mr-16' : 
        'mr-16' // Quand modal ouvert, sidebar réduite
      }`}>
        
        {/* Header de la carte */}
        <div className="absolute top-0 left-0 right-0 z-999 bg-white/90 backdrop-blur border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Atlas of Media Environments</h1>
              <p className="text-gray-600 text-sm">
                {countries.length} countries • Click to explore
              </p>
            </div>
            
            {/* Bouton toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-white shadow-lg rounded-lg p-3 hover:shadow-xl transition-all duration-200"
              disabled={isModalOpen} // Désactiver quand modal ouvert
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Zone de la carte */}
        <div className="h-full pt-20">
          {loading ? (
            <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Map loading...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center bg-red-50">
              <div className="text-center text-red-600">
                <p className="font-medium">Loading error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <MapView 
              scoresByIso3={scoresByIso3} 
              onCountryClick={handleCountryClick}
              zoomToCountry={isModalOpen ? selectedCountryIso3 : undefined}
            />
          )}
        </div>

        {/* Pays sélectionné - overlay */}
        {selectedCountryIso3 && !isModalOpen && (
          <div className="absolute top-24 left-6 bg-white/90 backdrop-blur rounded-lg p-4 shadow-xl max-w-sm z-20">
            <div className="flex items-center gap-3">
              <div 
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: getCountryColor(selectedCountryIso3) }}
              ></div>
              <div>
                <h3 className="font-semibold">
                  {countries.find(c => c.iso_a3 === selectedCountryIso3)?.name_fr}
                </h3>
                {/* <p className="text-sm text-gray-600">
                  Score: {scoresByIso3[selectedCountryIso3.toUpperCase()]}
                </p> */}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar des pays - Version étendue */}
      <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-all duration-300 z-30 flex flex-col ${
        sidebarOpen && !isModalOpen ? 'w-96 translate-x-0' : 'w-16 translate-x-0'
      }`}>
        
        {/* Mode étendu */}
        {sidebarOpen && !isModalOpen && (
          <>
            {/* Header sidebar */}
            <div className="sidebar-full p-6 border-b border-gray-200 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Globe size={24} />
                  Countries of the World
                </h2>
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {filteredCountries.length} countries
                </div>
              </div>
              
              {/* Barre de Search */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
                <input
                  type="text"
                  placeholder="Search for a country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Liste des pays */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : Object.entries(countriesByRegion).map(([region, regionCountries]) => (
                <div key={region} className="border-b border-gray-100">
                  
                  {/* En-tête de région */}
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <MapPin size={16} />
                      {region} ({regionCountries.length})
                    </h3>
                  </div>
                  
                  {/* Pays de la région */}
                  <div>
                    {regionCountries.map((country) => (
                      <div
                        key={country.id}
                        onClick={() => handleCountryClick(country.iso_a3)}
                        className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          selectedCountryIso3 === country.iso_a3 ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                style={{ backgroundColor: getCountryColorByISO3(country.iso_a3) }}
                              ></div>
                              <h4 className="font-medium text-gray-800">{country.name_fr}</h4>
                            </div>
                            <div className="ml-7 flex items-center justify-between">
                              <span className="text-sm text-gray-600">{country.iso_a3}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {filteredCountries.length === 0 && searchTerm && (
                <div className="p-6 text-center text-gray-500">
                  <p>No countries found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Mode replié - Seulement Search */}
        {(!sidebarOpen || isModalOpen) && (
          <div className="sidebar-squized h-full flex flex-col items-center py-4">
            {/* Bouton pour étendre */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white hover:bg-white/20 p-3 rounded-lg transition-colors mb-4"
              disabled={isModalOpen}
            >
              <ChevronLeft size={20} color="var(--honshu-blue-primary)" />
            </button>
            
            {/* Search compacte en vertical 
            <div className="transform -rotate-90 origin-center text-white text-sm whitespace-nowrap">
              Search
            </div>*/}
            
            <div className="flex-1 flex items-center">
              <Search size={24} className="text-white/70 transform rotate-90" />
            </div>
          </div>
        )}
      </div>

      {/* Modal des détails du pays */}
      <CountryModal 
        isOpen={isModalOpen}
        onClose={handleModalClose} // Utiliser le nouveau handler
        iso3={selectedCountryIso3}
      />
    </div>
  );
}