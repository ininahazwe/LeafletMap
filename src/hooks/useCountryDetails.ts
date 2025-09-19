// hooks/useCountryDetails.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { CountryWithMedia } from '../app/types/database';

interface UseCountryDetailsReturn {
  countryData: CountryWithMedia | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCountryDetails = (iso3: string): UseCountryDetailsReturn => {
  const [countryData, setCountryData] = useState<CountryWithMedia | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountryDetails = async () => {
    if (!iso3) {
      setCountryData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer le pays avec media_environment uniquement
      const { data: countryWithMedia, error: countryError } = await supabase
        .from('countries')
        .select(`
          *,
          media_environment(*)
        `)
        .eq('iso_a3', iso3.toUpperCase())
        .single();

      if (countryError) {
        throw new Error(`Pays introuvable pour ISO3 "${iso3}": ${countryError.message}`);
      }

      // Construire l'objet final (simplifié)
      const completeData: CountryWithMedia = {
        ...countryWithMedia,
        media_environment: countryWithMedia.media_environment || null
      };

      setCountryData(completeData);

    } catch (err: any) {
      console.error('Error fetching country details:', err);
      setError(err.message || 'Loading error des détails du pays');
      setCountryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountryDetails();
  }, [iso3]);

  return {
    countryData,
    loading,
    error,
    refetch: fetchCountryDetails
  };
};