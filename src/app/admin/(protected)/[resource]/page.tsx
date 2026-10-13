"use client";

import { notFound, useParams } from "next/navigation";
import { ResourceList } from "@/components/admin/ResourceList";
import { RESOURCES } from "@/lib/refine/resourceConfig";

export default function AdminListPage() {
  const { resource } = useParams<{ resource: string }>();
  const cfg = RESOURCES[resource];
  if (!cfg) return notFound();
  return <ResourceList resource={resource} columns={cfg.columns} />;
}
