import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sparkles, Search } from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";
import { ProfileDropdown } from "./profile-dropdown";

export async function Topbar() {
  let user = null;
  try {
    const res = await fetchWithAuth("/auth/me");
    if (res.ok) {
      user = await res.json();
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error("Failed to fetch user for topbar", err);
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-8">
      <div className="flex-1 flex items-center">
        {/* Can put breadcrumbs or global search here if needed */}
      </div>

      <div className="flex items-center space-x-6 text-sm font-medium text-slate-600">
        <button className="hover:text-slate-900 transition-colors flex items-center gap-2">
          <Search className="w-4 h-4" />
        </button>
        <Link href="#" className="hover:text-slate-900 transition-colors">
          Feedback
        </Link>
        <Link href="#" className="hover:text-slate-900 transition-colors">
          Support
        </Link>
        
        <ProfileDropdown user={user} />

        <Button className="bg-slate-800 hover:bg-slate-700 text-white rounded-md px-4 h-9 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Ask AI
        </Button>
      </div>
    </header>
  );
}