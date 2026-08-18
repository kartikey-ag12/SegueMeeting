import { getSession } from "./session";
import { redirect } from "next/navigation";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getSession();
  
  if (!token) {
    redirect("/login?clear=1");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`http://127.0.0.1:3000${url}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (res.status === 401) {
    redirect("/login?clear=1");
  }

  return res;
}

export const fetcher = async (url: string) => {
  const res = await fetchWithAuth(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = await res.text();
    throw error;
  }
  return res.json();
};
