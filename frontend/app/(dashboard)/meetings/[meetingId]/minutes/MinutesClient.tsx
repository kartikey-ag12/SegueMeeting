"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMinutes, updateMinutes } from "../../actions";

const statusLabels: Record<MinutesStatus, string> = {
  NOT_STARTED: "Not started",
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  CONFIRMED: "Confirmed",
};

export default function MinutesClient({ meeting, initialMinutes, members = [] }: { meeting: any, initialMinutes: any, members?: any[] }) {
  const router = useRouter();
  const meetingId = meeting.id;

  const sections = meeting.agendaSections || [];
  
  // Parse initial minutes content as blocks if available
  const initialBlocks = initialMinutes?.content 
    ? (JSON.parse(initialMinutes.content) as MinuteBlock[]) 
    : [];

  const [minutesId, setMinutesId] = useState<string | null>(initialMinutes?.id || null);
  const [blocks, setBlocks] = useState<MinuteBlock[]>(initialBlocks);
  const [status, setStatus] = useState<MinutesStatus>(initialMinutes?.status || "NOT_STARTED");
  const [showChecklist, setShowChecklist] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync to backend
  async function syncToBackend(newStatus: MinutesStatus, newBlocks: MinuteBlock[]) {
    setSaving(true);
    try {
      const payload = {
        status: newStatus,
        content: JSON.stringify(newBlocks),
      };

      if (!minutesId) {
        const res = await createMinutes(meetingId, payload);
        setMinutesId(res.id);
      } else {
        await updateMinutes(minutesId, payload);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function addBlock(agendaItemId: string, blockType: MinuteBlockType) {
    const newBlock: MinuteBlock = {
      id: crypto.randomUUID(),
      agendaItemId,
      blockType,
      content: "",
      ...(blockType === "decision"
        ? { decisionOutcome: "approved", mover: "", seconder: "" }
        : {}),
      ...(blockType === "action"
        ? { actionOwner: "", actionDueDate: "" }
        : {}),
    };
    
    const newBlocks = [...blocks, newBlock];
    const newStatus = status === "NOT_STARTED" ? "DRAFT" : status;
    
    setBlocks(newBlocks);
    setStatus(newStatus);
    syncToBackend(newStatus, newBlocks);
  }

  function updateBlock(id: string, patch: Partial<MinuteBlock>) {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
    setBlocks(newBlocks);
    syncToBackend(status, newBlocks);
  }

  function removeBlock(id: string) {
    const newBlocks = blocks.filter((b) => b.id !== id);
    setBlocks(newBlocks);
    syncToBackend(status, newBlocks);
  }

  function finishDraft() {
    setStatus("in_review");
    setShowChecklist(true);
    syncToBackend("in_review", blocks);
  }

  function confirmMinutes() {
    setStatus("confirmed");
    setShowChecklist(false);
    syncToBackend("confirmed", blocks);
  }

  function rollBack() {
    setStatus("DRAFT");
    setShowChecklist(false);
    syncToBackend("DRAFT", blocks);
  }

  if (meeting.agendaStatus !== "PUBLISHED") {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Minutes</h1>
        <p className="mt-4 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
          Minutes can only be taken once the agenda is published. Go to the
          Agenda tab and publish it first.
        </p>
        <button
          onClick={() => router.push(`/meetings/${meeting.id}/agenda`)}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Go to agenda
        </button>
      </div>
    );
  }

  const locked = status === "CONFIRMED";
  const allItems = sections.flatMap((s: any) =>
    (s.items || []).map((item: any) => ({ ...item, sectionTitle: s.title }))
  );

  function blocksFor(agendaItemId: string) {
    return blocks.filter((b) => b.agendaItemId === agendaItemId);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {meeting.title} — Minutes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {meeting.date} · {meeting.startTime}–{meeting.endTime}
          </p>
        </div>
        <Badge variant={status === "confirmed" ? "default" : "secondary"}>
          {statusLabels[status]}
        </Badge>
      </div>

      {showChecklist && (
        <div className="mt-4 space-y-2 rounded-md border border-border bg-muted/50 p-4">
          <p className="text-sm font-medium">Minutes are in review</p>
          <p className="text-sm text-muted-foreground">
            These steps are optional and can be done anytime — nothing here
            sends automatically.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Send minutes to the board</li>
            <li>• Send action notices to owners</li>
            <li>• Schedule confirmation for the next meeting</li>
          </ul>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {allItems.map((item) => (
          <div
            key={item.id}
            className="rounded-md border border-border bg-card p-4"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.sectionTitle}
            </p>
            <h3 className="mt-1 font-medium">{item.title}</h3>

            <div className="mt-3 space-y-3">
              {blocksFor(item.id).map((block) => (
                <MinuteBlockEditor
                  key={block.id}
                  block={block}
                  locked={locked}
                  members={members}
                  onChange={(patch) => updateBlock(block.id, patch)}
                  onRemove={() => removeBlock(block.id)}
                />
              ))}
            </div>

            {!locked && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => addBlock(item.id, "note")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  + Note
                </button>
                <button
                  onClick={() => addBlock(item.id, "decision")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  + Decision
                </button>
                <button
                  onClick={() => addBlock(item.id, "action")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  + Action
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3">
        {status === "draft" && (
          <button
            onClick={finishDraft}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Finish draft minutes
          </button>
        )}
        {status === "in_review" && (
          <>
            <button
              onClick={confirmMinutes}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Confirm minutes
            </button>
            <button
              onClick={rollBack}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Roll back to draft
            </button>
          </>
        )}
        <button
          onClick={() => router.push("/meetings")}
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Back to meetings
        </button>
      </div>
    </div>
  );
}

function MinuteBlockEditor({
  block,
  locked,
  members,
  onChange,
  onRemove,
}: {
  block: MinuteBlock;
  locked: boolean;
  members: any[];
  onChange: (patch: Partial<MinuteBlock>) => void;
  onRemove: () => void;
}) {
  const typeLabel =
    block.blockType === "note"
      ? "Note"
      : block.blockType === "decision"
      ? "Decision"
      : "Action";

  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-center justify-between">
        <Badge variant="outline">{typeLabel}</Badge>
        {!locked && (
          <button
            onClick={onRemove}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Remove
          </button>
        )}
      </div>

      <Textarea
        className="mt-2"
        placeholder={
          block.blockType === "note"
            ? "What was discussed..."
            : block.blockType === "decision"
            ? "What was decided..."
            : "What needs to happen..."
        }
        value={block.content}
        disabled={locked}
        onChange={(e) => onChange({ content: e.target.value })}
      />

      {block.blockType === "decision" && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          <Select
            value={block.decisionOutcome}
            disabled={locked}
            onValueChange={(v) =>
              onChange({ decisionOutcome: v as MinuteBlock["decisionOutcome"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="deferred">Deferred</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={block.mover || ""}
            disabled={locked}
            onValueChange={(v) => onChange({ mover: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mover" />
            </SelectTrigger>
            <SelectContent>
              {members.map(m => (
                <SelectItem key={m.id} value={m.user.name}>{m.user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={block.seconder || ""}
            disabled={locked}
            onValueChange={(v) => onChange({ seconder: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seconder" />
            </SelectTrigger>
            <SelectContent>
              {members.map(m => (
                <SelectItem key={m.id} value={m.user.name}>{m.user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {block.blockType === "action" && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Select
            value={block.actionOwner || ""}
            disabled={locked}
            onValueChange={(v) => onChange({ actionOwner: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              {members.map(m => (
                <SelectItem key={m.id} value={m.user.name}>{m.user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={block.actionDueDate}
            disabled={locked}
            onChange={(e) => onChange({ actionDueDate: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
