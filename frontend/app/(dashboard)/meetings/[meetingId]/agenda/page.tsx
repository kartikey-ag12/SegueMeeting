import { fetchWithAuth } from "@/lib/api";
import AgendaBuilderClient from "./AgendaBuilderClient";

export default async function AgendaPage(props: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await props.params;

  let meeting = null;
  try {
    const res = await fetchWithAuth(`/meetings/${meetingId}/agenda`, { cache: 'no-store' });
    if (res.ok) {
      meeting = await res.json();
    } else if (res.status === 404) {
      // Fallback: if agenda endpoint returns 404 (maybe no agenda yet), try the basic meeting details
      const fallbackRes = await fetchWithAuth(`/meetings/${meetingId}`, { cache: 'no-store' });
      if (fallbackRes.ok) meeting = await fallbackRes.json();
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) throw err;
    console.error("Failed to fetch meeting", err);
  }

  let members = [];
  try {
    if (meeting?.organisationId) {
      const membersRes = await fetchWithAuth(`/organisations/${meeting.organisationId}/members`, { cache: 'no-store' });
      if (membersRes.ok) members = await membersRes.json();
    }
  } catch (err) {
    console.error("Failed to fetch members", err);
  }

  return <AgendaBuilderClient meeting={meeting} members={members} />;
}