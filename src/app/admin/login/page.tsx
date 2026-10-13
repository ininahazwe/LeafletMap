"use client";

import { Authenticated } from "@refinedev/core";
import { AuthPage } from "@refinedev/antd";
import { NavigateToResource } from "@refinedev/nextjs-router";

export default function AdminLoginPage() {
  return (
    <Authenticated key="admin-login" fallback={<LoginForm />}>
      <NavigateToResource resource="countries" />
    </Authenticated>
  );
}

function LoginForm() {
  return (
    <AuthPage
      type="login"
      title={<h3 style={{ margin: 0 }}>Mediascape Admin</h3>}
      registerLink={false}
      forgotPasswordLink={false}
      rememberMe={false}
    />
  );
}
