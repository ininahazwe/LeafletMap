// hooks/useCountryAlerts.ts
// Récupère les alertes MFWA d'un pays via la vraie taxonomie WordPress "country"
// (fiable, contrairement à la détection par mots-clés utilisée dans useWordPressAlerts).
import { useState, useEffect, useCallback } from "react";
import { stripHtml, determineCategory, type WordPressPost } from "./useWordPressAlerts";

export interface CountryAlert {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  year: number;
  link: string;
  category: "urgent" | "info" | "report";
}

interface UseCountryAlertsReturn {
  alerts: CountryAlert[];
  years: number[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const WP_BASE = "https://mfwa.org/wp-json/wp/v2";

/** Slugs de la taxonomie "country" de mfwa.org qui ne correspondent pas
 * simplement au nom anglais slugifié. */
const ISO3_TO_WP_SLUG: Record<string, string> = {
  CIV: "cote-divoire",
  GNB: "guinea-bissau",
  CPV: "cape-verde",
  BFA: "burkina-faso",
  SLE: "sierra-leone",
  GMB: "gambia",
};

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "") // retire les diacritiques (é -> e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function resolveCountryTermId(
  iso3: string,
  nameEn: string
): Promise<number | null> {
  const slug = ISO3_TO_WP_SLUG[iso3] ?? slugify(nameEn);

  const res = await fetch(`${WP_BASE}/country?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) return null;

  const terms: Array<{ id: number }> = await res.json();
  return terms[0]?.id ?? null;
}

async function fetchAllPostsForTerm(termId: number): Promise<WordPressPost[]> {
  const perPage = 100;
  let page = 1;
  let all: WordPressPost[] = [];

  // Garde-fou : 10 pages max (1000 posts) pour éviter une boucle infinie
  for (let i = 0; i < 10; i++) {
    const res = await fetch(
      `${WP_BASE}/country-highlights?country=${termId}&per_page=${perPage}&page=${page}&_fields=id,date,link,title,excerpt`
    );

    if (!res.ok) break;

    const batch: WordPressPost[] = await res.json();
    all = all.concat(batch);

    const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1");
    if (page >= totalPages || batch.length === 0) break;
    page++;
  }

  return all;
}

export const useCountryAlerts = (
  iso3: string | undefined,
  nameEn: string | undefined
): UseCountryAlertsReturn => {
  const [alerts, setAlerts] = useState<CountryAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!iso3 || !nameEn) {
      setAlerts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const termId = await resolveCountryTermId(iso3, nameEn);

      if (!termId) {
        setAlerts([]);
        return;
      }

      const posts = await fetchAllPostsForTerm(termId);

      const mapped: CountryAlert[] = posts.map((post) => ({
        id: post.id,
        title: stripHtml(post.title?.rendered || "Sans titre"),
        excerpt: stripHtml(post.excerpt?.rendered || ""),
        date: post.date,
        year: new Date(post.date).getFullYear(),
        link: post.link,
        category: determineCategory(post),
      }));

      mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAlerts(mapped);
    } catch (err) {
      console.error("Erreur lors du chargement des alertes du pays:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [iso3, nameEn]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const years = Array.from(new Set(alerts.map((a) => a.year))).sort((a, b) => b - a);

  return { alerts, years, loading, error, refetch: fetchAlerts };
};
