// CountryModal.tsx - Version simplifiée avec appels Supabase directs
import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Radio, Tv, Newspaper, Globe, Shield, Users, Building, Gavel } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Ajustez le chemin selon votre structure

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryName: string;
  region?: string;
}

const CountryModal: React.FC<CountryModalProps> = ({ 
  isOpen, 
  onClose, 
  countryName, 
  region = 'Africa' 
}) => {
  const [mediaData, setMediaData] = useState<any>(null);
  const [rankingData, setRankingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && countryName) {
      fetchData();
    }
  }, [isOpen, countryName]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Récupérer le pays et ses données médiatiques
      const { data: countryWithMedia, error: countryError } = await supabase
        .from('countries')
        .select(`
          *,
          media_environment(*)
        `)
        .or(`name_fr.ilike.%${countryName}%,name_en.ilike.%${countryName}%`)
        .single();

      if (countryError) {
        throw new Error(`Pays introuvable: ${countryError.message}`);
      }

      // 2. Récupérer les données de ranking les plus récentes (optionnel)
      const { data: ranking } = await supabase
        .from('rankings')
        .select('*')
        .eq('country_id', countryWithMedia.id)
        .order('year', { ascending: false })
        .limit(1)
        .maybeSingle();

      setMediaData(countryWithMedia.media_environment?.[0] || null);
      setRankingData(ranking);
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const regionColors = {
    'Africa': 'from-orange-500 to-red-600',
    'Americas': 'from-orange-400 to-red-500',
    'Asia': 'from-red-500 to-red-700',
    'Europe': 'from-yellow-400 to-orange-500',
    'Oceania': 'from-green-400 to-blue-500',
    'default': 'from-gray-500 to-gray-700'
  };

  const gradientClass = regionColors[region as keyof typeof regionColors] || regionColors.default;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[80vh] bg-white shadow-2xl transform transition-all duration-600 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] translate-y-0">
        
        {/* Header avec gradient régional */}
        <div className={`bg-gradient-to-r ${gradientClass} text-white p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-12 bg-white bg-opacity-20 rounded flex items-center justify-center">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{countryName}</h2>
              <div className="flex items-center gap-4 text-white text-opacity-90">
                <span>{region} • Environnement Médiatique</span>
                {rankingData && (
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    Position {rankingData.position} • Score {rankingData.score_global?.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="h-[calc(100%-120px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p>{error}</p>
            </div>
          ) : mediaData ? (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Environnement Légal */}
                  {mediaData.legal_environment && (
                    <div className="bg-gray-50 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Gavel className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Environnement Légal</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{mediaData.legal_environment}</p>
                    </div>
                  )}

                  {/* Régulateurs */}
                  {mediaData.media_regulators && (
                    <div className="bg-gray-50 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Régulateurs des Médias</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{mediaData.media_regulators}</p>
                    </div>
                  )}

                  {/* Associations de Journalistes */}
                  {mediaData.journalists_associations && (
                    <div className="bg-gray-50 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Associations de Journalistes</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{mediaData.journalists_associations}</p>
                    </div>
                  )}

                  {/* Liberté Internet */}
                  {mediaData.internet_freedom && (
                    <div className="bg-gray-50 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold">État de la Liberté Internet</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{mediaData.internet_freedom}</p>
                    </div>
                  )}
                </div>

                {/* Sidebar avec données chiffrées */}
                <div className="space-y-4">
                  
                  {/* Scores RSF */}
                  {rankingData && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-3">Scores RSF {rankingData.year}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{rankingData.position}</div>
                          <div className="text-orange-700">Position</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{rankingData.score_global?.toFixed(1)}</div>
                          <div className="text-red-700">Score Global</div>
                        </div>
                        {rankingData.score_political && (
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">{rankingData.score_political.toFixed(1)}</div>
                            <div className="text-blue-700 text-xs">Politique</div>
                          </div>
                        )}
                        {rankingData.score_economic && (
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">{rankingData.score_economic.toFixed(1)}</div>
                            <div className="text-green-700 text-xs">Économique</div>
                          </div>
                        )}
                        {rankingData.score_legal && (
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">{rankingData.score_legal.toFixed(1)}</div>
                            <div className="text-purple-700 text-xs">Légal</div>
                          </div>
                        )}
                        {rankingData.score_social && (
                          <div className="text-center">
                            <div className="text-lg font-semibold text-indigo-600">{rankingData.score_social.toFixed(1)}</div>
                            <div className="text-indigo-700 text-xs">Social</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stations Radio */}
                  {mediaData.radio_stations && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Radio className="w-5 h-5 text-orange-500" />
                        <h4 className="font-semibold">Stations Radio</h4>
                      </div>
                      <p className="text-sm text-gray-600">{mediaData.radio_stations}</p>
                    </div>
                  )}

                  {/* Stations TV */}
                  {mediaData.tv_stations && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Tv className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">Stations TV</h4>
                      </div>
                      <p className="text-sm text-gray-600">{mediaData.tv_stations}</p>
                    </div>
                  )}

                  {/* Journaux */}
                  {mediaData.newspapers && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Newspaper className="w-5 h-5 text-green-500" />
                        <h4 className="font-semibold">Journaux</h4>
                      </div>
                      <p className="text-sm text-gray-600">{mediaData.newspapers}</p>
                    </div>
                  )}

                  {/* Médias en ligne */}
                  {mediaData.online_media && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-5 h-5 text-purple-500" />
                        <h4 className="font-semibold">Médias en Ligne</h4>
                      </div>
                      <p className="text-sm text-gray-600">{mediaData.online_media}</p>
                    </div>
                  )}

                  {/* Médias Leaders */}
                  {mediaData.leading_media && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <ExternalLink className="w-5 h-5 text-indigo-500" />
                        <h4 className="font-semibold">Médias Leaders</h4>
                      </div>
                      <p className="text-sm text-gray-600">{mediaData.leading_media}</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Aucune donnée disponible pour {countryName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryModal;