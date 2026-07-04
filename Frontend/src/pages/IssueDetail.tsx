import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, User as UserIcon, ThumbsUp, Send, CheckCircle, AlertTriangle, ShieldCheck, ArrowLeft, MessageSquare } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  user: { fullName: string; role: string };
  createdAt: string;
}

interface Issue {
  id: number;
  title: string;
  description: string;
  category: { id: number; name: string };

  photoUrls?: string;
  latitude: number;
  longitude: number;
  addressText?: string;
  status: 'OPEN' | 'ESCALATED' | 'IN_PROGRESS' | 'RESOLVED' | 'MARKED_FAKE' | 'REJECTED';
  meTooCount: number;
  createdAt: string;
  user: { id: number; fullName: string };
  resolutionNotes?: string;
  resolvedAt?: string;
}

export const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const filePrefix = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : (import.meta.env.DEV ? 'http://localhost:8080' : '');
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // Admin Action States
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/issues/${id}`);
      setIssue(response.data);
      
      const commentRes = await api.get(`/issues/${id}/comments`);
      setComments(commentRes.data);
    } catch (err) {
      console.error("Failed to load issue details", err);
      setError("Issue not found or server is unreachable.");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleVote = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setVoting(true);
    try {
      const response = await api.post(`/issues/${id}/me-too`);
      setIssue(response.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to vote.");
    } finally {
      setVoting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/issues/${id}/comments`, { content: newComment });
      setComments(prev => [...prev, response.data]);
      setNewComment('');
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to post comment.");
    }
  };

  const handleAdminAction = async (action: 'resolve' | 'mark-fake') => {
    if (!notes.trim()) {
      alert("Resolution/fake notes are required to update status.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = `/admin/issues/${id}/${action}`;
      const response = await api.patch(endpoint, { resolutionNotes: notes });
      setIssue(response.data);
      setNotes('');
      refreshUser();
      alert(`Issue successfully updated: ${action.toUpperCase()}`);
    } catch (err: any) {
      alert(err.response?.data?.error || "Admin action failed.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] flex flex-col justify-center items-center text-[#111111] p-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold">{error}</h2>
        <Link to="/" className="mt-4 bg-white border border-[#E8E8E8] hover:border-gray-300 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors">
          Return to Feed
        </Link>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD21F]"></div>
      </div>
    );
  }

  const isAssignedAdmin = user && user.role === 'MUNICIPAL_ADMIN';
  const isSuperAdmin = user && user.role === 'SUPER_ADMIN';
  const showAdminControls = (isAssignedAdmin || isSuperAdmin) && (issue.status === 'OPEN' || issue.status === 'ESCALATED' || issue.status === 'IN_PROGRESS');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] text-[#111111] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="bg-glow top-0 left-0"></div>
      <div className="bg-glow bottom-0 right-0"></div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#666666] hover:text-[#111111] transition-colors text-sm font-bold w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Issue details */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="premium-card overflow-hidden">
              {/* Photo cover */}
              <div className="h-80 w-full bg-[#F5F5F2] relative flex justify-center border-b border-[#E8E8E8]">
                {issue.photoUrls ? (
                  <img 
                    src={`${filePrefix}${issue.photoUrls}`} 
                    alt={issue.title}
                    className="h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#666666] font-medium tracking-wide">
                    No Photo Evidence Provided
                  </div>
                )}
              </div>

              {/* Detail Info */}
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-1.5 rounded-md bg-[#FFD21F]/10 text-[#111111] border border-[#FFD21F]/20 shadow-sm">
                      {issue.category.name}
                    </span>
                    <span className={`text-[10px] uppercase font-extrabold tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${
                        issue.status === 'ESCALATED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        issue.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        issue.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        issue.status === 'MARKED_FAKE' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-sky-50 text-sky-600 border-sky-100'
                      }`}>
                      {issue.status}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-extrabold tracking-tight text-[#111111] leading-tight">
                    {issue.title}
                  </h1>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#666666] font-medium">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="h-4 w-4 text-[#FFD21F]" /> Filed by: <span className="text-[#111111] font-semibold">{issue.user.fullName}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#FFD21F]" /> {new Date(issue.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#E8E8E8] pt-6">
                  <h3 className="text-xs font-bold text-[#666666] uppercase tracking-widest">Report Description</h3>
                  <p className="text-[#111111] font-medium text-sm leading-relaxed whitespace-pre-line">
                    {issue.description}
                  </p>
                </div>

                {/* Location details */}
                <div className="bg-[#FAFAF8] p-5 border border-[#E8E8E8] rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-[#666666] uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#FFD21F]" /> Mapping & Location Details
                  </h4>
                  {issue.addressText && (
                    <div className="text-sm font-semibold text-[#111111] pl-6 border-l-2 border-[#FFD21F]">
                      {issue.addressText}
                    </div>
                  )}
                  <div className="text-[11px] text-[#666666] font-mono pl-6 font-semibold">
                    Latitude: {issue.latitude.toFixed(6)}, Longitude: {issue.longitude.toFixed(6)}
                  </div>
                </div>

                {/* Resolution panel */}
                {(issue.status === 'RESOLVED' || issue.status === 'MARKED_FAKE') && (
                  <div className={`p-5 border rounded-xl space-y-3 shadow-sm ${issue.status === 'RESOLVED' ? 'bg-emerald-50 border-emerald-100 text-[#111111]' : 'bg-red-50 border-red-100 text-[#111111]'}`}>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 text-[#111111]">
                      {issue.status === 'RESOLVED' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-600" /> Resolution Log Notes
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-600" /> Municipal Audit Notes
                        </>
                      )}
                    </h4>
                    <p className="text-sm italic font-medium">
                      "{issue.resolutionNotes || "No resolution details logged."}"
                    </p>
                    {issue.resolvedAt && (
                      <div className="text-[11px] text-[#666666] font-bold">
                        Resolved on: {new Date(issue.resolvedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Feed */}
            <div className="premium-card p-8 space-y-6">
              <h3 className="text-lg font-extrabold flex items-center gap-2 border-b border-[#E8E8E8] pb-4 text-[#111111]">
                <MessageSquare className="h-5 w-5 text-[#FFD21F]" /> Discussion Panel ({comments.length})
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-[#666666] text-sm font-bold bg-[#F5F5F2] rounded-xl border border-[#E8E8E8]">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="bg-[#FAFAF8] p-5 border border-[#E8E8E8] rounded-xl space-y-2 hover:bg-[#F5F5F2] transition-colors shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-[#111111] flex items-center gap-2">
                          {c.user.fullName}
                          <span className={`text-[9px] px-2 py-0.5 rounded-sm font-mono tracking-wider border ${c.user.role === 'MUNICIPAL_ADMIN' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-[#666666] border-[#E8E8E8]'}`}>
                            {c.user.role}
                          </span>
                        </span>
                        <span className="text-[10px] text-[#666666] font-bold">
                          {new Date(c.createdAt).toLocaleDateString([], { dateStyle: 'short' })} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-[#111111] font-medium leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-3 items-end pt-5 border-t border-[#E8E8E8]">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Post a response or verification update..."
                      className="premium-input block w-full p-3.5 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary p-3.5 rounded-xl shadow-sm disabled:opacity-50"
                  >
                    <Send className="h-5 w-5 text-[#111111]" />
                  </button>
                </form>
              ) : (
                <div className="bg-[#FAFAF8] text-center py-5 rounded-xl border border-[#E8E8E8] text-sm text-[#666666] font-semibold shadow-sm">
                  Please <Link to="/login" className="text-[#FFD21F] font-bold hover:underline">sign in</Link> to post comments.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Actions Sidebar & Admin verification box */}
          <div className="space-y-6">
            
            {/* Citizen Actions card */}
            <div className="premium-card p-6 space-y-5 text-center sticky top-24">
              <h3 className="text-xs font-extrabold text-[#666666] uppercase tracking-widest border-b border-[#E8E8E8] pb-3">
                Citizen Validation
              </h3>
              
              <div className="space-y-2">
                <div className="text-5xl font-black text-[#FFD21F] font-mono">
                  {issue.meTooCount}
                </div>
                <p className="text-[11px] text-[#666666] leading-relaxed font-bold">
                  "Me Too" upvotes registered. Open issues automatically escalate to authorities upon reaching 6 votes.
                </p>
              </div>

              {user && user.role === 'CITIZEN' && user.id !== issue.user.id && issue.status === 'OPEN' && (
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 text-sm btn-primary shadow-[0_4px_14px_rgba(255,210,31,0.25)] disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {voting ? 'Casting Vote...' : 'Me Too! (I see this too)'}
                </button>
              )}
            </div>

            {/* Municipal Admin Controls */}
            {showAdminControls && (
              <div className="premium-card p-6 space-y-5 border border-amber-200 bg-amber-50">
                <h3 className="text-xs font-extrabold text-amber-600 uppercase tracking-widest flex items-center justify-center gap-1.5 border-b border-amber-200 pb-3">
                  <ShieldCheck className="h-4 w-4" /> Administrative Controls
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-2">Action Log Notes</label>
                    <textarea
                      required
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detail resolution steps or verification audit notes here..."
                      className="premium-input block w-full p-3 text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleAdminAction('resolve')}
                      disabled={loading}
                      className="py-3 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      Resolve Issue
                    </button>
                    <button
                      onClick={() => handleAdminAction('mark-fake')}
                      disabled={loading}
                      className="py-3 px-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      Flag as Fake
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
