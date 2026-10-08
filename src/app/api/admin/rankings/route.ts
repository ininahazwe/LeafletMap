import { NextRequest } from "next/server";
import { listResource, createResource, type CrudConfig } from "@/lib/adminCrud";

const config: CrudConfig = {
  table: "rankings",
  allowedFields: [
    "country_id",
    "year",
    "position",
    "score_global",
    "score_political",
    "score_economic",
    "score_legal",
    "score_social",
    "score_security",
  ],
  defaultSort: "year",
};

export async function GET(req: NextRequest) {
  return listResource(req, config);
}

export async function POST(req: NextRequest) {
  return createResource(req, config);
}
