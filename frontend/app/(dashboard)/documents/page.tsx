import { fetchWithAuth } from "@/lib/api";
import { DocumentsClient } from "./DocumentsClient";

export default async function DocumentsPage() {
  let documents = [];
  let orgId = "";
  
  try {
    const meRes = await fetchWithAuth("/auth/me");
    if (meRes.ok) {
      const user = await meRes.json();
      const organisations = user.memberships?.map((m: any) => m.organisation) || [];
      orgId = organisations[0]?.id;
      
      if (orgId) {
        const res = await fetchWithAuth(`/documents?organisationId=${orgId}`);
        if (res.ok) {
          documents = await res.json();
        }
      }
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error("Failed to fetch documents", err);
  }

  return <DocumentsClient orgId={orgId} initialDocuments={documents} />;
}
