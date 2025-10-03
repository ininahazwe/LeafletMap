"use client";

import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Checkbox } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useLogin } from "@refinedev/core";
import Link from "next/link";

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const { mutate: login } = useLogin();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (values: { email: string; password: string }) => {
    setIsLoading(true);
    login({
      email: values.email,
      password: values.password,
      redirectTo: "/admin"
    }, {
      onError: (error) => {
        setIsLoading(false);
        message.error(error.message || "Erreur de connexion");
      },
      onSuccess: () => {
        setIsLoading(false);
      }
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#1890ff",
            marginBottom: "1rem"
          }}>
            <span style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}>
              R
            </span>
          </div>
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            Refine Project
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Connectez-vous à votre compte
          </Text>
        </div>

        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          requiredMark={false}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Veuillez entrer votre email" },
              { type: "email", message: "Format d'email invalide" }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Mot de passe"
            name="password"
            rules={[
              { required: true, message: "Veuillez entrer votre mot de passe" }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              Se souvenir de moi
            </Checkbox>
            <Link href="/admin/auth/forgot-password">
              <Text type="secondary" style={{ cursor: "pointer", fontSize: "14px" }}>
                Mot de passe oublié ?
              </Text>
            </Link>
          </div>

          <Form.Item style={{ marginBottom: "1rem" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              style={{ width: "100%", height: "48px" }}
            >
              Se connecter
            </Button>
          </Form.Item>
        </Form>

        <div style={{ 
          textAlign: "center", 
          borderTop: "1px solid #f0f0f0",
          paddingTop: "1rem"
        }}>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Vous n&apos;avez pas de compte ?{" "}
            <Link href="/admin/auth/register">
              <Text style={{ color: "#1890ff", cursor: "pointer" }}>
                Créer un compte
              </Text>
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}