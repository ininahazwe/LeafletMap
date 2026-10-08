import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

const SAFE_FIELDS = "id, email, name, created_at";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${SAFE_FIELDS} FROM admin_users WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET admin_user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function update(req: NextRequest, { params }: Params) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { email, password, name } = await req.json();

    const fields: string[] = [];
    const values: unknown[] = [];

    if (email !== undefined) {
      fields.push("email = ?");
      values.push(email);
    }
    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }
    if (password) {
      fields.push("password_hash = ?");
      values.push(await bcrypt.hash(password, 10));
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "Aucun champ valide fourni" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE admin_users SET ${fields.join(", ")} WHERE id = ?`,
      [...values, id]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${SAFE_FIELDS} FROM admin_users WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("PATCH admin_user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const PATCH = update;
export const PUT = update;

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${SAFE_FIELDS} FROM admin_users WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await pool.query("DELETE FROM admin_users WHERE id = ?", [id]);

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("DELETE admin_user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
