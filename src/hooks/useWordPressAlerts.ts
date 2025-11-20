// hooks/useWordPressAlerts.ts - VERSION AVEC CARACTÈRES SPÉCIAUX NETTOYÉS
import { useState, useEffect } from 'react';

export interface WordPressAlert {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  link: string;
  category: 'urgent' | 'info' | 'report';
  countryId?: number;
  countryName?: string;
}

interface UseWordPressAlertsReturn {
  alerts: WordPressAlert[];
  loading: boolean;
  error: string | null;
  urgentCount: number;
  refetch: () => void;
}

// Cache en mémoire pour les pays
const countryCache = new Map<number, string>();

// Map complète des entités HTML
const htmlEntities: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
  '&hellip;': '...',
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&ndash;': '–',
  '&mdash;': '—',
  '&lsquo;': "'",
  '&rsquo;': "'",
  '&bull;': '•',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&copy;': '©',
  '&reg;': '®',
  '&times;': '×',
  '&divide;': '÷',
  '&deg;': '°',
  '&permil;': '‰',
  '&dagger;': '†',
  '&Dagger;': '‡',
  '&lsaquo;': '‹',
  '&rsaquo;': '›',
  '&oline;': '‾',
  '&frasl;': '⁄',
  '&weierp;': '℘',
  '&image;': 'ℑ',
  '&real;': 'ℜ',
  '&trade;': '™',
  '&alefsym;': 'ℵ',
  '&larr;': '←',
  '&uarr;': '↑',
  '&rarr;': '→',
  '&darr;': '↓',
  '&harr;': '↔',
  '&crarr;': '↵',
};

/**
 * Nettoie le HTML et décode toutes les entités HTML
 * Gère aussi les entités numériques: &#160; ou &#x00A0;
 */
function stripHtml(html: string): string {
  if (!html) return '';

  let text = html;

  // Enlever les balises HTML
  text = text.replace(/<[^>]*>/g, '');

  // Remplacer les entités HTML nommées
  Object.entries(htmlEntities).forEach(([entity, char]) => {
    text = text.split(entity).join(char);
  });

  // Gérer les entités numériques décimales: &#123;
  text = text.replace(/&#(\d+);/g, (match, num) => {
    try {
      return String.fromCharCode(parseInt(num, 10));
    } catch {
      return match;
    }
  });

  // Gérer les entités numériques hexadécimales: &#x1F;
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return match;
    }
  });

  // Nettoyer les espaces multiples et les sauts de ligne
  text = text
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un
    .replace(/\n+/g, ' ') // Remplacer les sauts de ligne
    .trim();

  return text;
}

function determineCategory(post: any): 'urgent' | 'info' | 'report' {
  const title = post.title?.rendered?.toLowerCase() || '';

  if (title.includes('report') || title.includes('annual')) {
    return 'report';
  }

  if (
    title.includes('detained') ||
    title.includes('arrested') ||
    title.includes('attack') ||
    title.includes('threat') ||
    title.includes('violence') ||
    title.includes('crackdown')
  ) {
    return 'urgent';
  }

  return 'info';
}

async function fetchCountryName(countryId: number): Promise<string | undefined> {
  if (countryCache.has(countryId)) {
    return countryCache.get(countryId);
  }

  try {
    const response = await fetch(
      `https://mfwa.org/wp-json/wp/v2/country/${countryId}`
    );

    if (!response.ok) {
      console.warn(`Erreur API pays ${countryId}: ${response.status}`);
      return undefined;
    }

    const data = await response.json();
    const countryName = data.name || data.title?.rendered;

    if (countryName) {
      countryCache.set(countryId, countryName);
      return countryName;
    }
  } catch (err) {
    console.error(`Erreur lors de la récupération du pays ${countryId}:`, err);
  }

  return undefined;
}

async function resolveCountries(alerts: WordPressAlert[]): Promise<WordPressAlert[]> {
  const countryIds = new Set<number>();
  alerts.forEach((alert) => {
    if (alert.countryId) {
      countryIds.add(alert.countryId);
    }
  });

  const uncachedIds = Array.from(countryIds).filter((id) => !countryCache.has(id));

  await Promise.all(uncachedIds.map((id) => fetchCountryName(id)));

  return alerts.map((alert) => ({
    ...alert,
    countryName: alert.countryId ? countryCache.get(alert.countryId) : undefined,
  }));
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

      const data = await response.json();

      const mappedAlerts: WordPressAlert[] = data.map((post: any) => ({
        id: post.id,
        title: stripHtml(post.title?.rendered || 'Sans titre'),
        excerpt: stripHtml(post.excerpt?.rendered || post.content?.rendered?.substring(0, 200) || ''),
        date: post.date,
        link: post.link,
        category: determineCategory(post),
        countryId: post.country?.[0],
      }));

      mappedAlerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const alertsWithCountries = await resolveCountries(mappedAlerts);

      setAlerts(alertsWithCountries);
    } catch (err) {
      console.error('Erreur lors du chargement des alertes MFWA:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue lors du chargement des alertes');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const urgentCount = alerts.filter((a) => a.category === 'urgent').length;

  return {
    alerts,
    loading,
    error,
    urgentCount,
    refetch: fetchAlerts,
  };
};