import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { cached, CACHE_TTL_MS, PUBLIC_CACHE_HEADERS } from "@/lib/memoryCache";

interface CountryListRow extends RowDataPacket {
  id: number;
  iso_a3: string;
  name_fr: string;
  name_en: string;
  region: string | null;
  tooltip_info: string | null;
}

export async function GET() {
  try {
    const rows = await cached("countries:list", CACHE_TTL_MS, async () => {
      const [r] = await pool.query<CountryListRow[]>(
        `SELECT id, iso_a3, name_fr, name_en, region, tooltip_info
         FROM countries
         ORDER BY name_fr ASC`
      );
      return r;
    });

    return NextResponse.json({ data: rows }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/countries error:", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des pays" },
      { status: 500 }
    );
  }
}
