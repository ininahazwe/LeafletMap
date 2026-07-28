// lib/adminCrud.ts
// Helpers génériques pour les routes CRUD admin (protégées JWT),
// respectant la convention query string de @refinedev/simple-rest
// (_start, _end, _sort, _order, x-total-count en réponse).
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export interface CrudConfig {
  table: string;
  primaryKey?: string;
  /** Colonnes autorisées en lecture/écriture (whitelist anti-injection) */
  allowedFields: string[];
  defaultSort?: string;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function pk(config: CrudConfig) {
  return config.primaryKey ?? "id";
}

export async function listResource(req: NextRequest, config: CrudConfig) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const sp = req.nextUrl.searchParams;
    const start = Number(sp.get("_start") ?? 0);
    const end = Number(sp.get("_end") ?? 10);
    const limit = Math.max(end - start, 1);
    const sortParam = sp.get("_sort") ?? config.defaultSort ?? pk(config);
    const sortCol =
      config.allowedFields.includes(sortParam) || sortParam === pk(config)
        ? sortParam
        : pk(config);
    const order =
      (sp.get("_order") ?? "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

    const filters: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of sp.entries()) {
      if (key.startsWith("_")) continue;
      if (!config.allowedFields.includes(key)) continue;
      filters.push(`\`${key}\` = ?`);
      values.push(value);
    }
    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM \`${config.table}\` ${whereClause}`,
      values
    );
    const total = Number(countRows[0]?.total ?? 0);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM \`${config.table}\` ${whereClause} ORDER BY \`${sortCol}\` ${order} LIMIT ? OFFSET ?`,
      [...values, limit, start]
    );

    return NextResponse.json(rows, {
      headers: { "x-total-count": String(total) },
    });
  } catch (err) {
    console.error(`GET list ${config.table} error:`, err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function getResource(
  req: NextRequest,
  config: CrudConfig,
  id: string
) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM \`${config.table}\` WHERE \`${pk(config)}\` = ? LIMIT 1`,
      [id]
    );
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error(`GET one ${config.table} error:`, err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function createResource(req: NextRequest, config: CrudConfig) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const fields = Object.keys(body).filter((k) =>
      config.allowedFields.includes(k)
    );

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    const columns = fields.map((f) => `\`${f}\``).join(", ");
    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((f) => body[f]);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO \`${config.table}\` (${columns}) VALUES (${placeholders})`,
      values
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM \`${config.table}\` WHERE \`${pk(config)}\` = ? LIMIT 1`,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error(`POST ${config.table} error:`, err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function updateResource(
  req: NextRequest,
  config: CrudConfig,
  id: string
) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const fields = Object.keys(body).filter((k) =>
      config.allowedFields.includes(k)
    );

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    const setClause = fields.map((f) => `\`${f}\` = ?`).join(", ");
    const values = fields.map((f) => body[f]);

    await pool.query(
      `UPDATE \`${config.table}\` SET ${setClause} WHERE \`${pk(config)}\` = ?`,
      [...values, id]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM \`${config.table}\` WHERE \`${pk(config)}\` = ? LIMIT 1`,
      [id]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(`PATCH ${config.table} error:`, err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function deleteResource(
  req: NextRequest,
  config: CrudConfig,
  id: string
) {
  const user = getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM \`${config.table}\` WHERE \`${pk(config)}\` = ? LIMIT 1`,
      [id]
    );
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await pool.query(`DELETE FROM \`${config.table}\` WHERE \`${pk(config)}\` = ?`, [
      id,
    ]);

    return NextResponse.json(row);
  } catch (err) {
    console.error(`DELETE ${config.table} error:`, err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
