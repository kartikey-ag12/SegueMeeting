import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { fetchWithAuth } from "@/lib/api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let organisations = [];
  let currentOrgId = "";

  try {
    const res = await fetchWithAuth("/auth/me");
    if (res.ok) {
      const user = await res.json();
      organisations = user.memberships?.map((m: any) => m.organisation) || [];
      if (organisations.length > 0) {
        currentOrgId = organisations[0].id;
      }
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error("Failed to fetch user for sidebar", err);
  }

  return (
    <div className="flex h-screen">
      <Sidebar organisations={organisations} currentOrgId={currentOrgId} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}