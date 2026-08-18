"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchWithAuth } from "@/lib/api";
import useSWR from "swr";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function NewFlyingMinutePage() {
  const router = useRouter();
  const { user } = useAuth();
  const orgId = user?.currentOrganisationId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [closeDate, setCloseDate] = useState<Date | undefined>();
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch members to populate the recipient picker
  const { data: members } = useSWR(
    orgId ? `/organisations/${orgId}/members` : null,
    fetchWithAuth
  );

  const toggleVoter = (memberId: string) => {
    setSelectedVoters(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreate = async () => {
    if (!title || !content || selectedVoters.length === 0) {
      toast.error("Please fill in title, content, and select at least one voter.");
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchWithAuth(`/organisations/${orgId}/decisions/flying`, {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          closeDate: closeDate ? closeDate.toISOString() : undefined,
          voterIds: selectedVoters
        })
      });
      toast.success("Flying Minute created successfully");
      router.push("/between-meetings");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create Flying Minute");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/between-meetings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-slate-800">New Flying Minute</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resolution Title *</label>
            <Input 
              placeholder="E.g. Approval of Q3 Budget" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resolution Details *</label>
            <Textarea 
              placeholder="Enter the full text of the resolution..." 
              className="min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Voting Closes On</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {closeDate ? format(closeDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={closeDate}
                  onSelect={setCloseDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-slate-700">Select Voters *</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedVoters(members?.map((m: any) => m.user.id) || [])}
            >
              Select All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
            {members?.map((member: any) => {
              const isSelected = selectedVoters.includes(member.user.id);
              return (
                <div 
                  key={member.id}
                  onClick={() => toggleVoter(member.user.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected ? 'border-[#1e1b4b] bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                    isSelected ? 'bg-[#1e1b4b] border-[#1e1b4b]' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{member.user.name}</p>
                    <p className="text-xs text-slate-500">{member.role.replace('_', ' ')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <Link href="/between-meetings">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button 
            className="bg-[#1e1b4b] hover:bg-[#2e2b5b] text-white"
            onClick={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Flying Minute"}
          </Button>
        </div>
      </div>
    </div>
  );
}
