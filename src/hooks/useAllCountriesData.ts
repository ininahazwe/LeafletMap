// hooks/useAllCountriesData.ts
import { useState, useEffect } from 'react';
import type { CountryListItem } from '../app/types/database';

interface CountryWithTooltip extends CountryListItem {
  tooltip_info?: string;
}

interface UseAllCountriesReturn {
  countries: CountryWithTooltip[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ApiCountryRow {
  id: number;
  iso_a3: string;
  name_fr: string | null;
  name_en: string | null;
  region: string | null;
  tooltip_info?: string | null;
}

export const useAllCountries = (): UseAllCountriesReturn => {
  const [countries, setCountries] = useState<CountryWithTooltip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/countries');
      const json = await res.json();

      if (!res.ok) {
        throw new Error(`Loading error: ${json.error ?? res.statusText}`);
      }

      // Transformation des données avec vérification
      const transformedData: CountryWithTooltip[] = ((json.data as ApiCountryRow[]) || [])
        .filter(item => item.iso_a3)
        .map(item => ({
          id: item.id,
          iso_a3: item.iso_a3,
          name_fr: item.name_fr ?? '',
          name_en: item.name_en ?? '',
          region: item.region ?? '',
          tooltip_info: item.tooltip_info ?? undefined
        }));

      setCountries(transformedData);

    } catch (err: unknown) {
      console.error('Error fetching countries:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading countries');
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    countries,
    loading,
    error,
    refetch: fetchData
  };
};
