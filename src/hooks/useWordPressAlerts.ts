// hooks/useWordPressAlerts.ts
import { useState, useEffect } from 'react';

export interface WordPressAlert {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  link: string;
  category: 'urgent' | 'info' | 'report';
  countryIso3?: string;
  countryName?: string; // ✅ AJOUT pour AlertCarousel
}

interface UseWordPressAlertsReturn {
  alerts: WordPressAlert[];
  loading: boolean;
  error: string | null;
  urgentCount: number;
  refetch: () => void;
}

interface WordPressPost {
  id: number;
  date: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  link: string;
  country?: string;
  acf?: {
    country?: string;
    country_iso3?: string;
  };
}

// Fonction pour nettoyer le HTML des excerpts WordPress
function stripHtml(html: string): string {
  return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\[&hellip;\]/g, '...')
      .trim();
}

// Fonction pour déterminer la catégorie
function determineCategory(post: WordPressPost): 'urgent' | 'info' | 'report' {
  const title = post.title?.rendered?.toLowerCase() || '';

  if (title.includes('report') || title.includes('annual')) {
    return 'report';
  }

  if (title.includes('detained') || title.includes('arrested') ||
      title.includes('attack') || title.includes('threat')) {
    return 'urgent';
  }

  return 'info';
}

// Fonction pour convertir le nom de pays en ISO3
function countryNameToISO3(countryName: string): string | undefined {
  if (!countryName) return undefined;

  const countryMap: Record<string, string> = {
    'ghana': 'GHA',
    'nigeria': 'NGA',
    'senegal': 'SEN',
    'mali': 'MLI',
    'benin': 'BEN',
    'burkina faso': 'BFA',
    'guinea': 'GIN',
    'guinea-bissau': 'GNB',
    "côte d'ivoire": 'CIV',
    'ivory coast': 'CIV',
    'togo': 'TGO',
    'liberia': 'LBR',
    'sierra leone': 'SLE',
    'gambia': 'GMB',
    'the gambia': 'GMB',
    'niger': 'NER',
    'cape verde': 'CPV',
    'mauritania': 'MRT',
  };

  const normalized = countryName.toLowerCase().trim();
  return countryMap[normalized];
}

// Fonction pour extraire le code pays ISO3
function extractCountryISO3(post: WordPressPost): string | undefined {
  // PRIORITÉ 1 : Champ 'country' de l'API
  if (post.country) {
    const iso3 = countryNameToISO3(post.country);
    if (iso3) return iso3;
  }

  // PRIORITÉ 2 : ACF custom field
  if (post.acf && post.acf.country) {
    const iso3 = countryNameToISO3(post.acf.country);
    if (iso3) return iso3;
  }

  if (post.acf && post.acf.country_iso3) {
    return post.acf.country_iso3;
  }

  // PRIORITÉ 3 : Fallback - Détecter depuis le titre/contenu
  const title = post.title?.rendered?.toLowerCase() || '';
  const content = post.content?.rendered?.toLowerCase() || '';
  const text = title + ' ' + content;

  const fallbackMap: Record<string, string> = {
    'ghana': 'GHA', 'ghanaian': 'GHA', 'accra': 'GHA',
    'nigeria': 'NGA', 'nigerian': 'NGA', 'lagos': 'NGA', 'abuja': 'NGA',
    'senegal': 'SEN', 'senegalese': 'SEN', 'dakar': 'SEN',
    'mali': 'MLI', 'malian': 'MLI', 'bamako': 'MLI',
    'benin': 'BEN', 'beninese': 'BEN', 'cotonou': 'BEN',
    'burkina faso': 'BFA', 'burkina': 'BFA', 'ouagadougou': 'BFA',
    'guinea': 'GIN', 'guinean': 'GIN', 'conakry': 'GIN',
    'guinea-bissau': 'GNB', 'bissau': 'GNB',
    "côte d'ivoire": 'CIV', 'ivory coast': 'CIV', 'ivorian': 'CIV', 'abidjan': 'CIV',
    'togo': 'TGO', 'togolese': 'TGO', 'lomé': 'TGO', 'lome': 'TGO',
    'liberia': 'LBR', 'liberian': 'LBR', 'monrovia': 'LBR',
    'sierra leone': 'SLE', 'freetown': 'SLE',
    'gambia': 'GMB', 'gambian': 'GMB', 'banjul': 'GMB',
    'niger': 'NER', 'nigerien': 'NER', 'niamey': 'NER',
    'cape verde': 'CPV', 'cabo verde': 'CPV', 'praia': 'CPV',
    'mauritania': 'MRT', 'nouakchott': 'MRT',
  };

  for (const [country, iso3] of Object.entries(fallbackMap)) {
    if (text.includes(country)) {
      return iso3;
    }
  }

  return undefined;
}

export const useWordPressAlerts = (): UseWordPressAlertsReturn => {
  const [alerts, setAlerts] = useState<WordPressAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
          'https://mfwa.org/wp-json/wp/v2/posts?categories=149&per_page=20&_embed'
      );

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data: WordPressPost[] = await response.json();

      const mappedAlerts: WordPressAlert[] = data.map((post) => ({
        id: post.id,
        title: stripHtml(post.title?.rendered || 'Sans titre'),
        excerpt: stripHtml(post.excerpt?.rendered || post.content?.rendered?.substring(0, 200) || ''),
        date: post.date,
        link: post.link,
        category: determineCategory(post),
        countryIso3: extractCountryISO3(post),
        // countryName sera ajouté par page.tsx via le mapping avec la base countries
        countryName: post.country || undefined,
      }));

      mappedAlerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAlerts(mappedAlerts);

    } catch (err) {
      console.error('Erreur lors du chargement des alertes MFWA:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const urgentCount = alerts.filter(a => a.category === 'urgent').length;

  return {
    alerts,
    loading,
    error,
    urgentCount,
    refetch: fetchAlerts
  };
};