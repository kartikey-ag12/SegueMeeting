"use client";

import { useState, useEffect } from "react";
import { AgendaItem, ActionFilterSettings } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";
import { UploadCloud, FileText, Check, X, Info } from "lucide-react";

export default function AgendaItemDetail({
  item,
  updateItem,
  members
}: {
  item: AgendaItem;
  updateItem: (itemId: string, patch: Partial<AgendaItem>) => void;
  members: any[];
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(item.title);
  
  // Initialize defaults if missing
  const [actionSettings, setActionSettings] = useState<ActionFilterSettings>(
    item.actionFilterSettings || { overdue: false, completedSince: null, dueBefore: null }
  );

  useEffect(() => {
    setTitle(item.title);
    setActionSettings(item.actionFilterSettings || { overdue: false, completedSince: null, dueBefore: null });
  }, [item]);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    updateItem(item.id, { title });
  };

  const isActionConfirmationItem = item.title.toLowerCase().includes("confirmation of board actions") || 
                                   item.title.toLowerCase().includes("action items");

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        
        {/* Title Edit */}
        <div>
          {!isEditingTitle ? (
            <h2 
              className="text-2xl font-bold text-slate-800 hover:text-blue-600 cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
            >
              {item.title}
            </h2>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 outline-none w-full max-w-lg focus:border-blue-500"
                autoFocus
              />
              <button onClick={handleTitleSave} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                <Check className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { setIsEditingTitle(false); setTitle(item.title); }} 
                className="p-2 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Description Rich Text */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
          <RichTextEditor 
            content={item.description || ""}
            onChange={(html) => updateItem(item.id, { description: html })}
            itemId={item.id}
          />
        </div>

        {/* Three Columns: Purpose, Presenter, Duration */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-1">
              Purpose <Info className="w-3.5 h-3.5 text-slate-400" title="Why is this item on the agenda?" />
            </label>
            <select
              value={item.purpose}
              onChange={(e) => updateItem(item.id, { purpose: e.target.value as any })}
              className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="NONE">Select...</option>
              <option value="FOR_NOTING">For Noting</option>
              <option value="FOR_DECISION">For Decision</option>
              <option value="FOR_DISCUSSION">For Discussion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Presenter</label>
            <select
              value={item.presenter || ""}
              onChange={(e) => updateItem(item.id, { presenter: e.target.value })}
              className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="">No Presenter</option>
              {members.map(m => (
                <option key={m.id} value={m.user.name}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (min)</label>
            <input
              type="number"
              value={item.durationMinutes}
              onChange={(e) => updateItem(item.id, { durationMinutes: parseInt(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-500"
              min="0"
            />
          </div>
        </div>

        {/* Special Action Filters Block */}
        {isActionConfirmationItem && (
          <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600" /> Action Filters
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={actionSettings.overdue}
                  onChange={(e) => {
                    const newSettings = { ...actionSettings, overdue: e.target.checked };
                    setActionSettings(newSettings);
                    updateItem(item.id, { actionFilterSettings: newSettings });
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label className="text-sm text-slate-700">Overdue Actions</label>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={!!actionSettings.completedSince}
                  onChange={(e) => {
                    const newSettings = { ...actionSettings, completedSince: e.target.checked ? new Date().toISOString().split('T')[0] : null };
                    setActionSettings(newSettings);
                    updateItem(item.id, { actionFilterSettings: newSettings });
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label className="text-sm text-slate-700">Actions completed since:</label>
                <input 
                  type="date" 
                  value={actionSettings.completedSince || ""}
                  onChange={(e) => {
                    const newSettings = { ...actionSettings, completedSince: e.target.value };
                    setActionSettings(newSettings);
                    updateItem(item.id, { actionFilterSettings: newSettings });
                  }}
                  disabled={!actionSettings.completedSince}
                  className="px-2 py-1 border border-slate-300 rounded text-sm outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={!!actionSettings.dueBefore}
                  onChange={(e) => {
                    const newSettings = { ...actionSettings, dueBefore: e.target.checked ? new Date().toISOString().split('T')[0] : null };
                    setActionSettings(newSettings);
                    updateItem(item.id, { actionFilterSettings: newSettings });
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label className="text-sm text-slate-700">Actions due (in future) before:</label>
                <input 
                  type="date" 
                  value={actionSettings.dueBefore || ""}
                  onChange={(e) => {
                    const newSettings = { ...actionSettings, dueBefore: e.target.value };
                    setActionSettings(newSettings);
                    updateItem(item.id, { actionFilterSettings: newSettings });
                  }}
                  disabled={!actionSettings.dueBefore}
                  className="px-2 py-1 border border-slate-300 rounded text-sm outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Live Preview of Actions (Mocked because backend is missing GET /action-items) */}
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded text-sm text-center text-slate-500 italic">
              No Actions Found matching these filters (API unavailable)
            </div>
          </div>
        )}

        {/* Supporting Documents */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Supporting Documents</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-100 hover:border-slate-400 cursor-pointer transition-colors">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-blue-600">Drop files or click here</p>
              <p className="text-xs text-slate-500 mt-1">Upload new documents</p>
            </div>
            
            <div className="border border-slate-300 bg-white rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
              <FileText className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">Governance Doc</p>
              <p className="text-xs text-slate-500 mt-1">Select from repository</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            {(!item.documents || item.documents.length === 0) ? (
              <p className="text-sm text-slate-500 italic">No documents uploaded.</p>
            ) : (
              <ul className="space-y-2">
                {item.documents.map(doc => (
                  <li key={doc.id} className="flex items-center gap-2 text-sm text-slate-700 bg-white p-2 rounded border border-slate-200">
                    <FileText className="w-4 h-4 text-blue-600" /> {doc.originalName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
