import { NextRequest } from "next/server";
import {
  getResource,
  updateResource,
  deleteResource,
  type CrudConfig,
} from "@/lib/adminCrud";

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
};

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return getResource(req, config, id);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return updateResource(req, config, id);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return updateResource(req, config, id);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return deleteResource(req, config, id);
}
