"use client";

import "@ant-design/v5-patch-for-react-19";
import { Suspense } from "react";
import { Refine } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/antd";
import routerProvider from "@refinedev/nextjs-router";
import dataProvider from "@refinedev/simple-rest";
import { App as AntdApp, ConfigProvider } from "antd";
import "@refinedev/antd/dist/reset.css";
import { authProvider } from "@/lib/refine/authProvider";
import { RESOURCES } from "@/lib/refine/resourceConfig";

const API_URL = "/api/admin";

const refineResources = Object.entries(RESOURCES).map(([name, cfg]) => ({
  name,
  list: `/admin/${name}`,
  create: `/admin/${name}/create`,
  edit: `/admin/${name}/edit/:id`,
  meta: { label: cfg.label },
}));

function RefineApp({ children }: { children: React.ReactNode }) {
  const notificationProvider = useNotificationProvider();
  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProvider(API_URL)}
      authProvider={authProvider}
      notificationProvider={notificationProvider}
      resources={refineResources}
      options={{
        syncWithLocation: true,
        disableTelemetry: true,
        title: { text: "Mediascape Admin" },
      }}
    >
      {children}
    </Refine>
  );
}

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ConfigProvider theme={{ token: { colorPrimary: "#2E4057" } }}>
        <AntdApp>
          <RefineApp>{children}</RefineApp>
        </AntdApp>
      </ConfigProvider>
    </Suspense>
  );
}
