"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AgendaSection, AgendaItem } from "@/lib/types";
import {
  createAgendaSection,
  updateAgendaSection,
  deleteAgendaSection,
  createAgendaItem,
  updateAgendaItem,
  deleteAgendaItem,
  updateMeeting,
} from "../../actions";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AgendaItemDetail from "./AgendaItemDetail";
import { ArrowLeft, Copy, CheckSquare, Lightbulb, FileText, Settings, Trash2, Plus, GripVertical, Info, LayoutTemplate, Play, BookOpen } from "lucide-react";
import Link from "next/link";
import { format, parse } from 'date-fns';

export default function AgendaBuilderClient({ meeting, members = [] }: { meeting: any, members?: any[] }) {
  const router = useRouter();
  const meetingId = meeting.id;

  const [sections, setSections] = useState<AgendaSection[]>(meeting.agendaSections || []);
  const [activeItem, setActiveItem] = useState<AgendaItem | null>(null);
  const [published, setPublished] = useState(meeting?.agendaStatus === "PUBLISHED");
  const [showModal, setShowModal] = useState(!meeting.agendaSections || meeting.agendaSections.length === 0);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Section edit states
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionEditTitle, setSectionEditTitle] = useState("");
  const [sectionMenuOpen, setSectionMenuOpen] = useState<string | null>(null);

  // --- Mock Templates logic (as API is missing) ---
  const applyTemplate = async () => {
    setIsLoading(true);
    try {
      if (selectedTemplate === "clone") {
        console.log("Mock Clone API called");
      } else if (selectedTemplate === "best-practice") {
        console.log("Mock Best Practice Template API called");
        const s1 = await createAgendaSection(meetingId, { title: "1. Standard Items", position: 0 });
        const i1 = await createAgendaItem(s1.id, { title: "Confirm Previous Meeting Minutes", purpose: "FOR_DECISION", presenter: "", durationMinutes: 5, position: 0 });
        const i2 = await createAgendaItem(s1.id, { title: "Confirmation of Board Actions Items", purpose: "FOR_NOTING", presenter: "", durationMinutes: 5, position: 1 });
        setSections([{ ...s1, items: [i1, i2] }]);
      } else if (selectedTemplate === "strategic") {
        console.log("Mock Strategic Template API called");
        const s1 = await createAgendaSection(meetingId, { title: "1. Strategy", position: 0 });
        const i1 = await createAgendaItem(s1.id, { title: "Strategic Review", purpose: "FOR_DISCUSSION", presenter: "", durationMinutes: 30, position: 0 });
        setSections([{ ...s1, items: [i1] }]);
      }
      setShowModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  // ------------------------------------------------

  // --- CRUD Operations ---
  const addSection = async () => {
    try {
      const newSection = await createAgendaSection(meetingId, { title: "New section", position: sections.length });
      setSections([...sections, { ...newSection, items: [] }]);
    } catch (e) { console.error(e); }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      await deleteAgendaSection(sectionId);
      setSections(sections.filter(s => s.id !== sectionId));
      if (activeItem && !sections.find(s => s.id !== sectionId)?.items.find(i => i.id === activeItem.id)) {
        setActiveItem(null);
      }
    } catch (e) { console.error(e); }
  };

  const saveSectionTitle = async (sectionId: string) => {
    if (!sectionEditTitle) return;
    try {
      await updateAgendaSection(sectionId, { title: sectionEditTitle });
      setSections(sections.map(s => s.id === sectionId ? { ...s, title: sectionEditTitle } : s));
    } catch (e) { console.error(e); }
    setEditingSectionId(null);
  };

  const addItem = async (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;
    try {
      const newItem = await createAgendaItem(sectionId, {
        title: "New agenda item", purpose: "NONE", presenter: "", durationMinutes: 5, position: sections[sectionIndex].items?.length || 0,
      });
      setSections(sections.map(s => s.id === sectionId ? { ...s, items: [...(s.items || []), newItem] } : s));
      setActiveItem(newItem);
    } catch (e) { console.error(e); }
  };

  const deleteItem = async (sectionId: string, itemId: string) => {
    try {
      await deleteAgendaItem(itemId);
      setSections(sections.map(s => s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s));
      if (activeItem?.id === itemId) setActiveItem(null);
    } catch (e) { console.error(e); }
  };

  const updateItemDetails = async (itemId: string, patch: Partial<AgendaItem>) => {
    try {
      await updateAgendaItem(itemId, patch);
      setSections(sections.map(s => ({
        ...s, items: s.items.map(i => i.id === itemId ? { ...i, ...patch } : i)
      })));
      if (activeItem?.id === itemId) setActiveItem({ ...activeItem, ...patch });
    } catch (e) { console.error(e); }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const sourceSectionId = result.source.droppableId;
    const destSectionId = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const itemId = result.draggableId;

    if (sourceSectionId === destSectionId && sourceIndex === destIndex) return;

    const sourceSection = sections.find(s => s.id === sourceSectionId);
    const destSection = sections.find(s => s.id === destSectionId);
    if (!sourceSection || !destSection) return;

    const newSections = [...sections];
    const newSourceSection = { ...sourceSection, items: [...sourceSection.items] };
    const [movedItem] = newSourceSection.items.splice(sourceIndex, 1);
    
    if (sourceSectionId === destSectionId) {
      newSourceSection.items.splice(destIndex, 0, movedItem);
      const updatedSections = newSections.map(s => s.id === sourceSectionId ? newSourceSection : s);
      setSections(updatedSections);
      // Backend sync
      await updateItemDetails(itemId, { position: destIndex });
    } else {
      const newDestSection = { ...destSection, items: [...destSection.items] };
      newDestSection.items.splice(destIndex, 0, movedItem);
      const updatedSections = newSections.map(s => {
        if (s.id === sourceSectionId) return newSourceSection;
        if (s.id === destSectionId) return newDestSection;
        return s;
      });
      setSections(updatedSections);
      // Backend sync
      await updateItemDetails(itemId, { sectionId: destSectionId, position: destIndex });
    }
  };

  const handlePublish = async () => {
    try {
      await updateMeeting(meetingId, { agendaStatus: "PUBLISHED" });
      setPublished(true);
    } catch (e) { console.error(e); }
  };

  const handleRollback = async () => {
    try {
      await updateMeeting(meetingId, { agendaStatus: "DRAFT" });
      setPublished(false);
    } catch (e) { console.error(e); }
  };

  const handleClose = () => {
    router.push(`/meetings/${meetingId}`);
    router.refresh();
  };

  // --- Render ---

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col">
          {!isLoading ? (
            <>
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800">Build agenda</h2>
                <p className="text-slate-500 mt-1">Select an option below to start building your agenda.</p>
              </div>
              <div className="p-8 bg-slate-50 grid grid-cols-2 gap-6">
                {[
                  { id: "clone", title: "Clone another agenda", icon: Copy, desc: "Copy from an existing meeting" },
                  { id: "best-practice", title: "Best practice template", icon: CheckSquare, desc: "Standard board meeting format" },
                  { id: "strategic", title: "Strategic agenda template", icon: BookOpen, desc: "Focus on strategy and vision" },
                  { id: "ai", title: "Build an AI agenda", icon: Lightbulb, desc: "Not yet available", disabled: true }
                ].map(opt => (
                  <div 
                    key={opt.id}
                    onClick={() => !opt.disabled && setSelectedTemplate(opt.id)}
                    className={`p-6 rounded-xl border-2 flex items-start gap-4 cursor-pointer transition-all ${opt.disabled ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-100' : selectedTemplate === opt.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    title={opt.disabled ? opt.desc : ""}
                  >
                    <div className={`p-3 rounded-lg ${selectedTemplate === opt.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      <opt.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${selectedTemplate === opt.id ? 'text-blue-900' : 'text-slate-800'}`}>{opt.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <button 
                  onClick={handleClose}
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={!selectedTemplate}
                  onClick={applyTemplate}
                  className="px-6 py-2.5 bg-[#00d084] text-white font-medium rounded hover:bg-[#00c074] transition-colors disabled:opacity-50"
                >
                  Build agenda
                </button>
              </div>
            </>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00d084] rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-slate-800">We are generating your agenda…</h2>
              <p className="text-slate-500 mt-2">This may take a few seconds, but it's worth the wait.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
            <h2 className="text-xl font-bold text-slate-800">Agenda Preview</h2>
            <button onClick={() => setShowPreview(false)} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-12 bg-gray-100">
            <div className="bg-white shadow-sm border border-slate-200 p-12 max-w-3xl mx-auto min-h-full">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Agenda: {meeting.title}</h1>
              <p className="text-slate-600 mb-8">{meeting.date ? format(parse(meeting.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy') : "TBD"} • {meeting.startTime || ''} - {meeting.endTime || ''}</p>
              
              <div className="space-y-8">
                {sections.map((section, sIndex) => (
                  <div key={section.id}>
                    <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">{sIndex + 1}. {section.title}</h2>
                    <div className="space-y-4 pl-4">
                      {(section.items || []).map((item, iIndex) => (
                        <div key={item.id} className="flex flex-col">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-semibold text-slate-800">{sIndex + 1}.{iIndex + 1} {item.title}</h3>
                            <span className="text-sm text-slate-500 font-medium">{item.durationMinutes} min</span>
                          </div>
                          <div className="flex gap-4 mt-1 text-sm text-slate-600">
                            {item.purpose !== 'NONE' && (
                              <span className="italic">{item.purpose.replace('_', ' ')}</span>
                            )}
                            {item.presenter && (
                              <span>Presenter: <span className="font-medium">{item.presenter}</span></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50 shrink-0">
        <button onClick={handleClose} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Return to {meeting.title} | {meeting.date ? format(parse(meeting.date, 'yyyy-MM-dd', new Date()), 'dd MMM yyyy') : "TBD"}
        </button>
        <div className="font-bold text-slate-800 text-lg">
          Draft Agenda
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreview(true)} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-100">
            Preview
          </button>
          {!published ? (
            <button onClick={handlePublish} className="px-4 py-2 bg-[#00d084] text-white text-sm font-medium rounded hover:bg-[#00c074]">
              Publish Agenda
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-slate-100 text-slate-500 text-sm font-bold rounded flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> Published
              </div>
              <button onClick={handleRollback} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-100">
                Roll Back to Draft
              </button>
            </div>
          )}
          <button onClick={handleClose} className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Outline */}
        <div className="w-[450px] border-r border-slate-200 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              {sections.map((section, sIndex) => (
                <div key={section.id} className="space-y-3">
                  {/* Section Header */}
                  <div className="flex items-center justify-between group">
                    {editingSectionId === section.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input 
                          type="text" 
                          value={sectionEditTitle} 
                          onChange={e => setSectionEditTitle(e.target.value)} 
                          className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm outline-none"
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && saveSectionTitle(section.id)}
                        />
                        <button onClick={() => saveSectionTitle(section.id)} className="p-1 bg-blue-50 text-blue-600 rounded"><CheckSquare className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <h3 className="font-bold text-slate-800 text-base">{sIndex + 1}. {section.title}</h3>
                    )}
                    
                    <div className="relative">
                      <button onClick={() => setSectionMenuOpen(sectionMenuOpen === section.id ? null : section.id)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                        <GripVertical className="w-4 h-4" /> {/* Wait, '⋮' vertical icon is typically MoreVertical, but GripVertical is fine or just three dots */}
                      </button>
                      {sectionMenuOpen === section.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded shadow-lg z-10 w-32 py-1">
                          <button onClick={() => { setEditingSectionId(section.id); setSectionEditTitle(section.title); setSectionMenuOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Rename</button>
                          <button onClick={() => { deleteSection(section.id); setSectionMenuOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section Items */}
                  <Droppable droppableId={section.id}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[10px]">
                        {(section.items || []).map((item, iIndex) => {
                          const isActive = activeItem?.id === item.id;
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={iIndex}>
                              {(provided) => (
                                <div 
                                  ref={provided.innerRef} 
                                  {...provided.draggableProps} 
                                  className={`group flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all ${isActive ? 'bg-blue-50/30 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                  onClick={() => setActiveItem(item)}
                                >
                                  <div {...provided.dragHandleProps} className="mt-1 text-slate-300 hover:text-slate-500">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className={`font-semibold text-sm leading-tight ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                                        {sIndex + 1}.{iIndex + 1} {item.title}
                                      </h4>
                                      <button onClick={(e) => { e.stopPropagation(); deleteItem(section.id, item.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                                      {item.presenter && <span>{item.presenter}</span>}
                                      <span>{item.durationMinutes} min</span>
                                      {item.purpose !== "NONE" && (
                                        <span className={`px-2 py-0.5 rounded-full ${item.purpose === 'FOR_DECISION' ? 'bg-amber-100 text-amber-700' : item.purpose === 'FOR_DISCUSSION' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                          {item.purpose.replace('_', ' ')}
                                        </span>
                                      )}
                                      {item.title.includes('AI') && <Lightbulb className="w-3.5 h-3.5 text-amber-500" />}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Section Footers */}
                  <div className="flex items-center gap-2 pl-6">
                    <button onClick={() => addItem(section.id)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                      <Plus className="w-3 h-3" /> Agenda Item
                    </button>
                  </div>
                </div>
              ))}
            </DragDropContext>

            <button onClick={addSection} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-sm font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-600 transition-colors flex justify-center items-center gap-2">
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>
        </div>

        {/* Right Panel - Details */}
        {activeItem ? (
          <AgendaItemDetail item={activeItem} updateItem={updateItemDetails} members={members} />
        ) : (
          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <LayoutTemplate className="w-16 h-16 mb-4 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-600 mb-2">Select an item to edit</h2>
            <p className="text-sm">Click any agenda item in the outline to view and edit its details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
