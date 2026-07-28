// hooks/useCountryDetails.ts
import { useState, useEffect, useCallback  } from 'react';
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
      const res = await fetch(`/api/countries/${iso3.toUpperCase()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(`Pays introuvable pour ISO3 "${iso3}": ${json.error ?? res.statusText}`);
      }

      setCountryData(json.data as CountryWithMedia);

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
