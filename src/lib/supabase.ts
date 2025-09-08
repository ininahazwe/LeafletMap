// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: number
          iso_a3: string
          name_fr: string
          name_en: string
          region: string | null
        }
        Insert: {
          iso_a3: string
          name_fr: string
          name_en: string
          region?: string | null
        }
        Update: {
          iso_a3?: string
          name_fr?: string
          name_en?: string
          region?: string | null
        }
      }
      media_environment: {
        Row: {
          id: number
          country_id: number
          legal_environment: string | null
          media_regulators: string | null
          journalists_associations: string | null
          radio_stations: string | null
          tv_stations: string | null
          newspapers: string | null
          state_owned_media: string | null
          news_agency: string | null
          international_media: string | null
          online_media: string | null
          internet_freedom: string | null
          leading_media: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          country_id: number
          legal_environment?: string | null
          media_regulators?: string | null
          journalists_associations?: string | null
          radio_stations?: string | null
          tv_stations?: string | null
          newspapers?: string | null
          state_owned_media?: string | null
          news_agency?: string | null
          international_media?: string | null
          online_media?: string | null
          internet_freedom?: string | null
          leading_media?: string | null
        }
        Update: {
          country_id?: number
          legal_environment?: string | null
          media_regulators?: string | null
          journalists_associations?: string | null
          radio_stations?: string | null
          tv_stations?: string | null
          newspapers?: string | null
          state_owned_media?: string | null
          news_agency?: string | null
          international_media?: string | null
          online_media?: string | null
          internet_freedom?: string | null
          leading_media?: string | null
        }
      }
      rankings: {
        Row: {
          id: number
          country_id: number
          year: number
          position: number
          score_global: number
          score_political: number | null
          score_economic: number | null
          score_legal: number | null
          score_social: number | null
          score_security: number | null
        }
        Insert: {
          country_id: number
          year: number
          position: number
          score_global: number
          score_political?: number | null
          score_economic?: number | null
          score_legal?: number | null
          score_social?: number | null
          score_security?: number | null
        }
        Update: {
          country_id?: number
          year?: number
          position?: number
          score_global?: number
          score_political?: number | null
          score_economic?: number | null
          score_legal?: number | null
          score_social?: number | null
          score_security?: number | null
        }
      }
    }
  }
}