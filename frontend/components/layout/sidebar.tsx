"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Calendar,
  CheckSquare,
  ListChecks,
  Send,
  Library,
  User,
  GitBranch,
  Tent,
  ClipboardList,
  Settings2,
  ChevronDown,
  Gem,
  PanelLeftClose,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const mainNav = [
  { label: "Search", href: "/search", icon: Search },
  { label: "Meetings", href: "/meetings", icon: Calendar },
  { label: "Actions", href: "/actions", icon: CheckSquare },
  { label: "Decisions", href: "/decisions", icon: ListChecks },
  { label: "Between Meetings", href: "/between-meetings", icon: Send },
  { label: "Documents", href: "/documents", icon: Library },
  { label: "People", href: "/people", icon: User },
  { label: "Interests", href: "/interests", icon: GitBranch },
  { label: "Committees", href: "/committees", icon: Tent },
  { label: "Annual Work Plan", href: "/annual-work-plan", icon: ClipboardList },
  { label: "Settings", href: "/settings", icon: Settings2 },
];

export function Sidebar({ organisations = [], currentOrgId = "" }: { organisations?: any[], currentOrgId?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [activeOrgId, setActiveOrgId] = useState(currentOrgId);
  const activeOrg = organisations.find(o => o.id === activeOrgId) || organisations[0] || { name: "No Organisation" };

  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredOrgs = organisations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-slate-200 bg-[#f4f7f9] relative">
      {/* Top Header */}
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <span className="text-xl font-bold tracking-tight text-slate-900">
             SegueMeet
           </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
           <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
        
        {/* Dashboard Link (Above Boards) */}
        <div>
          <Link
            href="/my-home"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-[15px] transition-colors",
              pathname === "/my-home"
                ? "bg-slate-200/60 font-medium text-slate-800"
                : "font-medium text-slate-700 hover:bg-slate-200/40"
            )}
          >
            <LayoutDashboard className={cn("h-5 w-5", pathname === "/my-home" ? "text-blue-600" : "text-slate-600")} />
            Dashboard
          </Link>
        </div>

        {/* Boards Section */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Boards</h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2 shadow-sm mb-4 outline-none hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-600">
                  {activeOrg.name.charAt(0)}
                </div>
                <span className="font-semibold text-slate-800 text-[15px] truncate max-w-[120px]">
                  {activeOrg.name}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 mr-1" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56 p-1 border-slate-200 shadow-lg rounded-xl" align="start">
              <div className="px-2 py-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search boards & committees..." 
                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              <div className="max-h-[200px] overflow-y-auto py-1">
                {filteredOrgs.length > 0 ? (
                  filteredOrgs.map((org) => (
                    <DropdownMenuItem 
                      key={org.id}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm cursor-pointer",
                        activeOrgId === org.id ? "bg-slate-100 font-medium" : ""
                      )}
                      onClick={() => setActiveOrgId(org.id)}
                    >
                      <div className="w-5 h-5 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold mr-2 text-slate-500">
                        {org.name.charAt(0)}
                      </div>
                      <span className="truncate">{org.name}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-slate-500 text-center">No boards found</div>
                )}
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="p-1">
                <DropdownMenuItem 
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => router.push('/organisations/new')}
                >
                  <div className="w-6 h-6 border border-slate-300 rounded flex items-center justify-center">
                    <Plus className="w-4 h-4 text-slate-500" />
                  </div>
                  Add Board
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 opacity-50"
                  disabled
                >
                  <div className="w-6 h-6 border border-slate-300 rounded flex items-center justify-center">
                    <Plus className="w-4 h-4 text-slate-500" />
                  </div>
                  Add Committee (Coming Soon)
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <nav className="space-y-1">
            {mainNav.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors",
                    active
                      ? "bg-slate-200/70 font-medium text-slate-900"
                      : "font-medium text-slate-700 hover:bg-slate-200/40"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-blue-600" : "text-slate-600")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Buy Now Button */}
      <div className="p-4 mt-auto">
        <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors text-[15px]">
          <Gem className="w-5 h-5 text-white" />
          Buy Now
        </button>
      </div>
    </aside>
  );
}