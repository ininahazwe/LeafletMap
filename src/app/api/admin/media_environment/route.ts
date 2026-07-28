import { NextRequest } from "next/server";
import { listResource, createResource, type CrudConfig } from "@/lib/adminCrud";

const config: CrudConfig = {
  table: "media_environment",
  allowedFields: [
    "country_id",
    "legal_environment",
    "media_regulators",
    "journalists_associations",
    "radio_stations",
    "tv_stations",
    "newspapers",
    "state_owned_media",
    "news_agency",
    "international_media",
    "online_media",
    "internet_freedom",
    "leading_media",
  ],
  defaultSort: "id",
};

export async function GET(req: NextRequest) {
  return listResource(req, config);
}

export async function POST(req: NextRequest) {
  return createResource(req, config);
}
