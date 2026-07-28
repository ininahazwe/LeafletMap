"use client";

import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { BaseRecord } from "@refinedev/core";

interface ResourceListProps<T extends BaseRecord> {
  resource: string;
  columns: ColumnsType<T>;
}

export function ResourceList<T extends BaseRecord>({
  resource,
  columns,
}: ResourceListProps<T>) {
  const { tableProps } = useTable<T>({
    resource,
    syncWithLocation: true,
  });

  const fullColumns: ColumnsType<T> = [
    ...columns,
    {
      title: "Actions",
      dataIndex: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <EditButton hideText size="small" recordItemId={record.id} resource={resource} />
          <DeleteButton hideText size="small" recordItemId={record.id} resource={resource} />
        </Space>
      ),
    },
  ];

  return (
    <List>
      <Table {...tableProps} rowKey="id" columns={fullColumns} scroll={{ x: true }} />
    </List>
  );
}
