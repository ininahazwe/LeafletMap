// app/sitemap.ts — sitemap.xml généré dynamiquement (accueil + une entrée par pays).
// lastModified suit media_environment.updated_at quand disponible (signal de fraîcheur).
import type { MetadataRoute } from "next";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { slugifyCountryName } from "@/lib/slug";

interface CountryRow extends RowDataPacket {
  name_en: string;
  updated_at: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [rows] = await pool.query<CountryRow[]>(
    `SELECT c.name_en, me.updated_at
     FROM countries c
     LEFT JOIN media_environment me ON me.country_id = c.id`
  );

  const countryEntries: MetadataRoute.Sitemap = rows.map((row) => ({
    url: `${SITE_URL}/country/${slugifyCountryName(row.name_en)}`,
    lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...countryEntries,
  ];
}
