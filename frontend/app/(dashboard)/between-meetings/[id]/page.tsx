"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchWithAuth } from "@/lib/api";
import useSWR from "swr";
import { toast } from "sonner";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function FlyingMinuteDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orgId = user?.currentOrganisationId;

  const [comment, setComment] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  const { data: fm, error, isLoading, mutate } = useSWR(
    orgId && id ? `/organisations/${orgId}/decisions/${id}` : null,
    fetchWithAuth
  );

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error || !fm) {
    return <div className="p-8">Failed to load flying minute.</div>;
  }

  // Check if current user is in the voter list
  const userVoteRecord = fm.votes?.find((v: any) => v.voterId === user?.id);
  const hasVoted = !!userVoteRecord?.vote;

  const handleVote = async (vote: 'IN_FAVOUR' | 'AGAINST' | 'ABSTAIN') => {
    try {
      setIsVoting(true);
      await fetchWithAuth(`/organisations/${orgId}/decisions/${id}/vote`, {
        method: "POST",
        body: JSON.stringify({ vote, comment })
      });
      toast.success("Vote submitted successfully");
      mutate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit vote");
    } finally {
      setIsVoting(false);
    }
  };

  // Tally votes
  const inFavour = fm.votes?.filter((v: any) => v.vote === 'IN_FAVOUR').length || 0;
  const against = fm.votes?.filter((v: any) => v.vote === 'AGAINST').length || 0;
  const abstain = fm.votes?.filter((v: any) => v.vote === 'ABSTAIN').length || 0;
  const totalVotes = fm.votes?.length || 0;
  const votedCount = inFavour + against + abstain;
  const pendingCount = totalVotes - votedCount;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/between-meetings">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">Flying Minute Details</h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          fm.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
          fm.status === 'PASSED' ? 'bg-emerald-100 text-emerald-700' :
          fm.status === 'FAILED' ? 'bg-red-100 text-red-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {fm.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">{fm.title}</h2>
            <div className="text-sm text-slate-500 mb-6 flex gap-4">
              <span>Created: {new Date(fm.createdAt).toLocaleDateString()}</span>
              {fm.closeDate && <span>Closes: {new Date(fm.closeDate).toLocaleDateString()}</span>}
            </div>
            
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
              {fm.content}
            </div>
          </div>

          {userVoteRecord && !hasVoted && fm.status === 'OPEN' && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
              <h3 className="text-md font-semibold text-indigo-900 mb-4">Cast Your Vote</h3>
              
              <div className="space-y-4">
                <Textarea 
                  placeholder="Add an optional comment..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-white"
                />
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                    onClick={() => handleVote('IN_FAVOUR')}
                    disabled={isVoting}
                  >
                    <CheckCircle2 className="w-4 h-4" /> In Favour
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    onClick={() => handleVote('AGAINST')}
                    disabled={isVoting}
                  >
                    <XCircle className="w-4 h-4" /> Against
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                    onClick={() => handleVote('ABSTAIN')}
                    disabled={isVoting}
                  >
                    <MinusCircle className="w-4 h-4" /> Abstain
                  </Button>
                </div>
              </div>
            </div>
          )}

          {userVoteRecord && hasVoted && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Your Vote</h3>
                <p className="text-sm text-slate-500">You voted <strong>{userVoteRecord.vote?.replace('_', ' ')}</strong></p>
                {userVoteRecord.comment && (
                  <p className="text-sm text-slate-600 mt-2 italic">"{userVoteRecord.comment}"</p>
                )}
              </div>
              {userVoteRecord.vote === 'IN_FAVOUR' && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
              {userVoteRecord.vote === 'AGAINST' && <XCircle className="w-8 h-8 text-red-500" />}
              {userVoteRecord.vote === 'ABSTAIN' && <MinusCircle className="w-8 h-8 text-slate-400" />}
            </div>
          )}
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Voting Progress</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">In Favour</span>
                  <span className="font-medium text-slate-900">{inFavour}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${totalVotes ? (inFavour / totalVotes) * 100 : 0}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Against</span>
                  <span className="font-medium text-slate-900">{against}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalVotes ? (against / totalVotes) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Abstain</span>
                  <span className="font-medium text-slate-900">{abstain}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${totalVotes ? (abstain / totalVotes) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Pending</span>
                  <span className="font-medium text-slate-900">{pendingCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-200 h-2 rounded-full" style={{ width: `${totalVotes ? (pendingCount / totalVotes) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 text-center">
                {votedCount} of {totalVotes} members have voted
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Voters</h3>
            <div className="space-y-3">
              {fm.votes?.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{v.voter?.name || 'Unknown User'}</span>
                  {v.vote === 'IN_FAVOUR' && <span className="text-emerald-600 font-medium">In Favour</span>}
                  {v.vote === 'AGAINST' && <span className="text-red-600 font-medium">Against</span>}
                  {v.vote === 'ABSTAIN' && <span className="text-slate-500 font-medium">Abstain</span>}
                  {!v.vote && <span className="text-slate-400">Pending</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
