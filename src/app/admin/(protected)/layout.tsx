"use client";

import { useState } from "react";
import {
  Authenticated,
  useGetIdentity,
  useLink,
  useLogout,
  useMenu,
} from "@refinedev/core";
import { Button, Layout, Menu, Space, Typography } from "antd";
import { LogoutOutlined, UnorderedListOutlined } from "@ant-design/icons";

const { Sider, Header, Content } = Layout;

// Layout maison (au lieu de ThemedLayout) : le Sider de @refinedev/antd utilise
// <Menu> avec des children, ce qui déclenche l'avertissement antd
// "`children` is deprecated. Please use `items` instead". Ici on passe `items`.
function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const Link = useLink();
  const { menuItems, selectedKey } = useMenu();
  const { mutate: logout, isPending } = useLogout();
  const { data: user } = useGetIdentity<{ name?: string; email?: string }>();

  const items = menuItems.map((item) => ({
    key: item.key ?? item.name,
    icon: item.icon ?? <UnorderedListOutlined />,
    label: <Link to={item.route ?? "/"}>{item.label ?? item.name}</Link>,
  }));

  return (
    <Layout style={{ minHeight: "100vh" }} hasSider>
      <Sider
        theme="dark"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        width={240}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 24px",
            color: "#fff",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {collapsed ? "M" : "Mediascape Admin"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 24px",
          }}
        >
          <Space size="middle">
            {(user?.name || user?.email) && (
              <Typography.Text strong>{user?.name || user?.email}</Typography.Text>
            )}
            <Button
              icon={<LogoutOutlined />}
              loading={isPending}
              onClick={() => logout()}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticated key="admin-protected" redirectOnFail="/admin/login">
      <AdminShell>{children}</AdminShell>
    </Authenticated>
  );
}
