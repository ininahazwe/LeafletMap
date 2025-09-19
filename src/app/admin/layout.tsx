"use client";
import React from "react";
import { Refine, Authenticated } from "@refinedev/core";
import { 
  RefineThemes, 
  ThemedLayout as ThemedLayoutV2, 
  useNotificationProvider,
  AuthPage 
} from "@refinedev/antd";
import { ConfigProvider, Layout as AntdLayout, App } from "antd";
import "@refinedev/antd/dist/reset.css";
import "@ant-design/v5-patch-for-react-19";
import routerBindings from "@refinedev/nextjs-router";
import { dataProvider as supabaseDataProvider } from "@refinedev/supabase";
import { supabase } from "@/lib/supabase";
import { authProvider } from "@/lib/refine/authProvider";
import AppSider from "@/app/admin/layout/AppSider";
import AppHeader from "@/app/admin/layout/AppHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={RefineThemes.Blue}>
      <Refine
        dataProvider={supabaseDataProvider(supabase)}
        routerProvider={routerBindings}
        notificationProvider={useNotificationProvider}
        authProvider={authProvider}
        resources={[
          { 
            name: "countries", 
            list: "/admin/countries", 
            create: "/admin/countries/create", 
            edit: "/admin/countries/edit/:id" 
          },
          { 
            name: "rankings", 
            list: "/admin/country-rankings", 
            create: "/admin/country-rankings/create", 
            edit: "/admin/country-rankings/edit/:id" 
          },
          { 
            name: "media_environment", 
            list: "/admin/country-media", 
            create: "/admin/country-media/create", 
            edit: "/admin/country-media/edit/:id" 
          },
        ]}
        options={{ 
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
      >
        <Authenticated
          key="authenticated-inner"
          fallback={<AuthPage type="login" />}
        >
          <App>
            <ThemedLayoutV2 
              Sider={() => <AppSider />} 
              Header={() => <AppHeader />}
            >
              <AntdLayout.Content style={{ padding: 24 }}>
                {children}
              </AntdLayout.Content>
            </ThemedLayoutV2>
          </App>
        </Authenticated>
      </Refine>
    </ConfigProvider>
  );
}