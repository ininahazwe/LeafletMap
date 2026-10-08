import { NextRequest } from "next/server";
import {
  getResource,
  updateResource,
  deleteResource,
  type CrudConfig,
} from "@/lib/adminCrud";

const config: CrudConfig = {
  table: "countries",
  allowedFields: ["iso_a3", "name_fr", "name_en", "region", "tooltip_info"],
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
