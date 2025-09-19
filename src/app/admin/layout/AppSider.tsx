"use client";
import React, { useMemo } from "react";
import { Layout, Menu, type MenuProps } from "antd";
import { useMenu, useGo } from "@refinedev/core";
import Image from "next/image";

export default function AppSider() {
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu();
  const go = useGo();

  const items = useMemo<MenuProps["items"]>(() => {
    const mapItems = (list: any[]): NonNullable<MenuProps["items"]> =>
      (list ?? []).map((i) => ({
        key: i.key ?? i.name ?? i.route,       // clé stable
        icon: i.icon,
        label: (
          <span
            onClick={() => {
              if (i.route) go({ to: i.route, type: "push" }); // ✅ navigate
            }}
          >
            {i.label ?? i.name}
          </span>
        ),
        children: i.children ? i.children.map((c: any) => ({
          key: c.key ?? c.name ?? c.route,
          icon: c.icon,
          label: <span onClick={() => c.route && go({ to: c.route, type: "push" })}>
            {c.label ?? c.name}
          </span>,
        })) : undefined,
      }));
    return mapItems(menuItems);
  }, [menuItems, go]);

  return (
    <Layout.Sider width={220} breakpoint="lg" collapsedWidth={64}>
      <div 
        className="logo"
        style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        onClick={() => go({ to: "/admin", type: "push" })}
      >
        <img src="logo.png" alt="Admin" width={132} height={32} />
      </div>
      <Menu
        mode="inline"
        selectedKeys={selectedKey ? [selectedKey] : []}
        defaultOpenKeys={defaultOpenKeys}
        items={items}   // ✅ plus de children JSX
      />
    </Layout.Sider>
  );
}
