"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronDown, 
  Info, 
  GripVertical,
  Check,
  X,
  Globe,
  Plus,
  Calendar,
  ToggleLeft,
  CheckSquare
} from "lucide-react";
import { Editor } from '@tinymce/tinymce-react';
import { updateMeeting } from "../actions";
import { format, parse } from 'date-fns';
import { useRouter } from "next/navigation";

export function MeetingOverviewClient({ meeting, members = [] }: { meeting: any, members?: any[] }) {
  const router = useRouter();
  const [isEditingGuests, setIsEditingGuests] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState(meeting.notes || "");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const [attendees, setAttendees] = useState<string[]>(meeting.attendees || []);
  const [apologies, setApologies] = useState<string[]>(meeting.apologies || []);
  
  const [showPeoplePicker, setShowPeoplePicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<{ list: 'attendees' | 'apologies', name: string } | null>(null);

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [location, setLocation] = useState(meeting.location || "");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [videoUrl, setVideoUrl] = useState(meeting.videoUrl || "");
  const [isEditingVideoUrl, setIsEditingVideoUrl] = useState(false);
  const [isMyTime, setIsMyTime] = useState(false);

  // New Location State
  const [locations, setLocations] = useState<any[]>([]);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocAddress, setNewLocAddress] = useState("");
  const [newLocTimeZone, setNewLocTimeZone] = useState("Asia/Kolkata");
  const [newLocIsDefault, setNewLocIsDefault] = useState(false);

  // Notice Modal State
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [noticeRecipients, setNoticeRecipients] = useState<any[]>([]);
  const [noticeGreeting, setNoticeGreeting] = useState("Hi");
  const [noticeComment, setNoticeComment] = useState("");

  const meetingId = meeting.id || "1";
  const orgId = meeting.organisationId;

  // Handle click outside to close dropdowns
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Fetch locations for organisation
    if (orgId) {
      import("../actions").then(({ getLocations }) => {
        getLocations(orgId).then(setLocations).catch(console.error);
      });
    }
  }, [orgId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPeoplePicker(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveAttendeesApologies = async (newAttendees: string[], newApologies: string[]) => {
    try {
      await updateMeeting(meetingId, { 
        attendees: newAttendees,
        apologies: newApologies
      });
    } catch (err) {
      console.error("Failed to update people lists", err);
    }
  };

  const handleAddPerson = (name: string) => {
    if (attendees.includes(name) || apologies.includes(name)) return;
    const newAttendees = [...attendees, name];
    setAttendees(newAttendees);
    setShowPeoplePicker(false);
    saveAttendeesApologies(newAttendees, apologies);
  };

  const handleMoveToApologies = (name: string) => {
    const newAttendees = attendees.filter(n => n !== name);
    const newApologies = [...apologies, name];
    setAttendees(newAttendees);
    setApologies(newApologies);
    setActiveDropdown(null);
    saveAttendeesApologies(newAttendees, newApologies);
  };

  const handleMoveToAttendees = (name: string) => {
    const newApologies = apologies.filter(n => n !== name);
    const newAttendees = [...attendees, name];
    setApologies(newApologies);
    setAttendees(newAttendees);
    setActiveDropdown(null);
    saveAttendeesApologies(newAttendees, newApologies);
  };

  const handleRemove = (name: string, list: 'attendees' | 'apologies') => {
    let newAttendees = attendees;
    let newApologies = apologies;
    
    if (list === 'attendees') {
      newAttendees = attendees.filter(n => n !== name);
      setAttendees(newAttendees);
    } else {
      newApologies = apologies.filter(n => n !== name);
      setApologies(newApologies);
    }
    
    setActiveDropdown(null);
    saveAttendeesApologies(newAttendees, newApologies);
  };
  
  return (
    <div className="p-8 max-w-5xl mx-auto">
      
      {/* Top Navbar */}
      <div className="flex items-center justify-end mb-8 gap-2">
        <button 
          onClick={() => setShowNoticeModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 bg-white rounded text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Calendar className="w-4 h-4" /> Notice
        </button>
        <Link href={`/meetings/${meetingId}/agenda`}>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 bg-white rounded text-sm font-medium hover:bg-slate-50 transition-colors">
            <span className="font-bold font-serif text-slate-400">A</span> Agenda <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </Link>
        <Link href={`/meetings/${meetingId}/pack`}>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 bg-white rounded text-sm font-medium hover:bg-slate-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> Board Pack <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </Link>
        <Link href={`/meetings/${meetingId}/minutes`}>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 bg-white rounded text-sm font-medium hover:bg-slate-50 transition-colors">
            <span className="font-bold font-serif text-slate-400">M</span> Minutes <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </Link>
        <div className="relative">
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="px-2 py-1.5 border border-slate-300 text-slate-600 bg-white rounded hover:bg-slate-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
          
          {showMoreMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded shadow-lg z-30 min-w-[180px] overflow-hidden">
              <button 
                onClick={() => {
                  setShowMoreMenu(false);
                  // Add email history handler here
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-600 font-medium text-sm flex items-center gap-2 border-b border-slate-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M4 11v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M12 7v4"/><path d="M8 7v4"/><path d="M16 7v4"/><circle cx="18" cy="18" r="3"/><path d="M18 16v2l1 1"/></svg> Email History
              </button>
              <button 
                onClick={async () => {
                  setShowMoreMenu(false);
                  if (confirm("Are you sure you want to delete this meeting?")) {
                    try {
                      const { deleteMeeting } = await import("../actions");
                      await deleteMeeting(meetingId);
                      router.push("/meetings");
                    } catch (err) {
                      console.error("Failed to delete meeting", err);
                      alert("Failed to delete meeting");
                    }
                  }
                }}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> Delete Meeting
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between mb-8">
        <h1 className="text-3xl font-medium text-slate-800">{meeting.title || "Untitled Meeting"}</h1>
        
        <div className="flex flex-col items-end gap-1">
          {meeting.agendaStatus === "PUBLISHED" ? (
            <>
              <span className="text-xs font-bold text-[#00d084] flex items-center gap-1"><CheckSquare className="w-3 h-3" /> Published</span>
              <Link href={`/meetings/${meetingId}/agenda`}>
                <button className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                  View Agenda
                </button>
              </Link>
            </>
          ) : (meeting.agendaSections && meeting.agendaSections.length > 0) ? (
            <>
              <span className="text-xs font-bold text-amber-500">Draft Agenda</span>
              <Link href={`/meetings/${meetingId}/agenda`}>
                <button className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                  Edit Agenda
                </button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-slate-400">No Agenda</span>
              <Link href={`/meetings/${meetingId}/agenda`}>
                <button className="px-4 py-1.5 bg-[#00d084] text-white rounded text-sm font-medium hover:bg-[#00c074] transition-colors shadow-sm">
                  Build Agenda
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="max-w-3xl space-y-8">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-sm font-semibold text-slate-700 pt-1">
              Date:
            </div>
            <div className="col-span-9 flex items-center gap-3">
              <p className="text-base text-slate-800">
                {meeting.date ? format(parse(meeting.date, 'yyyy-MM-dd', new Date()), 'dd MMM yyyy') : "Not set"} 
                <span className="text-slate-500 text-sm ml-1">(IST)</span>
              </p>
              <div className="flex items-center gap-2 ml-2">
                <span className={`text-sm font-medium ${!isMyTime ? 'text-blue-600' : 'text-slate-400'}`}>Meeting Time</span>
                <button onClick={() => setIsMyTime(!isMyTime)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <div className={`w-8 h-4 rounded-full flex items-center p-0.5 ${isMyTime ? 'bg-blue-500 justify-end' : 'bg-slate-300 justify-start'}`}>
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                  </div>
                </button>
                <span className={`text-sm font-medium ${isMyTime ? 'text-blue-600' : 'text-slate-400'}`}>My Time</span>
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-sm font-semibold text-slate-700 pt-1">
              Time:
            </div>
            <div className="col-span-9">
              <div className="flex items-center gap-4">
                <p className="text-base text-slate-800">
                  {meeting.startTime ? format(parse(meeting.startTime, 'HH:mm', new Date()), 'hh:mm a').toLowerCase() : "TBD"}
                  {" - "}
                  {meeting.endTime ? format(parse(meeting.endTime, 'HH:mm', new Date()), 'hh:mm a').toLowerCase() : "TBD"}
                </p>
                <span className="text-sm font-medium text-slate-400">2 hrs</span>
              </div>
              <div className="mt-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors">
                  <Calendar className="w-4 h-4" /> Add To Calendar
                </button>
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="grid grid-cols-12 gap-4 relative">
            <div className="col-span-3 text-sm font-semibold text-slate-700 pt-1">
              Location:
            </div>
            <div className="col-span-9 relative" ref={locationDropdownRef}>
              
              {/* Grey Location Box */}
              <div 
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="w-full bg-[#f1f3f4] p-3 rounded text-left cursor-pointer hover:bg-[#e8eaed] transition-colors relative group"
              >
                <div className="absolute top-2 right-2 text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </div>
                
                {(() => {
                  const activeLoc = meeting.locationId ? locations.find(l => l.id === meeting.locationId) : null;
                  
                  if (activeLoc) {
                    return (
                      <>
                        <h4 className="text-sm font-semibold text-slate-800">{activeLoc.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{activeLoc.address}</p>
                        <p className="text-sm text-slate-500 mt-0.5">Time zone: {activeLoc.timeZone}</p>
                      </>
                    );
                  }
                  
                  return (
                    <>
                      <h4 className="text-sm font-semibold text-slate-800">Default Location</h4>
                      <p className="text-sm text-slate-600 mt-1">{meeting.location || "No location set"}</p>
                    </>
                  );
                })()}
              </div>

              {/* Location Dropdown Menu */}
              {showLocationPicker && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-md shadow-xl z-20 py-2">
                  {locations.map(loc => (
                    <button 
                      key={loc.id}
                      onClick={async () => {
                        setShowLocationPicker(false);
                        if (loc.id !== meeting.locationId) {
                          try {
                            await updateMeeting(meetingId, { locationId: loc.id, location: loc.address });
                            // Optimistically update the UI
                            meeting.locationId = loc.id;
                            meeting.location = loc.address;
                          } catch (err) {
                            console.error("Failed to assign location", err);
                          }
                        }
                      }}
                      className="w-full flex flex-col px-4 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500 shrink-0" /> 
                        <span className="text-sm text-slate-800 font-medium">{loc.name} {loc.isDefault && <span className="text-slate-400 font-normal">(default)</span>}</span>
                      </div>
                      <span className="text-xs text-slate-500 mt-1 pl-6 line-clamp-1">{loc.address}</span>
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => {
                      setShowLocationPicker(false);
                      setShowAddLocationModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium border-t border-slate-100"
                  >
                    <Plus className="w-4 h-4" /> Add a new Location
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Video URL */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-sm font-semibold text-slate-700 pt-1">
              Video URL:
            </div>
            <div className="col-span-9">
              {!isEditingVideoUrl ? (
                <button 
                  onClick={() => setIsEditingVideoUrl(true)}
                  className={`text-sm ${videoUrl ? 'text-slate-800' : 'text-blue-600 hover:underline'} font-medium text-left`}
                >
                  {videoUrl || "Add Meeting URL"}
                </button>
              ) : (
                <div className="flex items-center gap-2 max-w-sm">
                  <input 
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button 
                    onClick={async () => {
                      setIsEditingVideoUrl(false);
                      if (videoUrl !== meeting.videoUrl) {
                        try {
                          await updateMeeting(meetingId, { videoUrl });
                        } catch (err) {
                          console.error("Failed to update videoUrl", err);
                        }
                      }
                    }}
                    className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setVideoUrl(meeting.videoUrl || "");
                      setIsEditingVideoUrl(false);
                    }}
                    className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Meeting Administrator */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 text-sm font-semibold text-slate-700">
              Meeting Administrator:
            </div>
            <div className="col-span-9">
              <div className="relative w-64">
                <select className="w-full appearance-none bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-2 outline-none focus:border-blue-500 transition-colors">
                  <option>{meeting.administrator || "Not Assigned"}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Alert Box */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3"></div>
            <div className="col-span-9">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  !
                </div>
                <div>
                  <p className="text-sm text-amber-900 font-semibold inline">Confirm your email: </p>
                  <p className="text-sm text-amber-800 inline">Check inbox to confirm your email address.</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Didn't receive the email? <button className="underline hover:text-amber-900">Resend</button>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendees / Apologies */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-sm font-semibold text-slate-700 pt-1">
              Attendees/Apologies:
            </div>
            <div className="col-span-9">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Attendees Column */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Attendees</h4>
                  <div className="space-y-2">
                    {attendees.map((name: string) => (
                      <div key={name} className="relative">
                        <button 
                          onClick={() => setActiveDropdown({ list: 'attendees', name })}
                          className="w-full flex items-center justify-between px-3 py-2 bg-blue-50/10 border border-blue-500 text-slate-800 text-sm rounded-md hover:bg-blue-50/50 transition-colors"
                        >
                          <span className="font-medium">{name}</span>
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        </button>
                        
                        {activeDropdown?.list === 'attendees' && activeDropdown?.name === name && (
                          <div ref={dropdownRef} className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
                            <button 
                              onClick={() => handleMoveToApologies(name)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                            >
                              To Apologies
                            </button>
                            <button 
                              onClick={() => handleRemove(name, 'attendees')}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                            >
                              Remove from meeting
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {attendees.length === 0 && (
                      <div className="w-full h-9 border border-blue-400 rounded-md bg-blue-50/10"></div>
                    )}
                  </div>
                </div>

                {/* Apologies Column */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Apologies</h4>
                  <div className="space-y-2">
                    {apologies.map((name: string) => (
                      <div key={name} className="relative">
                        <button 
                          onClick={() => setActiveDropdown({ list: 'apologies', name })}
                          className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 border border-transparent text-slate-700 text-sm rounded-md hover:bg-slate-200 transition-colors"
                        >
                          <span className="font-medium">{name}</span>
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        </button>
                        
                        {activeDropdown?.list === 'apologies' && activeDropdown?.name === name && (
                          <div ref={dropdownRef} className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
                            <button 
                              onClick={() => handleMoveToAttendees(name)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                            >
                              To Attendees
                            </button>
                            <button 
                              onClick={() => handleRemove(name, 'apologies')}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                            >
                              Remove from meeting
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {apologies.length === 0 && (
                      <div className="w-full h-9 bg-slate-100 rounded-sm"></div>
                    )}
                  </div>
                </div>

              </div>
              <p className="text-sm text-slate-500 mt-3">
                NOTE: You can drag and move people between Attendees or Apologies.
              </p>
              
              <div className="mt-3 flex items-center gap-2 relative">
                <button 
                  onClick={() => setShowPeoplePicker(!showPeoplePicker)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Add from People List
                </button>
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold font-serif italic" title="Add users from your organisation">
                  i
                </div>

                {/* People Picker Popover */}
                {showPeoplePicker && (
                  <div ref={pickerRef} className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                    {members.filter(m => !attendees.includes(m.user.name) && !apologies.includes(m.user.name)).length === 0 ? (
                      <div className="p-4 text-sm text-slate-500 text-center">No more members to add.</div>
                    ) : (
                      <div className="py-2">
                        {members
                          .filter(m => !attendees.includes(m.user.name) && !apologies.includes(m.user.name))
                          .map(member => (
                          <button
                            key={member.id}
                            onClick={() => handleAddPerson(member.user.name)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-800 hover:bg-slate-50 hover:text-blue-600"
                          >
                            {member.user.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-sm font-semibold text-slate-700 pt-2">
              Guests:
            </div>
            <div className="col-span-9 relative">
              <div 
                className={`relative flex items-center w-full ${isEditingGuests ? "border-b-2 border-blue-500" : "border-b-2 border-transparent"}`}
              >
                <input 
                  type="text" 
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  onFocus={() => setIsEditingGuests(true)}
                  placeholder="Separate guest names with commas. E.g. John Smith, Carol Riggs, Chris Jones" 
                  className={`w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-500 outline-none pb-2 ${isEditingGuests ? "pr-20" : ""}`}
                />
                {isEditingGuests && (
                  <div className="absolute right-0 bottom-2 flex items-center gap-1">
                    <button 
                      onClick={() => setIsEditingGuests(false)}
                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsEditingGuests(false)}
                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-sm font-semibold text-slate-700 pt-2">
              Notes:
            </div>
            <div className="col-span-9">
              {!isEditingNotes ? (
                <div 
                  className="w-full text-sm text-slate-500 cursor-text py-2 prose prose-sm max-w-none"
                  onClick={() => setIsEditingNotes(true)}
                  dangerouslySetInnerHTML={{ __html: notes || "Click here to add some notes at the top of the Agenda" }}
                />
              ) : (
                <div className="border border-slate-200 rounded-md shadow-sm bg-white flex flex-col">
                  {/* Editor Area */}
                  <div>
                    <Editor
                      tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js"
                      value={notes}
                      onEditorChange={(content) => setNotes(content)}
                      init={{
                        height: 300,
                        menubar: 'edit view insert format',
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                          'bold italic forecolor | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat | help',
                        content_style: 'body { font-family:Inter,sans-serif; font-size:14px; color:#1e293b; }',
                        promotion: false
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 p-2 bg-slate-50 border-t border-slate-100 rounded-b-md">
                    <button 
                      onClick={async () => {
                        setIsEditingNotes(false);
                        try {
                          await updateMeeting(meetingId, { notes });
                        } catch (err) {
                          console.error("Failed to update notes", err);
                        }
                      }}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setNotes(meeting.notes || "");
                        setIsEditingNotes(false);
                      }}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Add Location Modal */}
      {showAddLocationModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6">
              
              <div className="flex items-center gap-3 mb-8">
                <div className="text-[#00d084]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Add a Meeting Location</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-blue-600 mb-1">Name*</label>
                  <input 
                    type="text" 
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    className="w-full outline-none border-b-2 border-blue-600 py-1 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Address*</label>
                  <input 
                    type="text" 
                    value={newLocAddress}
                    onChange={(e) => setNewLocAddress(e.target.value)}
                    className="w-full outline-none border-b border-slate-300 py-1 text-slate-800 focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Location Time Zone*</label>
                  <select 
                    value={newLocTimeZone}
                    onChange={(e) => setNewLocTimeZone(e.target.value)}
                    className="w-full outline-none border-b border-slate-300 py-1 text-slate-800 focus:border-slate-500 appearance-none bg-transparent cursor-pointer"
                  >
                    <option value="Asia/Kolkata">Local: Asia/Kolkata (UTC+05:30)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="isDefault"
                    checked={newLocIsDefault}
                    onChange={(e) => setNewLocIsDefault(e.target.checked)}
                    className="w-5 h-5 border-slate-300 rounded text-[#00d084] focus:ring-[#00d084]"
                  />
                  <label htmlFor="isDefault" className="text-base text-slate-800">Set as default</label>
                </div>
              </div>

            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddLocationModal(false)}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!newLocName || !newLocAddress) return;
                  try {
                    const { createLocation } = await import("../actions");
                    const newLoc = await createLocation(orgId, {
                      name: newLocName,
                      address: newLocAddress,
                      timeZone: newLocTimeZone,
                      isDefault: newLocIsDefault
                    });
                    
                    setLocations([newLoc, ...locations]);
                    
                    // Assign it to current meeting immediately
                    await updateMeeting(meetingId, { locationId: newLoc.id, location: newLoc.address });
                    meeting.locationId = newLoc.id;
                    meeting.location = newLoc.address;
                    
                    setShowAddLocationModal(false);
                    setNewLocName("");
                    setNewLocAddress("");
                  } catch (err) {
                    console.error("Failed to create location", err);
                  }
                }}
                className="px-6 py-2 bg-[#00d084] text-white font-medium rounded hover:bg-[#00c074] transition-colors shadow-sm"
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between relative">
              <div className="flex gap-4">
                <div className="bg-blue-600 rounded p-1.5 text-white shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Meeting Notice</h2>
                  <p className="text-sm text-slate-600 mt-1">{meeting.title || "Untitled Meeting"} - {meeting.date ? format(parse(meeting.date, 'yyyy-MM-dd', new Date()), 'dd MMM yyyy') : "Date TBD"}</p>
                </div>
              </div>
              <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <p className="text-slate-700 mb-6">
                Send an email notice of this meeting, with calendar attachment, to the following attendees:
              </p>

              <div className="space-y-6">
                
                {/* Recipients Dropdown */}
                <div className="relative">
                  <div 
                    onClick={() => setShowRecipientPicker(!showRecipientPicker)}
                    className="w-full border-b border-slate-300 py-2 text-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-400 transition-colors"
                  >
                    <span className={noticeRecipients.length > 0 ? "text-slate-800" : "text-slate-500"}>
                      Send to: ({noticeRecipients.length}/{members?.length || 0})*
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>

                  {showRecipientPicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-20">
                      <div className="flex border-b border-slate-100">
                        <button className="flex-1 py-3 px-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600 flex items-center gap-2 justify-center">
                          <Check className="w-4 h-4" /> Board Members(0/0)
                        </button>
                        <button className="flex-1 py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 justify-center">
                          <div className="w-4 h-4 border border-slate-300 rounded-sm"></div> Non-Board Members(0/1)
                        </button>
                        <button onClick={() => setShowRecipientPicker(false)} className="p-3 text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto p-4 space-y-3">
                        {members?.map(m => (
                          <label key={m.id} className="flex items-start gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              className="mt-1 w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-blue-600"
                              checked={noticeRecipients.includes(m.id)}
                              onChange={(e) => {
                                if (e.target.checked) setNoticeRecipients([...noticeRecipients, m.id]);
                                else setNoticeRecipients(noticeRecipients.filter(id => id !== m.id));
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-slate-800">{m.user?.name || "Unknown"}</div>
                              <div className="text-xs text-slate-500">{m.user?.email || ""}</div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                        <button onClick={() => setShowRecipientPicker(false)} className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50">Cancel</button>
                        <button onClick={() => setShowRecipientPicker(false)} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Select</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Greeting */}
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-xs text-slate-500 mb-1">Greeting...</label>
                    <input 
                      type="text" 
                      value={noticeGreeting}
                      onChange={(e) => setNoticeGreeting(e.target.value)}
                      className="w-full border-b border-slate-300 py-1 text-slate-800 focus:outline-none focus:border-slate-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Name...</label>
                    <div className="border-b border-slate-300 py-1 flex items-center">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-3 py-0.5 rounded-full text-sm text-slate-700">
                        First Name <X className="w-3 h-3 text-slate-400 cursor-pointer" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment Box */}
                <div>
                  <textarea 
                    value={noticeComment}
                    onChange={(e) => setNoticeComment(e.target.value)}
                    placeholder="You can add an optional comment which will appear after the greeting"
                    className="w-full border border-slate-300 rounded p-3 text-sm text-slate-700 h-32 resize-y focus:outline-none focus:border-blue-500"
                  />
                  <div className="text-right text-xs text-slate-400 mt-1">{noticeComment.length} / 500</div>
                </div>

                {/* Warning text */}
                <div className="flex items-start gap-2 text-sm text-slate-600 bg-red-50/50 p-3 rounded">
                  <span className="text-red-500 font-bold shrink-0">⚠️</span>
                  <p>Please be aware BoardPro will automatically send reminders of this meeting to all attendees 7 days and then the day before this meeting.</p>
                </div>
                
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-lg">
              <button 
                onClick={() => setShowNoticeModal(false)}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    const { sendMeetingNotice } = await import("../actions");
                    await sendMeetingNotice(meetingId, {
                      recipients: noticeRecipients,
                      greeting: noticeGreeting,
                      comment: noticeComment
                    });
                    setShowNoticeModal(false);
                    alert("Meeting notice sent successfully!");
                  } catch (err) {
                    console.error("Failed to send notice", err);
                    alert("Failed to send notice");
                  }
                }}
                disabled={noticeRecipients.length === 0}
                className="px-6 py-2 bg-[#0052cc] text-white font-medium rounded hover:bg-[#0047b3] transition-colors shadow-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
