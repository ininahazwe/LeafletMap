"use client";

import { notFound, useParams } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { RESOURCES } from "@/lib/refine/resourceConfig";

export default function AdminCreatePage() {
  const { resource } = useParams<{ resource: string }>();
  const cfg = RESOURCES[resource];
  if (!cfg) return notFound();
  return <ResourceForm resource={resource} fields={cfg.fields} mode="create" />;
}
