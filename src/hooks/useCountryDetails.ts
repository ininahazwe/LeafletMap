// hooks/useCountryDetails.ts
import { useState, useEffect, useCallback  } from 'react';
import { supabase } from '@/lib/supabase';
import type { CountryWithMedia } from '@/app/types/database';

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

  const fetchCountryDetails = useCallback(async () => {
    if (!iso3) {
      setCountryData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      setCountryData(countryWithMedia as CountryWithMedia);

    } catch (err: unknown) {
      console.error('Error fetching country details:', err);
      setError(err instanceof Error ? err.message : 'Loading error des détails du pays');
      setCountryData(null);
    } finally {
      setLoading(false);
    }
  }, [iso3]);

  useEffect(() => {
    fetchCountryDetails();
  }, [fetchCountryDetails]);

  return {
    countryData,
    loading,
    error,
    refetch: fetchCountryDetails
  };
};