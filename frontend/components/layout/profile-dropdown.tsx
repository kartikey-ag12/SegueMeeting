"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Settings, Layers, HelpCircle, Users, FileText, Shield, MessageCircle, LogOut } from "lucide-react";
import { clearSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileDropdownProps {
  user: any;
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const router = useRouter();
  
  const initials = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : "KA";

  const handleLogout = async () => {
    await clearSession();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-8 w-8 bg-blue-100 text-blue-700 hover:opacity-80 transition-opacity">
          <AvatarFallback className="font-semibold text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        {/* Header Profile Section */}
        <div className="flex items-center gap-3 p-2 mb-2">
          <Avatar className="h-10 w-10 bg-blue-100 text-blue-700">
            <AvatarFallback className="font-semibold text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-slate-800 truncate">{user?.name || "Kartikey Agrahari"}</span>
            <span className="text-xs text-slate-500 truncate">{user?.email || "2k22.cse.2212451@gmail.com"}</span>
          </div>
        </div>

        <DropdownMenuItem onClick={() => router.push("/settings")} className="flex items-center gap-3 cursor-pointer text-slate-700 py-2">
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push("/organisations")} className="flex items-center gap-3 cursor-pointer text-slate-700 py-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">My Organisations</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-slate-100" />

        <DropdownMenuItem onClick={() => router.push("/help")} className="flex items-center gap-3 cursor-pointer text-slate-700 py-2">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">Help</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/community")} className="flex items-center gap-3 cursor-pointer text-slate-700 py-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">Community</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/terms")} className="flex items-center gap-3 cursor-pointer text-slate-700 py-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">Terms</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/privacy")} className="flex items-center gap-3 cursor-pointer text-slate-700 py-2">
          <Shield className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">Privacy</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/contact")} className="flex items-center gap-3 cursor-pointer text-slate-700 py-2">
          <MessageCircle className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">Contact</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-slate-100" />

        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 cursor-pointer text-slate-700 py-2">
          <LogOut className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
