"use client";

import { useOne } from "@refinedev/core";
import type { ColumnsType } from "antd/es/table";
import type { FieldConfig } from "@/components/admin/ResourceForm";

export interface ResourceConfig {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnsType<any>;
  fields: FieldConfig[];
}

function CountryName({ id }: { id?: number | string }) {
  const { result } = useOne({
    resource: "countries",
    id: id ?? "",
    queryOptions: { enabled: id !== undefined && id !== null },
  });
  const country = result as { name_fr?: string; name_en?: string } | undefined;
  return <>{country?.name_fr ?? country?.name_en ?? id ?? "-"}</>;
}

const countryColumn = {
  title: "Country",
  dataIndex: "country_id",
  render: (value: number | string) => <CountryName id={value} />,
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString("en-GB") : "-";

const required = [{ required: true, message: "Required field" }];

const mediaField = (name: string, label: string): FieldConfig => ({
  name,
  label,
  type: "richtext",
});

export const RESOURCES: Record<string, ResourceConfig> = {
  countries: {
    label: "Countries",
    columns: [
      { title: "ID", dataIndex: "id", width: 70 },
      { title: "ISO3", dataIndex: "iso_a3", width: 80 },
      { title: "Name (FR)", dataIndex: "name_fr" },
      { title: "Name (EN)", dataIndex: "name_en" },
      { title: "Region", dataIndex: "region" },
    ],
    fields: [
      {
        name: "iso_a3",
        label: "ISO3 code",
        rules: [{ required: true, len: 3, message: "3 letters required" }],
      },
      { name: "name_fr", label: "Name (FR)", rules: required },
      { name: "name_en", label: "Name (EN)", rules: required },
      { name: "region", label: "Region" },
      { name: "tooltip_info", label: "Map tooltip info", type: "textarea" },
    ],
  },

  media_environment: {
    label: "Media environment",
    columns: [
      { title: "ID", dataIndex: "id", width: 70 },
      countryColumn,
      {
        title: "Updated",
        dataIndex: "updated_at",
        render: (v: string) => formatDate(v),
      },
    ],
    fields: [
      { name: "country_id", label: "Country", type: "country-select", rules: required },
      mediaField("legal_environment", "Legal environment"),
      mediaField("media_regulators", "Media regulators"),
      mediaField("journalists_associations", "Journalists' associations"),
      mediaField("radio_stations", "Radio stations"),
      mediaField("tv_stations", "TV stations"),
      mediaField("newspapers", "Newspapers"),
      mediaField("state_owned_media", "State-owned media"),
      mediaField("news_agency", "News agency"),
      mediaField("international_media", "International media"),
      mediaField("online_media", "Online media"),
      mediaField("internet_freedom", "Internet freedom"),
      mediaField("leading_media", "Leading media"),
    ],
  },

  rankings: {
    label: "Rankings",
    columns: [
      { title: "ID", dataIndex: "id", width: 70 },
      countryColumn,
      { title: "Year", dataIndex: "year", width: 90 },
      { title: "Position", dataIndex: "position", width: 90 },
      { title: "Global score", dataIndex: "score_global" },
    ],
    fields: [
      { name: "country_id", label: "Country", type: "country-select", rules: required },
      { name: "year", label: "Year", type: "number", rules: required },
      { name: "position", label: "Position", type: "number", rules: required },
      { name: "score_global", label: "Global score", type: "number", rules: required },
      { name: "score_political", label: "Political score", type: "number" },
      { name: "score_economic", label: "Economic score", type: "number" },
      { name: "score_legal", label: "Legal score", type: "number" },
      { name: "score_social", label: "Social score", type: "number" },
      { name: "score_security", label: "Security score", type: "number" },
    ],
  },

  admin_users: {
    label: "Admin users",
    columns: [
      { title: "ID", dataIndex: "id", width: 70 },
      { title: "Email", dataIndex: "email" },
      { title: "Name", dataIndex: "name" },
      {
        title: "Created",
        dataIndex: "created_at",
        render: (v: string) => formatDate(v),
      },
    ],
    fields: [
      {
        name: "email",
        label: "Email",
        rules: [{ required: true, type: "email", message: "Valid email required" }],
      },
      { name: "name", label: "Name" },
      {
        name: "password",
        label: "Password",
        type: "password",
        optionalOnEdit: true,
        rules: [{ required: true, min: 8, message: "Minimum 8 characters" }],
      },
    ],
  },
};
