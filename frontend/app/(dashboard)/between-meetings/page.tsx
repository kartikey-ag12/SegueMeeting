"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, FileType2, CheckSquare2, ListFilter, Plus } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function BetweenMeetingsPage() {
  const { user } = useAuth();
  const orgId = user?.currentOrganisationId;
  const router = useRouter();

  const { data: decisions, error, isLoading } = useSWR(
    orgId ? `/organisations/${orgId}/decisions` : null,
    fetchWithAuth
  );

  const flyingMinutes = decisions?.filter((d: any) => d.type === 'FLYING_MINUTE') || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-baseline gap-2 text-slate-800">
            Between Meetings
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Approvals and Reports for when there isn't a meeting
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 h-9 bg-white border-slate-200 text-sm focus-visible:ring-blue-500"
            />
          </div>
          <Link href="/between-meetings/new">
            <Button className="bg-[#1e1b4b] hover:bg-[#2e2b5b] text-white rounded-md px-6 h-9 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors">
          <FileType2 className="w-4 h-4 text-slate-500" />
          Type
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors">
          <CheckSquare2 className="w-4 h-4 text-slate-500" />
          Outcome
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors">
          <ListFilter className="w-4 h-4 text-slate-500" />
          Status
        </button>
      </div>

      {isLoading ? (
        <div className="h-[40vh] flex items-center justify-center">Loading...</div>
      ) : flyingMinutes.length === 0 ? (
        <div className="border border-slate-200 rounded-xl bg-white h-[60vh] flex flex-col items-center justify-center text-center shadow-sm">
          <div className="bg-slate-100 p-6 rounded-2xl mb-4">
            <Send className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-slate-600 text-[15px] font-medium">No flying minutes found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {flyingMinutes.map((fm: any) => (
            <div 
              key={fm.id} 
              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              onClick={() => router.push(`/between-meetings/${fm.id}`)}
            >
              <div>
                <h3 className="font-medium text-slate-900">{fm.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-1">{fm.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>Created: {new Date(fm.createdAt).toLocaleDateString()}</span>
                  {fm.closeDate && <span>Closes: {new Date(fm.closeDate).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  fm.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                  fm.status === 'PASSED' ? 'bg-emerald-100 text-emerald-700' :
                  fm.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {fm.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
