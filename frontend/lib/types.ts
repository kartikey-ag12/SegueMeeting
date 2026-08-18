export type AgendaStatus = "DRAFT" | "PUBLISHED";
export type MinutesStatus = "NOT_STARTED" | "DRAFT" | "IN_REVIEW" | "CONFIRMED";

export interface Meeting {
  id: string;
  title: string;
  date: string;       // ISO date, e.g. "2026-08-20"
  startTime: string;  // "10:00"
  endTime: string;    // "11:30"
  location: string;
  agendaStatus: AgendaStatus;
  minutesStatus: MinutesStatus;
}
export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  sizeBytes: number;
}

export interface ActionFilterSettings {
  overdue: boolean;
  completedSince: string | null;
  dueBefore: string | null;
}

export interface AgendaItem {
  id: string;
  title: string;
  purpose: "NONE" | "FOR_NOTING" | "FOR_DECISION" | "FOR_DISCUSSION";
  presenter: string;
  durationMinutes: number;
  description?: string;
  documents?: Document[];
  actionFilterSettings?: ActionFilterSettings;
}

export interface AgendaSection {
  id: string;
  title: string;
  items: AgendaItem[];
}

export type MinuteBlockType = "note" | "decision" | "action";


export interface MinuteBlock {
  id: string;
  agendaItemId: string;
  blockType: MinuteBlockType;
  content: string;
  decisionOutcome?: "approved" | "rejected" | "deferred";
  mover?: string;
  seconder?: string;
  actionOwner?: string;
  actionDueDate?: string;
  actionStatus?: "open" | "in_progress" | "completed" | "cancelled" | "overdue";
}