import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CountryWithMedia {
  id: number
  iso_a3: string
  name_fr: string
  name_en: string
  region: string | null
  media_environment: {
    id: number
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
  } | null
}

interface RankingData {
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

export const useCountryData = (countryName: string) => {
  const [countryData, setCountryData] = useState<CountryWithMedia | null>(null)
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCountryData = async () => {
    if (!countryName) return

    setLoading(true)
    setError(null)

    try {
      // 1. Récupérer le pays avec ses données médiatiques
      const { data: countryWithMedia, error: countryError } = await supabase
        .from('countries')
        .select(`
          *,
          media_environment(*)
        `)
        .or(`name_fr.ilike.%${countryName}%,name_en.ilike.%${countryName}%`)
        .single()

      if (countryError) {
        throw new Error(`Pays introuvable: ${countryError.message}`)
      }

      setCountryData(countryWithMedia)

      // 2. Récupérer les données de ranking les plus récentes
      const { data: ranking, error: rankingError } = await supabase
        .from('rankings')
        .select('*')
        .eq('country_id', countryWithMedia.id)
        .order('year', { ascending: false })
        .limit(1)
        .maybeSingle() // maybeSingle() ne lance pas d'erreur si pas de résultat

      if (rankingError && rankingError.code !== 'PGRST116') {
        console.warn('Erreur ranking:', rankingError)
      } else {
        setRankingData(ranking)
      }

    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données')
      console.error('Error fetching country data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountryData()
  }, [countryName])

  return {
    countryData,
    rankingData,
    loading,
    error,
    refetch: fetchCountryData
  }
}

// ============================================
// Exemple d'utilisation dans un autre composant
// import { useCountryData } from '@/hooks/useCountryData'
// 
// const ExampleComponent = () => {
//   const { countryData, rankingData, loading, error } = useCountryData('Benin')
//   
//   if (loading) return <div>Chargement...</div>
//   if (error) return <div>Erreur: {error}</div>
//   if (!countryData) return <div>Aucune donnée</div>
//   
//   return (
//     <div>
//       <h1>{countryData.name_fr}</h1>
//       {countryData.media_environment && (
//         <p>{countryData.media_environment.legal_environment}</p>
//       )}
//       {rankingData && (
//         <p>Position RSF: {rankingData.position}</p>
//       )}
//     </div>
//   )
// }