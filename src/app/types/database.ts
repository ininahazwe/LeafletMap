// types/database.ts
export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: number;
          iso_a3: string;
          name_fr: string;
          name_en: string;
          region: string | null;
        };
        Insert: {
          iso_a3: string;
          name_fr: string;
          name_en: string;
          region?: string | null;
        };
        Update: {
          iso_a3?: string;
          name_fr?: string;
          name_en?: string;
          region?: string | null;
        };
      };
      media_environment: {
        Row: {
          id: number;
          country_id: number;
          legal_environment: string | null;
          media_regulators: string | null;
          journalists_associations: string | null;
          radio_stations: string | null;
          tv_stations: string | null;
          newspapers: string | null;
          state_owned_media: string | null;
          news_agency: string | null;
          international_media: string | null;
          online_media: string | null;
          internet_freedom: string | null;
          leading_media: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          country_id: number;
          legal_environment?: string | null;
          media_regulators?: string | null;
          journalists_associations?: string | null;
          radio_stations?: string | null;
          tv_stations?: string | null;
          newspapers?: string | null;
          state_owned_media?: string | null;
          news_agency?: string | null;
          international_media?: string | null;
          online_media?: string | null;
          internet_freedom?: string | null;
          leading_media?: string | null;
        };
        Update: {
          country_id?: number;
          legal_environment?: string | null;
          media_regulators?: string | null;
          journalists_associations?: string | null;
          radio_stations?: string | null;
          tv_stations?: string | null;
          newspapers?: string | null;
          state_owned_media?: string | null;
          news_agency?: string | null;
          international_media?: string | null;
          online_media?: string | null;
          internet_freedom?: string | null;
          leading_media?: string | null;
        };
      };
      rankings: {
        Row: {
          id: number;
          country_id: number;
          year: number;
          position: number;
          score_global: number;
          score_political: number | null;
          score_economic: number | null;
          score_legal: number | null;
          score_social: number | null;
          score_security: number | null;
        };
        Insert: {
          country_id: number;
          year: number;
          position: number;
          score_global: number;
          score_political?: number | null;
          score_economic?: number | null;
          score_legal?: number | null;
          score_social?: number | null;
          score_security?: number | null;
        };
        Update: {
          country_id?: number;
          year?: number;
          position?: number;
          score_global?: number;
          score_political?: number | null;
          score_economic?: number | null;
          score_legal?: number | null;
          score_social?: number | null;
          score_security?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Types utilitaires de base
export type Country = Database['public']['Tables']['countries']['Row'];
export type MediaEnvironment = Database['public']['Tables']['media_environment']['Row'];

// SIMPLIFICATION : Plus de rankings, focus sur media_environment
export type CountryWithMedia = Country & {
  media_environment: MediaEnvironment | null;
};

// Type pour la liste des pays (sans scores)
export type CountryListItem = {
  id: number;
  iso_a3: string;
  name_fr: string;
  name_en: string;
  region: string | null;
};