// hooks/useCountryDetails.ts
import { useState, useEffect, useCallback  } from 'react';
import { api, ApiError } from '@/lib/api';
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
      const countryWithMedia = await api.get<CountryWithMedia>(
        `/country.php?iso3=${encodeURIComponent(iso3.toUpperCase())}`
      );

      setCountryData(countryWithMedia);

    } catch (err: unknown) {
      console.error('Error fetching country details:', err);
      const message = err instanceof ApiError
        ? `Pays introuvable pour ISO3 "${iso3}": ${err.message}`
        : (err instanceof Error ? err.message : 'Loading error des détails du pays');
      setError(message);
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
