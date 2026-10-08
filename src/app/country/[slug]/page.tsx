// app/country/[slug]/page.tsx — Page indexable par pays (SSG + métadonnées SEO).
// URL basée sur le nom complet du pays (ex: /country/guinea-bissau), pas l'ISO3.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import CountryDetailContent from "@/components/country/CountryDetailContent";
import { slugifyCountryName } from "@/lib/slug";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

interface CountryRow extends RowDataPacket {
  id: number;
  iso_a3: string;
  name_fr: string;
  name_en: string;
  region: string | null;
  tooltip_info: string | null;
  updated_at: string | null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function getCountryBySlug(slug: string): Promise<CountryRow | null> {
  const [rows] = await pool.query<CountryRow[]>(
    `SELECT c.id, c.iso_a3, c.name_fr, c.name_en, c.region, c.tooltip_info, me.updated_at
     FROM countries c
     LEFT JOIN media_environment me ON me.country_id = c.id`
  );
  return rows.find((row) => slugifyCountryName(row.name_en) === slug) ?? null;
}

export async function generateStaticParams() {
  const [rows] = await pool.query<CountryRow[]>("SELECT name_en FROM countries");
  return rows.map((row) => ({ slug: slugifyCountryName(row.name_en) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = await getCountryBySlug(slug);

  if (!country) return {};

  // Titre sans suffixe : le template du layout parent ajoute déjà "| West Africa Mediascape".
  const title = `${country.name_en} — Media Freedom & Environment`;
  const description = country.tooltip_info
    ? stripHtml(country.tooltip_info).slice(0, 160)
    : `Explore the media landscape, legal environment, media regulators, and press freedom alerts for ${country.name_en}.`;
  const url = `${SITE_URL}/country/${slugifyCountryName(country.name_en)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      type: "article",
      modifiedTime: country.updated_at ?? undefined,
    },
    twitter: {
      card: "summary",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const country = await getCountryBySlug(slug);

  if (!country) notFound();

  const url = `${SITE_URL}/country/${slug}`;

  return (
    <>
      {/* JSON-LD : entité Pays + fil d'Ariane — signaux d'entité pour Google
          et les moteurs de réponse IA (AI Overviews, AI Mode, Gemini, etc.) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            url,
            name: `${country.name_en} — Media Freedom & Environment`,
            inLanguage: "en",
            isPartOf: {
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
            },
            dateModified: country.updated_at ?? undefined,
            about: {
              "@type": "Country",
              name: country.name_en,
              alternateName: country.name_fr !== country.name_en ? country.name_fr : undefined,
              identifier: country.iso_a3,
              containedInPlace: country.region
                ? { "@type": "AdministrativeArea", name: country.region }
                : undefined,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Map", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: country.name_en, item: url },
            ],
          }),
        }}
      />

      <CountryDetailContent iso3={country.iso_a3} />
    </>
  );
}
