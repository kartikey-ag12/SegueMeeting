import { fetchWithAuth } from "@/lib/api";
import MinutesClient from "./MinutesClient";

export default async function MinutesPage(props: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await props.params;

  let meeting = null;
  let minutes = null;
  let members = [];
  
  try {
    const res = await fetchWithAuth(`/meetings/${meetingId}/agenda`, { cache: 'no-store' });
    if (res.ok) {
      meeting = await res.json();
    } else if (res.status === 404) {
      const fallbackRes = await fetchWithAuth(`/meetings/${meetingId}`, { cache: 'no-store' });
      if (fallbackRes.ok) meeting = await fallbackRes.json();
    }
    
    if (meeting) {
      const minRes = await fetchWithAuth(`/meetings/${meetingId}/minutes`, { cache: 'no-store' });
      if (minRes.ok) {
        minutes = await minRes.json();
      }
      
      const membersRes = await fetchWithAuth(`/organisations/${meeting.organisationId}/members`, { cache: 'no-store' });
      if (membersRes.ok) {
        members = await membersRes.json();
      }
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) throw err;
    console.error("Failed to fetch meeting", err);
  }

  if (!meeting) {
    return <p className="text-muted-foreground p-8">Meeting not found.</p>;
  }

  return <MinutesClient meeting={meeting} initialMinutes={minutes} members={members} />;
}