import { NextResponse } from "next/server";
import { authCookieOptions } from "@/lib/auth/cookies";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_NAME,
} from "@/lib/auth/constants";
import { serverApiUrl } from "@/env";

type LoginResponse = {
  token?: string;
  refreshToken?: string;
  user?: { isApproved?: boolean };
};

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const upstream = await fetch(serverApiUrl("/api/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get("Content-Type") ?? "application/json";

    if (!upstream.ok) {
      return new NextResponse(text, { status: upstream.status, headers: { "Content-Type": contentType } });
    }

    const data = JSON.parse(text) as LoginResponse;
    const response = NextResponse.json(data, { status: upstream.status });

    const token = data.token?.trim();
    const refreshToken = data.refreshToken?.trim();
    if (token && refreshToken && data.user?.isApproved !== false) {
      response.cookies.set(
        AUTH_COOKIE_NAME,
        token,
        authCookieOptions(request, AUTH_COOKIE_MAX_AGE_SECONDS)
      );
      response.cookies.set(
        REFRESH_COOKIE_NAME,
        refreshToken,
        authCookieOptions(request, REFRESH_COOKIE_MAX_AGE_SECONDS)
      );
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Authentication service is unavailable" },
      { status: 502 }
    );
  }
}
