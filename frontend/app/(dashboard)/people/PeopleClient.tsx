"use client";

import { useState } from "react";
import { UserPlus, Settings2, Trash2, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PeopleClient({ orgId, initialMembers }: { orgId: string, initialMembers: any[] }) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  
  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  
  // Form state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proxy?path=/organisations/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to invite member");
      }
      setIsInviteOpen(false);
      setEmail("");
      setRole("MEMBER");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proxy?path=/organisations/${orgId}/members/${selectedMember.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update role");
      }
      setIsEditOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proxy?path=/organisations/${orgId}/members/${selectedMember.user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to remove member");
      }
      setIsDeleteOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">People</h1>
          <p className="text-sm text-slate-500 mt-1">Manage members of your organisation</p>
        </div>
        <button 
          onClick={() => { setIsInviteOpen(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialMembers.map((member: any) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {member.user.name}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {member.user.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.role === 'BOARD_ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {member.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button 
                    onClick={() => { setSelectedMember(member); setRole(member.role); setError(""); setIsEditOpen(true); }}
                    className="text-slate-400 hover:text-blue-600 transition-colors" 
                    title="Edit Role"
                  >
                    <Settings2 className="w-4 h-4 inline-block" />
                  </button>
                  <button 
                    onClick={() => { setSelectedMember(member); setError(""); setIsDeleteOpen(true); }}
                    className="text-slate-400 hover:text-red-600 transition-colors" 
                    title="Remove Member"
                  >
                    <Trash2 className="w-4 h-4 inline-block" />
                  </button>
                </td>
              </tr>
            ))}
            
            {initialMembers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Invite Member</h2>
              <button onClick={() => setIsInviteOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  <option value="MEMBER">Member</option>
                  <option value="BOARD_ADMIN">Board Admin</option>
                  <option value="CHAIR">Chair</option>
                  <option value="SECRETARY">Secretary</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" type="button" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {isEditOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Role for {selectedMember.user.name}</h2>
              <button onClick={() => setIsEditOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  <option value="MEMBER">Member</option>
                  <option value="BOARD_ADMIN">Board Admin</option>
                  <option value="CHAIR">Chair</option>
                  <option value="SECRETARY">Secretary</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Remove Member</h2>
              <button onClick={() => setIsDeleteOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
            <p className="text-slate-600">
              Are you sure you want to remove <strong>{selectedMember.user.name}</strong> from this organisation? 
              They will lose access to all meetings and documents.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" type="button" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
