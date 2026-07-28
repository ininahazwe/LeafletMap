import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

const SAFE_FIELDS = "id, email, name, created_at";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sp = req.nextUrl.searchParams;
    const start = Number(sp.get("_start") ?? 0);
    const end = Number(sp.get("_end") ?? 10);
    const limit = Math.max(end - start, 1);
    const order =
      (sp.get("_order") ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";
    const sortParam = sp.get("_sort") ?? "id";
    const sortCol = ["id", "email", "name", "created_at"].includes(sortParam)
      ? sortParam
      : "id";

    const [countRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM admin_users"
    );
    const total = Number(countRows[0]?.total ?? 0);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${SAFE_FIELDS} FROM admin_users ORDER BY \`${sortCol}\` ${order} LIMIT ? OFFSET ?`,
      [limit, start]
    );

    return NextResponse.json(rows, {
      headers: { "x-total-count": String(total) },
    });
  } catch (err) {
    console.error("GET admin_users error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)",
      [email, passwordHash, name ?? null]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${SAFE_FIELDS} FROM admin_users WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("POST admin_users error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
