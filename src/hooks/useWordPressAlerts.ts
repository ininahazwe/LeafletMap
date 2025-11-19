// hooks/useWordPressAlerts.ts
import { useState, useEffect } from 'react';

export interface WordPressAlert {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  link: string;
  category: 'urgent' | 'info' | 'report';
  country?: string; // ISO3 si l'alerte concerne un pays spécifique
}

// Fausses données pour la simulation
const FAKE_ALERTS: WordPressAlert[] = [
  {
    id: 1,
    title: "Journalist arrested in Mali",
    excerpt: "A prominent investigative journalist was detained by authorities in Bamako following critical reporting on government corruption.",
    date: "2025-11-18T14:30:00Z",
    link: "#",
    category: "urgent",
    country: "MLI"
  },
  {
    id: 2,
    title: "New media law threatens press freedom in Senegal",
    excerpt: "The National Assembly is debating controversial legislation that would impose heavy penalties on journalists for 'false news'.",
    date: "2025-11-17T09:15:00Z",
    link: "#",
    category: "urgent",
    country: "SEN"
  },
  {
    id: 3,
    title: "Ghana launches digital media literacy campaign",
    excerpt: "The government announces a nationwide initiative to combat misinformation and promote critical thinking among citizens.",
    date: "2025-11-16T11:00:00Z",
    link: "#",
    category: "info",
    country: "GHA"
  },
  {
    id: 4,
    title: "Annual West Africa Media Freedom Report 2025",
    excerpt: "Our comprehensive report shows mixed results: improvements in digital access but rising concerns over journalist safety.",
    date: "2025-11-15T08:00:00Z",
    link: "#",
    category: "report"
  },
  {
    id: 5,
    title: "Radio station shut down in Guinea",
    excerpt: "Authorities suspended operations of Radio Liberté citing 'administrative irregularities', raising concerns about media censorship.",
    date: "2025-11-14T16:45:00Z",
    link: "#",
    category: "urgent",
    country: "GIN"
  },
  {
    id: 6,
    title: "New internet restrictions in Burkina Faso",
    excerpt: "The government has implemented bandwidth throttling affecting online media outlets and social media platforms.",
    date: "2025-11-13T13:20:00Z",
    link: "#",
    category: "urgent",
    country: "BFA"
  },
  {
    id: 7,
    title: "Training workshop for journalists in Benin",
    excerpt: "MFWA organized a successful 3-day workshop on investigative journalism techniques and safety protocols.",
    date: "2025-11-12T10:30:00Z",
    link: "#",
    category: "info",
    country: "BEN"
  },
  {
    id: 8,
    title: "Côte d'Ivoire strengthens online media regulations",
    excerpt: "New decree requires all online news platforms to register with the regulatory authority and comply with editorial standards.",
    date: "2025-11-11T14:00:00Z",
    link: "#",
    category: "info",
    country: "CIV"
  }
];

interface UseWordPressAlertsReturn {
  alerts: WordPressAlert[];
  loading: boolean;
  error: string | null;
  urgentCount: number;
  refetch: () => void;
}

export const useWordPressAlerts = (): UseWordPressAlertsReturn => {
  const [alerts, setAlerts] = useState<WordPressAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // En production, ce serait :
      // const response = await fetch('https://your-wordpress-site.com/wp-json/wp/v2/posts?categories=alerts');
      // const data = await response.json();
      
      setAlerts(FAKE_ALERTS);
    } catch (err) {
      console.error('Error fetching WordPress alerts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Compter les alertes urgentes
  const urgentCount = alerts.filter(a => a.category === 'urgent').length;

  return {
    alerts,
    loading,
    error,
    urgentCount,
    refetch: fetchAlerts
  };
};