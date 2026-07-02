import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, ShieldAlert, FileText, Settings, Heart } from 'lucide-react';

interface Penalty {
  id: number;
  offenseNumber: number;
  fineAmount: number;
  suspensionDays?: number;
  isPermanentBan: boolean;
  paymentStatus: 'PENDING' | 'PAID' | 'WAIVED';
  createdAt: string;
  issue: { id: number; title: string };
}

interface Issue {
  id: number;
  title: string;
  status: string;
  meTooCount: number;
  createdAt: string;
}

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProfileData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const penRes = await api.get('/users/me/penalties');
      setPenalties(penRes.data);

      const issueRes = await api.get('/users/me/issues');
      setMyIssues(issueRes.data.content || issueRes.data);
    } catch (err) {
      console.error("Failed to load user profile metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleSeedDatabase = async () => {
    if (!window.confirm("This will clear all tables and re-seed default categories, wards, and demo user accounts. Do you want to proceed?")) {
      return;
    }
    setSeeding(true);
    try {
      const response = await api.post('/seed');
      alert(response.data.message || "Database seeded successfully!");
      logout();
      navigate('/login');
    } catch (err: any) {
      alert("Failed to seed database: " + (err.response?.data?.error || err.message));
    } finally {
      setSeeding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'ESCALATED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'IN_PROGRESS': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'MARKED_FAKE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Card & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Details Sidebar */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-block bg-slate-950 p-4 rounded-full border border-slate-800">
                <User className="h-16 w-16 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-extrabold text-xl">{user?.fullName}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              </div>
              <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${user?.accountStatus === 'ACTIVE' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/5 text-rose-400 border-rose-500/20'}`}>
                {user?.accountStatus}
              </span>
            </div>

            <div className="space-y-4 border-t border-slate-850 pt-5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Phone</span>
                <span className="text-slate-200">{user?.phone || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Role</span>
                <span className="text-slate-200 font-mono text-xs">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Points Balance</span>
                <span className="text-emerald-400 font-extrabold font-mono">{user?.rewardPoints} pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Fake Reports</span>
                <span className={`font-bold font-mono ${user && user.fakeReportCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {user?.fakeReportCount}
                </span>
              </div>
              {user?.accountStatus === 'SUSPENDED' && user.suspensionUntil && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg text-center font-semibold">
                  Suspension active until: <br/> {new Date(user.suspensionUntil).toLocaleString()}
                </div>
              )}
            </div>

            {/* Admin Seeding actions */}
            {user && user.role === 'SUPER_ADMIN' && (
              <div className="border-t border-slate-850 pt-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Developer Diagnostics</h4>
                <button
                  onClick={handleSeedDatabase}
                  disabled={seeding}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-800 hover:border-amber-500/20 bg-slate-950 text-slate-400 hover:text-amber-400 rounded-xl text-xs font-bold transition"
                >
                  <Settings className="h-4 w-4 animate-spin" />
                  {seeding ? 'Seeding Tables...' : 'Seed Master DB Data'}
                </button>
                <p className="text-[10px] text-slate-500 leading-normal text-center">
                  Clear all database tables and populate categories, wards, rewards catalog, and default test roles.
                </p>
              </div>
            )}
          </div>

          {/* User Reports list & Penalty board */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* My reported issues */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-base font-extrabold flex items-center gap-1.5 border-b border-slate-850 pb-3">
                <FileText className="h-5 w-5 text-emerald-400" /> My Reported Issues ({myIssues.length})
              </h3>

              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-400"></div>
                </div>
              ) : myIssues.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  You haven't reported any civic issues yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-850 max-h-80 overflow-y-auto pr-2">
                  {myIssues.map(issue => (
                    <div key={issue.id} className="py-3.5 flex justify-between items-center hover:bg-slate-850/10 transition px-2 rounded-lg">
                      <div className="space-y-1">
                        <Link to={`/issue/${issue.id}`} className="font-bold text-sm text-slate-200 hover:text-emerald-400 transition">
                          {issue.title}
                        </Link>
                        <div className="text-[10px] text-slate-500">
                          Reported on: {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Penalties Incurred card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-base font-extrabold flex items-center gap-1.5 border-b border-slate-850 pb-3 text-rose-400">
                <ShieldAlert className="h-5 w-5" /> Fines & Penalty Log ({penalties.length})
              </h3>

              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-rose-400"></div>
                </div>
              ) : penalties.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm flex flex-col justify-center items-center gap-1">
                  <Heart className="h-8 w-8 text-emerald-400 mb-1" />
                  <span className="text-emerald-400 font-bold">Good Citizen Record</span>
                  <span>No violations or fake report penalties. Thank you for reporting genuine issues!</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-850">
                  {penalties.map(p => (
                    <div key={p.id} className="py-4 flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-200">
                          Offense #{p.offenseNumber}: Reported fake issue
                        </h4>
                        <p className="text-xs text-slate-400 italic">
                          Target: "{p.issue.title}"
                        </p>
                        <div className="text-[10px] text-slate-500">
                          Date: {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right space-y-1.5">
                        <div className="text-sm font-extrabold text-rose-400 font-mono">
                          ₹{p.fineAmount} Fine
                        </div>
                        {p.suspensionDays && (
                          <div className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase inline-block">
                            {p.suspensionDays} Days Suspended
                          </div>
                        )}
                        {p.isPermanentBan && (
                          <div className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-bold uppercase inline-block">
                            Banned
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
