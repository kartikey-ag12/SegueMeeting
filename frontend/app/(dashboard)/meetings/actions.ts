"use server";

import { fetchWithAuth } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createMeeting(data: any) {
  // Fetch user profile to get org ID dynamically
  const meRes = await fetchWithAuth('/auth/me');
  if (meRes.ok) {
    const user = await meRes.json();
    if (user.memberships && user.memberships.length > 0) {
      data.organisationId = user.memberships[0].organisation.id;
    }
  }

  const res = await fetchWithAuth('/meetings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  revalidatePath('/meetings');
  return res.json();
}

export async function updateMeeting(id: string, data: any) {
  const res = await fetchWithAuth(`/meetings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  revalidatePath(`/meetings/${id}`);
  return res.json();
}

export async function deleteMeeting(id: string) {
  const res = await fetchWithAuth(`/meetings/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  revalidatePath('/meetings');
}

export async function getLocations(orgId: string) {
  let finalOrgId = orgId;
  if (!finalOrgId || finalOrgId === "undefined") {
    const meRes = await fetchWithAuth('/auth/me');
    if (meRes.ok) {
      const user = await meRes.json();
      if (user.memberships && user.memberships.length > 0) {
        finalOrgId = user.memberships[0].organisation.id;
      }
    }
  }

  if (!finalOrgId || finalOrgId === "undefined") return [];

  const res = await fetchWithAuth(`/organisations/${finalOrgId}/locations`);
  if (!res.ok) return [];
  return res.json();
}

export async function createLocation(orgId: string, data: any) {
  let finalOrgId = orgId;
  if (!finalOrgId || finalOrgId === "undefined") {
    const meRes = await fetchWithAuth('/auth/me');
    if (meRes.ok) {
      const user = await meRes.json();
      if (user.memberships && user.memberships.length > 0) {
        finalOrgId = user.memberships[0].organisation.id;
      }
    }
  }

  const res = await fetchWithAuth(`/organisations/${finalOrgId}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
}

// ─────────────────────────────────────────────
// AGENDA
// ─────────────────────────────────────────────

export async function createAgendaSection(meetingId: string, data: any) {
  const res = await fetchWithAuth(`/meetings/${meetingId}/agenda/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  revalidatePath(`/meetings/${meetingId}/agenda`);
  return res.json();
}

export async function updateAgendaSection(sectionId: string, data: any) {
  const res = await fetchWithAuth(`/agenda/sections/${sectionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  // Can't trivially get meetingId here for revalidatePath unless we pass it, but Client handles state
  return res.json();
}

export async function deleteAgendaSection(sectionId: string) {
  const res = await fetchWithAuth(`/agenda/sections/${sectionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function createAgendaItem(sectionId: string, data: any) {
  // Strip frontend-only fields that the backend doesn't support yet
  const { description, documents, actionFilterSettings, ...backendData } = data;
  
  const res = await fetchWithAuth(`/agenda/sections/${sectionId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateAgendaItem(itemId: string, data: any) {
  // Strip frontend-only fields that the backend doesn't support yet
  const { description, documents, actionFilterSettings, ...backendData } = data;
  
  const res = await fetchWithAuth(`/agenda/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAgendaItem(itemId: string) {
  const res = await fetchWithAuth(`/agenda/items/${itemId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
}

// ─────────────────────────────────────────────
// MINUTES
// ─────────────────────────────────────────────

export async function createMinutes(meetingId: string, data: any) {
  const res = await fetchWithAuth(`/meetings/${meetingId}/minutes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  revalidatePath(`/meetings/${meetingId}/minutes`);
  return res.json();
}

export async function updateMinutes(minutesId: string, data: any) {
  const res = await fetchWithAuth(`/minutes/${minutesId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─────────────────────────────────────────────
// NOTICES
// ─────────────────────────────────────────────

export async function sendMeetingNotice(meetingId: string, data: any) {
  // Mock sending notice
  return { success: true };
}
