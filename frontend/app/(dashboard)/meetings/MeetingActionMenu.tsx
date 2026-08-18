"use client";

import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteMeeting } from "./actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function MeetingActionMenu({ meetingId }: { meetingId: string }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    setDeleting(true);
    try {
      await deleteMeeting(meetingId);
    } catch (e) {
      console.error("Failed to delete meeting", e);
      alert("Failed to delete meeting.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 hover:bg-slate-100 rounded-md text-slate-400 transition-colors" disabled={deleting}>
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.location.href = `/meetings/${meetingId}`}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Meeting
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Meeting
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
