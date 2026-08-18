import { fetchWithAuth } from "@/lib/api";
import NewMeetingForm from "./NewMeetingForm";

export default async function NewMeetingPage() {
  let members = [];
  try {
    const meRes = await fetchWithAuth('/auth/me');
    if (meRes.ok) {
      const me = await meRes.json();
      if (me.memberships && me.memberships.length > 0) {
        const orgId = me.memberships[0].organisation.id;
        const membersRes = await fetchWithAuth(`/organisations/${orgId}/members`);
        if (membersRes.ok) {
          members = await membersRes.json();
        }
      }
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) throw err;
    console.error("Failed to fetch members:", err);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Create meeting
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This is the meeting&apos;s Notice — date, time, location and admin.
        You&apos;ll build the agenda in the next step.
      </p>

      <NewMeetingForm members={members} />
    </div>
  );
}