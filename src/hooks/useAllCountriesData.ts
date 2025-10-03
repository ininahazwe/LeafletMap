// hooks/useAllCountries.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { CountryListItem } from '../app/types/database';

interface UseAllCountriesReturn {
  countries: CountryListItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface SupabaseCountryRow {
  id: number;
  iso_a3: string;
  name_fr: string | null;
  name_en: string | null;
  region: string | null;
}

export const useAllCountries = (): UseAllCountriesReturn => {
  const [countries, setCountries] = useState<CountryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('countries')
        .select(`
          id,
          iso_a3,
          name_fr,
          name_en,
          region
        `)
        .order('name_fr', { ascending: true });

      if (supabaseError) {
        throw new Error(`Loading error: ${supabaseError.message}`);
      }

      // Transformation des données avec vérification
      const transformedData: CountryListItem[] = ((data as SupabaseCountryRow[]) || [])
        .filter(item => item.iso_a3)
        .map(item => ({
          id: item.id,
          iso_a3: item.iso_a3,
          name_fr: item.name_fr ?? '',
          name_en: item.name_en ?? '',
          region: item.region ?? ''
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