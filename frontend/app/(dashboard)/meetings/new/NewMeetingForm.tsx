"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMeeting } from "../actions";

export default function NewMeetingForm({ members }: { members: any[] }) {
  const router = useRouter();
  const [isRemote, setIsRemote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Set default administrator to current user (the one creating the meeting, or first admin)
  const defaultAdmin = members.length > 0 ? members[0].user.name : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await createMeeting({
        title: formData.get('title'),
        date: formData.get('date'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        location: formData.get('location'),
        isRemote,
        administrator: formData.get('administrator'),
        notes: formData.get('notes'),
        status: 'DRAFT',
      });

      router.push("/meetings");
    } catch (err) {
      console.error("Failed to create meeting", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Meeting title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. September Board Meeting"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start time</Label>
          <Input id="startTime" name="startTime" type="time" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End time</Label>
          <Input id="endTime" name="endTime" type="time" required />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="location">
            {isRemote ? "Video link" : "Location"}
          </Label>
          <button
            type="button"
            onClick={() => setIsRemote((v) => !v)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {isRemote ? "Switch to in-person" : "Switch to remote"}
          </button>
        </div>
        <Input
          id="location"
          name="location"
          placeholder={
            isRemote
              ? "e.g. https://meet.google.com/..."
              : "e.g. Conference Room A"
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="administrator">Meeting administrator</Label>
        <select
          id="administrator"
          name="administrator"
          required
          defaultValue={defaultAdmin}
          className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-500"
        >
          {members.map(m => (
            <option key={m.id} value={m.user.name}>{m.user.name}</option>
          ))}
          {members.length === 0 && <option value="">No members found</option>}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Anything attendees should know before the meeting"
          rows={4}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create meeting"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/meetings")}
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
