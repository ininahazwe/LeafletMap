"use client";

import { List, EditButton, CreateButton, useTable } from "@refinedev/antd";
import { Table } from "antd";

export const dynamic = 'force-dynamic';

type Country = {
  id: number;
  iso_a3: string;
  name_fr: string;
  name_en: string;
  region: string | null;
};

export default function CountriesList() {
  const { tableProps } = useTable<Country>({
    resource: "countries",
    sorters: { initial: [{ field: "name_fr", order: "asc" }] },
    pagination: { pageSize: 20 },
  });

  return (
    <List headerButtons={<CreateButton />}>
      <Table rowKey="id" {...tableProps}>
        <Table.Column dataIndex="iso_a3" title="ISO A3" />
        <Table.Column dataIndex="name_fr" title="Nom (FR)" />
        <Table.Column dataIndex="name_en" title="Name (EN)" />
        <Table.Column dataIndex="region" title="Région" />
        <Table.Column<Country>
          title="Actions"
          render={(_, r) => <EditButton size="small" recordItemId={r.id} />}
        />
      </Table>
    </List>
  );
}
