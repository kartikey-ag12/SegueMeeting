import { MeetingOverviewClient } from "./MeetingOverviewClient";
import { fetchWithAuth } from "@/lib/api";

export default async function MeetingOverviewPage(props: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await props.params;

  let backendMeeting = null;
  try {
    const res = await fetchWithAuth(`/meetings/${meetingId}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      backendMeeting = await res.json();
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) throw err;
    console.error("Failed to fetch meeting detail:", err);
  }

  let members = [];
  try {
    if (backendMeeting?.organisationId) {
      const membersRes = await fetchWithAuth(`/organisations/${backendMeeting.organisationId}/members`, {
        cache: 'no-store'
      });
      if (membersRes.ok) {
        members = await membersRes.json();
      }
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) throw err;
    console.error("Failed to fetch organisation members:", err);
  }

  // Fallback if not found
  const meeting = backendMeeting || {
    title: "Meeting Not Found",
    location: "",
    administrator: "",
    notes: "",
    attendees: [],
    apologies: [],
  };

  return (
    <MeetingOverviewClient meeting={meeting} members={members} />
  );
}
