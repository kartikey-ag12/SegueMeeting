"use client";

import { useState } from "react";
import { format, isAfter, subDays, subMonths, subYears } from "date-fns";
import { Calendar, Search, Filter, ListChecks, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface Decision {
  id: string;
  content: string;
  type: "MEETING" | "FLYING_MINUTE";
  outcome: "APPROVED" | "NOT_APPROVED" | "NOT_SET";
  mover: string | null;
  seconder: string | null;
  date: string;
  meetingTitle?: string;
}

export function DecisionsClient({ initialDecisions }: { initialDecisions: Decision[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Date Range State
  const [dateRange, setDateRange] = useState<string>("Past 6 months");
  
  // Type Filter State
  const [typeSearch, setTypeSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Outcome Filter State
  const [outcomeSearch, setOutcomeSearch] = useState("");
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);

  // Filtering Logic
  const filteredDecisions = initialDecisions.filter((decision) => {
    // 1. Search filter
    const matchesSearch = decision.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (decision.meetingTitle && decision.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 2. Type filter
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(decision.type);
    
    // 3. Outcome filter
    const matchesOutcome = selectedOutcomes.length === 0 || selectedOutcomes.includes(decision.outcome);
    
    // 4. Date range filter
    const decisionDate = new Date(decision.date);
    const today = new Date();
    let matchesDate = true;
    if (dateRange === "Past 30 days") matchesDate = isAfter(decisionDate, subDays(today, 30));
    else if (dateRange === "Past 90 days") matchesDate = isAfter(decisionDate, subDays(today, 90));
    else if (dateRange === "Past 6 months") matchesDate = isAfter(decisionDate, subMonths(today, 6));
    else if (dateRange === "Past 1 year") matchesDate = isAfter(decisionDate, subYears(today, 1));
    else if (dateRange === "Past 5 years") matchesDate = isAfter(decisionDate, subYears(today, 5));
    
    return matchesSearch && matchesType && matchesOutcome && matchesDate;
  });

  const toggleType = (val: string) => {
    setSelectedTypes(prev => prev.includes(val) ? prev.filter(t => t !== val) : [...prev, val]);
  };
  
  const toggleOutcome = (val: string) => {
    setSelectedOutcomes(prev => prev.includes(val) ? prev.filter(o => o !== val) : [...prev, val]);
  };

  const formatOutcome = (outcome: string) => {
    if (outcome === "NOT_APPROVED") return "Not Approved";
    if (outcome === "NOT_SET") return "Not Set";
    return "Approved";
  };
  
  const formatType = (type: string) => {
    if (type === "FLYING_MINUTE") return "Flying Minute";
    return "Meeting";
  };

  const types = ["MEETING", "FLYING_MINUTE"];
  const filteredTypeOptions = types.filter(t => formatType(t).toLowerCase().includes(typeSearch.toLowerCase()));

  const outcomes = ["NOT_APPROVED", "APPROVED", "NOT_SET"];
  const filteredOutcomeOptions = outcomes.filter(o => formatOutcome(o).toLowerCase().includes(outcomeSearch.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-baseline gap-2 text-slate-800">
            Decisions Register
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Central record of all decisions
            </span>
          </h1>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search..." 
            className="pl-9 bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3">
        {/* DATE RANGE FILTER */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "bg-white text-slate-600 font-normal h-9")}>
            <Calendar className="mr-2 h-4 w-4 text-slate-400" />
            {dateRange}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {["Past 30 days", "Past 90 days", "Past 6 months", "Past 1 year", "Past 5 years", "Custom"].map(range => (
              <DropdownMenuItem 
                key={range} 
                className="cursor-pointer"
                onClick={() => setDateRange(range)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{range}</span>
                  {dateRange === range && <CheckCircle2 className="w-4 h-4 text-slate-400" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* TYPE FILTER */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "bg-white font-normal h-9", selectedTypes.length > 0 ? "border-blue-500 text-blue-700 bg-blue-50" : "text-slate-600")}>
            <Filter className={`mr-2 h-4 w-4 ${selectedTypes.length > 0 ? "text-blue-500" : "text-slate-400"}`} />
            Type {selectedTypes.length > 0 && `(${selectedTypes.length})`}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2" align="start">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Type" 
                className="w-full pl-7 pr-2 py-1 text-sm bg-slate-50 border-none rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={typeSearch}
                onChange={(e) => setTypeSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            {filteredTypeOptions.map(type => (
              <div 
                key={type}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-slate-100 cursor-pointer"
                onClick={() => toggleType(type)}
              >
                <input type="checkbox" checked={selectedTypes.includes(type)} readOnly className="rounded text-blue-600 w-3.5 h-3.5" />
                <span>{formatType(type)}</span>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* OUTCOME FILTER */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "bg-white font-normal h-9", selectedOutcomes.length > 0 ? "border-blue-500 text-blue-700 bg-blue-50" : "text-slate-600")}>
            <CheckCircle2 className={`mr-2 h-4 w-4 ${selectedOutcomes.length > 0 ? "text-blue-500" : "text-slate-400"}`} />
            Outcome {selectedOutcomes.length > 0 && `(${selectedOutcomes.length})`}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2" align="start">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Outcome" 
                className="w-full pl-7 pr-2 py-1 text-sm bg-slate-50 border-none rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={outcomeSearch}
                onChange={(e) => setOutcomeSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            {filteredOutcomeOptions.map(outcome => (
              <div 
                key={outcome}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-slate-100 cursor-pointer"
                onClick={() => toggleOutcome(outcome)}
              >
                <input type="checkbox" checked={selectedOutcomes.includes(outcome)} readOnly className="rounded text-blue-600 w-3.5 h-3.5" />
                <span className="flex items-center gap-1">
                  {outcome === "NOT_APPROVED" && <span className="w-3 h-3 rounded-full border border-slate-400 flex items-center justify-center text-[8px]">x</span>}
                  {outcome === "APPROVED" && <CheckCircle2 className="w-3 h-3 text-slate-600" />}
                  {outcome === "NOT_SET" && <span className="w-3 h-3 rounded-full border border-dashed border-slate-400" />}
                  {formatOutcome(outcome)}
                </span>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content Area */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        {filteredDecisions.length === 0 ? (
          // Empty State matching the screenshot
          <div className="p-24 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 p-4 rounded-2xl mb-4">
              <ListChecks className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-sm font-medium">No results found</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-slate-500 border-b">
              <tr>
                <th className="px-6 py-4 font-medium w-1/2">Decision</th>
                <th className="px-6 py-4 font-medium">Meeting</th>
                <th className="px-6 py-4 font-medium">Outcome</th>
                <th className="px-6 py-4 font-medium">Mover / Seconder</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDecisions.map(decision => (
                <tr key={decision.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {decision.content}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{decision.meetingTitle || "-"}</span>
                      <span className="text-xs">{format(new Date(decision.date), "dd MMM yyyy")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      decision.outcome === "APPROVED" ? "bg-green-100 text-green-700" :
                      decision.outcome === "NOT_APPROVED" ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {formatOutcome(decision.outcome)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {decision.mover && decision.seconder ? (
                       <span className="flex flex-col gap-0.5">
                         <span><span className="text-xs text-slate-400">M:</span> {decision.mover}</span>
                         <span><span className="text-xs text-slate-400">S:</span> {decision.seconder}</span>
                       </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
