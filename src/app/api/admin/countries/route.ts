import { NextRequest } from "next/server";
import { listResource, createResource, type CrudConfig } from "@/lib/adminCrud";

const config: CrudConfig = {
  table: "countries",
  allowedFields: ["iso_a3", "name_fr", "name_en", "region", "tooltip_info"],
  defaultSort: "name_fr",
};

export async function GET(req: NextRequest) {
  return listResource(req, config);
}

export async function POST(req: NextRequest) {
  return createResource(req, config);
}
