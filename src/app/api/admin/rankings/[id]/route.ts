import { NextRequest } from "next/server";
import {
  getResource,
  updateResource,
  deleteResource,
  type CrudConfig,
} from "@/lib/adminCrud";

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
