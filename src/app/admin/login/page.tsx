"use client";

import { AuthPage } from "@refinedev/antd";
import Link from "next/link";
import { Typography } from "antd";

const { Text } = Typography;

export default function Login() {
  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: { email: "", password: "" },
      }}
      renderContent={(content, title) => {
        return (
          <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          }}>
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              width: "400px"
            }}>
              {title}
              {content}
              <div style={{ 
                textAlign: "center", 
                marginTop: "1rem",
                borderTop: "1px solid #f0f0f0",
                paddingTop: "1rem"
              }}>
                <Link href="/admin/auth/forgot-password">
                  <Text type="secondary" style={{ cursor: "pointer" }}>
                    Mot de passe oublié ?
                  </Text>
                </Link>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}