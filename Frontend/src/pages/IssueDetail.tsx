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
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col justify-center items-center text-white p-4">
        <AlertTriangle className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold">{error}</h2>
        <Link to="/" className="mt-4 bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-2.5 rounded-lg text-sm">
          Return to Feed
        </Link>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex justify-center items-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  const isAssignedAdmin = user && user.role === 'MUNICIPAL_ADMIN';
  const isSuperAdmin = user && user.role === 'SUPER_ADMIN';
  const showAdminControls = (isAssignedAdmin || isSuperAdmin) && (issue.status === 'OPEN' || issue.status === 'ESCALATED' || issue.status === 'IN_PROGRESS');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Issue details */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Photo cover */}
              <div className="h-80 w-full bg-slate-950 relative flex justify-center border-b border-slate-800">
                {issue.photoUrls ? (
                  <img 
                    src={`http://localhost:8080${issue.photoUrls}`} 
                    alt={issue.title}
                    className="h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
                    No Photo Evidence Provided
                  </div>
                )}
              </div>

              {/* Detail Info */}
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20">
                      {issue.category.name}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border bg-slate-900`}>
                      {issue.status}
                    </span>
                  </div>
                  
                  <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                    {issue.title}
                  </h1>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4 text-slate-500" /> Filed by: {issue.user.fullName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-slate-500" /> {new Date(issue.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Description</h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {issue.description}
                  </p>
                </div>

                {/* Location details */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-emerald-400" /> Mapping & Location Details
                  </h4>
                  {issue.addressText && (
                    <div className="text-sm font-semibold text-slate-200">
                      {issue.addressText}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-600 font-mono">
                    Latitude: {issue.latitude.toFixed(6)}, Longitude: {issue.longitude.toFixed(6)}
                  </div>
                </div>

                {/* Resolution panel */}
                {(issue.status === 'RESOLVED' || issue.status === 'MARKED_FAKE') && (
                  <div className={`p-4 border rounded-xl space-y-2 ${issue.status === 'RESOLVED' ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200' : 'bg-rose-500/5 border-rose-500/20 text-slate-200'}`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                      {issue.status === 'RESOLVED' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-400" /> Resolution Log Notes
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-rose-400" /> Municipal Audit Audit Notes
                        </>
                      )}
                    </h4>
                    <p className="text-sm italic">
                      "{issue.resolutionNotes || "No resolution details logged."}"
                    </p>
                    {issue.resolvedAt && (
                      <div className="text-[10px] text-slate-500">
                        Resolved on: {new Date(issue.resolvedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <h3 className="text-base font-extrabold flex items-center gap-1.5 border-b border-slate-800 pb-3">
                <MessageSquare className="h-5 w-5 text-emerald-400" /> Discussion Panel ({comments.length})
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {comments.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1">
                          {c.user.fullName}
                          <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${c.user.role === 'MUNICIPAL_ADMIN' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                            {c.user.role}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString([], { dateStyle: 'short' })} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-2 items-end pt-3 border-t border-slate-800">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Post a response or verification update..."
                      className="bg-slate-950 border border-slate-850 text-white rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 outline-none text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 p-3 rounded-lg transition"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              ) : (
                <div className="bg-slate-950 text-center py-4 rounded-xl border border-slate-850 text-sm text-slate-400">
                  Please <Link to="/login" className="text-emerald-400 font-bold hover:underline">sign in</Link> to post comments.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Actions Sidebar & Admin verification box */}
          <div className="space-y-6">
            
            {/* Citizen Actions card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-center">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                Citizen Validation
              </h3>
              
              <div className="space-y-2">
                <div className="text-4xl font-extrabold text-white">
                  {issue.meTooCount}
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  "Me Too" upvotes registered. Open issues automatically escalate to authorities upon reaching 6 votes.
                </p>
              </div>

              {user && user.role === 'CITIZEN' && user.id !== issue.user.id && issue.status === 'OPEN' && (
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className="w-full flex justify-center items-center gap-1.5 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {voting ? 'Casting Vote...' : 'Me Too! (I see this too)'}
                </button>
              )}
            </div>

            {/* Municipal Admin Controls */}
            {showAdminControls && (
              <div className="bg-slate-900 border border-amber-500/25 p-6 rounded-2xl shadow-xl space-y-4 bg-amber-500/5">
                <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1 border-b border-amber-500/20 pb-2.5">
                  <ShieldCheck className="h-4 w-4" /> Administrative Controls
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Action Log Notes</label>
                    <textarea
                      required
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detail resolution steps or verification audit notes here..."
                      className="bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 outline-none text-xs resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleAdminAction('resolve')}
                      disabled={loading}
                      className="py-2.5 px-3 bg-emerald-500 text-slate-900 font-bold rounded-lg text-xs hover:bg-emerald-400 transition"
                    >
                      Resolve Issue
                    </button>
                    <button
                      onClick={() => handleAdminAction('mark-fake')}
                      disabled={loading}
                      className="py-2.5 px-3 bg-rose-600 text-white font-bold rounded-lg text-xs hover:bg-rose-500 transition"
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
