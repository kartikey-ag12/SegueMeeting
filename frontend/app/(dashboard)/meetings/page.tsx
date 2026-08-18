import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, MoreHorizontal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MeetingActionMenu } from "./MeetingActionMenu";

function agendaBadge(status: string | undefined, meetingId: string) {
  const badge = status === "PUBLISHED" ? (
    <Badge>Published</Badge>
  ) : (
    <Badge variant="secondary">Draft</Badge>
  );
  return (
    <Link href={`/meetings/${meetingId}/agenda`} className="hover:opacity-80 transition-opacity">
      {badge}
    </Link>
  );
}

function minutesBadge(status: string | undefined, meetingId: string) {
  const s = status || "NOT_STARTED";
  const labels: Record<string, string> = {
    NOT_STARTED: "Not started",
    DRAFT: "Draft",
    IN_REVIEW: "In review",
    CONFIRMED: "Confirmed",
  };
  return (
    <Link href={`/meetings/${meetingId}/minutes`} className="hover:opacity-80 transition-opacity">
      <Badge variant="outline">{labels[s] || "Not started"}</Badge>
    </Link>
  );
}

function boardPackBadge(meetingId: string) {
  return (
    <Link href={`/meetings/${meetingId}/pack`} className="hover:opacity-80 transition-opacity">
      <Badge variant="outline">Available</Badge>
    </Link>
  );
}

export default async function MeetingsPage() {
  const today = new Date().toISOString().slice(0, 10);
  
  let orgId = '';
  try {
    const meRes = await fetchWithAuth('/auth/me');
    if (meRes.ok) {
      const me = await meRes.json();
      orgId = me.memberships?.[0]?.organisation?.id || '';
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) throw err;
    console.error("Failed to fetch user profile:", err);
  }

  let fetchedMeetings: any[] = [];
  if (orgId) {
    try {
      const res = await fetchWithAuth(`/meetings?organisationId=${orgId}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        fetchedMeetings = await res.json();
      }
    } catch (err: any) {
      if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) throw err;
      console.error("Failed to fetch meetings:", err);
    }
  }

  const upcoming = fetchedMeetings.filter((m) => m.date >= today);
  const past = fetchedMeetings.filter((m) => m.date < today);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Meetings</h1>
        <Link
          href="/meetings/new"
          className="rounded-md bg-[#2e2b5b] hover:bg-[#1e1b4b] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
        >
          Add Meeting
        </Link>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex items-center gap-6 border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 rounded-none border-none space-x-6">
              <TabsTrigger 
                value="upcoming" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold text-slate-400 data-[state=active]:text-slate-800 text-[15px]"
              >
                Upcoming Meetings
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-medium text-slate-400 data-[state=active]:text-slate-800 text-[15px]"
              >
                Past Meetings
              </TabsTrigger>
            </TabsList>
            
            <div className="ml-auto pb-3">
               <button className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-3 py-1.5 shadow-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Next 90 days
               </button>
            </div>
          </div>
          
          <div className="mt-6">
            <TabsContent value="upcoming" className="mt-0">
              <MeetingTable meetings={upcoming} />
            </TabsContent>
            <TabsContent value="past" className="mt-0">
              <MeetingTable meetings={past} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function MeetingTable({ meetings }: { meetings: any[] }) {
  if (meetings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
        No meetings here yet.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-transparent">
          <TableRow className="hover:bg-transparent border-b border-slate-100">
            <TableHead className="text-slate-400 font-medium text-xs pl-6">Date</TableHead>
            <TableHead className="text-slate-400 font-medium text-xs">Details</TableHead>
            <TableHead className="text-slate-400 font-medium text-xs text-center">Agenda</TableHead>
            <TableHead className="text-slate-400 font-medium text-xs text-center">Board Pack</TableHead>
            <TableHead className="text-slate-400 font-medium text-xs text-center">Minutes</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((m) => {
            // Parse ISO date (YYYY-MM-DD) for calendar box
            const dateObj = new Date(m.date);
            const day = dateObj.getDate().toString();
            const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const year = dateObj.getFullYear().toString();
            
            return (
              <TableRow key={m.id} className="hover:bg-slate-50/50">
                <TableCell className="pl-6 align-top pt-5">
                  <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg w-14 h-16 border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{month}</span>
                    <span className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{day}</span>
                    <span className="text-[9px] font-semibold text-slate-400 leading-none mb-1">{year}</span>
                  </div>
                </TableCell>
                <TableCell className="align-top pt-5">
                  <div className="flex flex-col gap-1.5">
                    <Link href={`/meetings/${m.id}`} className="font-semibold text-slate-800 text-base hover:text-blue-600 transition-colors">
                      {m.title}
                    </Link>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {m.startTime}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {m.location}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="align-middle text-center">{agendaBadge(m.agendaStatus, m.id)}</TableCell>
                <TableCell className="align-middle text-center">{boardPackBadge(m.id)}</TableCell>
                <TableCell className="align-middle text-center">{minutesBadge(m.minutesStatus, m.id)}</TableCell>
                <TableCell className="align-middle pr-4">
                  <MeetingActionMenu meetingId={m.id} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}