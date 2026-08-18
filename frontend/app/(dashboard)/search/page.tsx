"use client";

import { useState, useEffect } from "react";
import { fetcher } from "@/lib/api";
import useSWR from "swr";
import { Search, FileText, Send, Users, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";

type FilterType = 'ALL' | 'GOVERNANCE' | 'MEETING_DOC' | 'FLYING_MINUTE';

export default function SearchPage() {
  const { data: user } = useSWR("/auth/me", fetcher);
  const orgId = user?.memberships?.[0]?.organisation?.id;

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const [filter, setFilter] = useState<FilterType>('ALL');

  const { data: results, isLoading } = useSWR(
    orgId && debouncedQuery.length > 1
      ? `/organisations/${orgId}/search?q=${encodeURIComponent(debouncedQuery)}&filter=${filter}`
      : null,
    fetcher
  );

  return (
    <div className="max-w-5xl mx-auto p-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            className="w-full text-lg outline-none text-slate-800 placeholder-slate-400 bg-transparent"
            placeholder="Search across board packs, documents and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {isLoading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin ml-3" />}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-slate-50">
          <button
            onClick={() => setFilter('ALL')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === 'ALL' ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('GOVERNANCE')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === 'GOVERNANCE' ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            )}
          >
            Governance document
          </button>
          <button
            onClick={() => setFilter('MEETING_DOC')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === 'MEETING_DOC' ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            )}
          >
            Meeting document
          </button>
          <button
            onClick={() => setFilter('FLYING_MINUTE')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === 'FLYING_MINUTE' ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            )}
          >
            Flying minute document
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!query && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-20">
            <Search className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg">Type to start searching...</p>
          </div>
        )}

        {query && query.length < 2 && (
          <div className="text-center text-slate-500 mt-8">
            Please enter at least 2 characters to search.
          </div>
        )}

        {query && query.length >= 2 && !isLoading && results?.length === 0 && (
          <div className="text-center text-slate-500 mt-12">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No results found</h3>
            <p>We couldn't find anything matching "{query}"</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-3 pb-8">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 px-1">
              Search Results ({results.length})
            </h3>
            {results.map((item: any) => (
              <Link key={item.id} href={item.url}>
                <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex gap-4 items-start group">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    item.type === 'GOVERNANCE_DOCUMENT' ? "bg-purple-100 text-purple-600" :
                    item.type === 'MEETING_DOCUMENT' ? "bg-blue-100 text-blue-600" :
                    item.type === 'FLYING_MINUTE' ? "bg-emerald-100 text-emerald-600" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {item.type === 'GOVERNANCE_DOCUMENT' && <FileText className="w-5 h-5" />}
                    {item.type === 'MEETING_DOCUMENT' && <FileText className="w-5 h-5" />}
                    {item.type === 'FLYING_MINUTE' && <Send className="w-5 h-5" />}
                    {item.type === 'MEETING' && <Calendar className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="capitalize">{item.type.replace('_', ' ').toLowerCase()}</span>
                      <span>•</span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      {item.context && (
                        <>
                          <span>•</span>
                          <span className="truncate text-slate-400">{item.context}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
