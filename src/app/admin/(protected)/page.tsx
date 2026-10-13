"use client";

import { NavigateToResource } from "@refinedev/nextjs-router";

export default function AdminHome() {
  return <NavigateToResource resource="countries" />;
}
