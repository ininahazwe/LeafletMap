import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";

interface CountryRow extends RowDataPacket {
  id: number;
  iso_a3: string;
  name_fr: string;
  name_en: string;
  region: string | null;
  tooltip_info: string | null;
}

interface MediaEnvironmentRow extends RowDataPacket {
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
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ iso3: string }> }
) {
  try {
    const { iso3 } = await params;

    if (!iso3) {
      return NextResponse.json({ error: "iso3 requis" }, { status: 400 });
    }

    const [countryRows] = await pool.query<CountryRow[]>(
      `SELECT id, iso_a3, name_fr, name_en, region, tooltip_info
       FROM countries
       WHERE iso_a3 = ?
       LIMIT 1`,
      [iso3.toUpperCase()]
    );

    const country = countryRows[0];
    if (!country) {
      return NextResponse.json(
        { error: `Pays introuvable pour ISO3 "${iso3}"` },
        { status: 404 }
      );
    }

    const [mediaRows] = await pool.query<MediaEnvironmentRow[]>(
      `SELECT *
       FROM media_environment
       WHERE country_id = ?
       LIMIT 1`,
      [country.id]
    );

    const data = {
      ...country,
      media_environment: mediaRows[0] ?? null,
    };

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/countries/[iso3] error:", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement du pays" },
      { status: 500 }
    );
  }
}
