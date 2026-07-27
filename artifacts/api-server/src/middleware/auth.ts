import type { Request, Response, NextFunction } from "express";
import db from "../db/database.js";

interface TokenClaims {
  preferred_username?: string;
  email?: string;
  name?: string;
  oid?: string;
  tid?: string;
  scp?: string;
  roles?: string[];
  exp?: number;
  aud?: string;
  iss?: string;
}

function decodeTokenPayload(token: string): TokenClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const padded =
      parts[1].replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (parts[1].length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as TokenClaims;
  } catch {
    return null;
  }
}

type DbUser = { id: number; email: string; display_name: string; role: string };

function resolveUser(email: string): DbUser | null {
  const row = db
    .prepare("SELECT id, email, display_name, role FROM users WHERE email = ?")
    .get(email) as DbUser | undefined;

  if (row) return row;

  return {
    id: null,
    email,
    display_name: email.split("@")[0].replace(/[._-]/g, " "),
    role: "staff",
  };
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader  = req.headers["authorization"] as string | undefined;
  const emailHeader = req.headers["x-user-email"]  as string | undefined;

  let resolvedEmail: string | undefined;
  let resolvedTid: string | undefined;
  let resolvedScp: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    const claims = decodeTokenPayload(authHeader.slice(7));
    if (claims) {
      resolvedEmail = claims.preferred_username ?? claims.email;
      resolvedTid   = claims.tid;
      resolvedScp   = claims.scp;
    }
  }

  if (!resolvedEmail && emailHeader) {
    resolvedEmail = emailHeader;
  }

  if (resolvedEmail) {
    const base = resolveUser(resolvedEmail);
    if (base) {
      req.user = { ...base, tid: resolvedTid, scp: resolvedScp };
    }
  }

  next();
}
