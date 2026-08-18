import { fetchWithAuth } from "@/lib/api";
import { DecisionsClient } from "./DecisionsClient";

export default async function DecisionsPage() {
  let decisions = [];
  
  try {
    // 1. Get the current user to find their organisation
    const meRes = await fetchWithAuth("/auth/me");
    if (meRes.ok) {
      const user = await meRes.json();
      const organisations = user.memberships?.map((m: any) => m.organisation) || [];
      const orgId = organisations[0]?.id;
      
      if (orgId) {
        // 2. Fetch decisions for this organisation
        const res = await fetchWithAuth(`/organisations/${orgId}/decisions`);
        if (res.ok) {
          const rawDecisions = await res.json();
          // Map to match the expected format
          decisions = rawDecisions.map((d: any) => ({
            id: d.id,
            content: d.content,
            type: d.type,
            outcome: d.outcome,
            mover: d.mover,
            seconder: d.seconder,
            date: d.date,
            meetingTitle: d.meeting?.title
          }));
        }
      }
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error("Failed to fetch decisions", err);
  }

  return <DecisionsClient initialDecisions={decisions} />;
}
