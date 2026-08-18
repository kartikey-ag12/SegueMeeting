import { fetchWithAuth } from "@/lib/api";
import { UserPlus, Settings2, Trash2 } from "lucide-react";
import PeopleClient from "./PeopleClient";

export default async function PeoplePage() {
  let members = [];
  
  try {
    // We need the org ID to fetch members. Let's get the current user's org.
    // The safest way is to fetch /auth/me first.
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
    console.error("Failed to fetch people:", err);
  }

  return <PeopleClient orgId={orgId} initialMembers={members} />;
}
