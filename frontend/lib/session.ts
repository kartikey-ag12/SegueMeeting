"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { SESSION_COOKIE_NAME } from "./constants";

export async function setSession(token: string) {
  const cookieStore = await cookies();
  
  // Try to decode to get expiration, otherwise default to 1 day
  let expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp) {
      expires = new Date(decoded.exp * 1000);
    }
  } catch (e) {
    // Ignore decode error
  }

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
