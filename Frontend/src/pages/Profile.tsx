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
      case 'OPEN': return 'bg-sky-50 text-sky-600 border-sky-200';
      case 'ESCALATED': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'IN_PROGRESS': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'MARKED_FAKE': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] text-[#111111] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="bg-glow top-0 left-0"></div>
      <div className="bg-glow bottom-0 right-0"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Profile Card & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Details Sidebar */}
          <div className="premium-card p-8 space-y-6 self-start">
            <div className="text-center space-y-3">
              <div className="inline-block bg-[#FAFAF8] p-5 rounded-full border border-[#E8E8E8] shadow-sm">
                <User className="h-16 w-16 text-[#FFD21F]" />
              </div>
              <div>
                <h2 className="font-extrabold text-xl text-[#111111]">{user?.fullName}</h2>
                <p className="text-xs text-[#666666] mt-1 font-medium">{user?.email}</p>
              </div>
              <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${user?.accountStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {user?.accountStatus}
              </span>
            </div>

            <div className="space-y-4 border-t border-[#E8E8E8] pt-6 text-sm">
              <div className="flex justify-between items-center bg-[#FAFAF8] p-3 rounded-xl border border-[#E8E8E8]">
                <span className="text-[#666666] font-bold text-xs uppercase tracking-wider">Phone</span>
                <span className="text-[#111111] font-bold">{user?.phone || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center bg-[#FAFAF8] p-3 rounded-xl border border-[#E8E8E8]">
                <span className="text-[#666666] font-bold text-xs uppercase tracking-wider">Role</span>
                <span className="text-[#111111] font-mono text-xs font-bold">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center bg-[#FAFAF8] p-3 rounded-xl border border-[#E8E8E8]">
                <span className="text-[#666666] font-bold text-xs uppercase tracking-wider">Points Balance</span>
                <span className="text-[#FFD21F] font-extrabold font-mono text-base">{user?.rewardPoints} pts</span>
              </div>
              <div className="flex justify-between items-center bg-[#FAFAF8] p-3 rounded-xl border border-[#E8E8E8]">
                <span className="text-[#666666] font-bold text-xs uppercase tracking-wider">Fake Reports</span>
                <span className={`font-bold font-mono ${user && user.fakeReportCount > 0 ? 'text-red-500' : 'text-[#111111]'}`}>
                  {user?.fakeReportCount}
                </span>
              </div>
              {user?.accountStatus === 'SUSPENDED' && user.suspensionUntil && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center font-bold shadow-sm">
                  Suspension active until: <br/> {new Date(user.suspensionUntil).toLocaleString()}
                </div>
              )}
            </div>

            {/* Admin Seeding actions */}
            {user && user.role === 'SUPER_ADMIN' && (
              <div className="border-t border-[#E8E8E8] pt-6 space-y-4">
                <h4 className="text-xs font-bold text-[#666666] uppercase tracking-wider">Developer Diagnostics</h4>
                <button
                  onClick={handleSeedDatabase}
                  disabled={seeding}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-red-200 hover:border-red-300 bg-red-50 text-red-600 rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  <Settings className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
                  {seeding ? 'Seeding Tables...' : 'Seed Master DB Data'}
                </button>
                <p className="text-[11px] text-[#666666] leading-relaxed text-center font-semibold">
                  Clear all database tables and populate categories, wards, rewards catalog, and default test roles.
                </p>
              </div>
            )}
          </div>

          {/* User Reports list & Penalty board */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* My reported issues */}
            <div className="premium-card p-8 space-y-5">
              <h3 className="text-lg font-extrabold flex items-center gap-2 border-b border-[#E8E8E8] pb-4 text-[#111111]">
                <FileText className="h-5 w-5 text-[#FFD21F]" /> My Reported Issues ({myIssues.length})
              </h3>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FFD21F]"></div>
                </div>
              ) : myIssues.length === 0 ? (
                <div className="p-8 text-center text-[#666666] text-sm font-bold bg-[#FAFAF8] rounded-xl border border-[#E8E8E8]">
                  You haven't reported any civic issues yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {myIssues.map(issue => (
                    <div key={issue.id} className="p-4 flex justify-between items-center bg-[#FAFAF8] hover:bg-[#F5F5F2] transition-colors rounded-xl border border-[#E8E8E8]">
                      <div className="space-y-1.5">
                        <Link to={`/issue/${issue.id}`} className="font-bold text-sm text-[#111111] hover:text-[#FFD21F] transition-colors leading-tight block">
                          {issue.title}
                        </Link>
                        <div className="text-[11px] text-[#666666] font-semibold">
                          Reported on: {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Penalties Incurred card */}
            <div className="premium-card p-8 space-y-5">
              <h3 className="text-lg font-extrabold flex items-center gap-2 border-b border-[#E8E8E8] pb-4 text-red-500">
                <ShieldAlert className="h-5 w-5 text-red-500" /> Fines & Penalty Log ({penalties.length})
              </h3>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                </div>
              ) : penalties.length === 0 ? (
                <div className="p-8 text-center text-[#666666] text-sm flex flex-col justify-center items-center gap-2 bg-[#FAFAF8] rounded-xl border border-[#E8E8E8]">
                  <Heart className="h-10 w-10 text-[#FFD21F] mb-1" />
                  <span className="text-[#111111] font-extrabold text-base">Good Citizen Record</span>
                  <span className="font-semibold text-[#666666] max-w-sm">No violations or fake report penalties. Thank you for reporting genuine issues!</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {penalties.map(p => (
                    <div key={p.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-red-50 hover:bg-red-100 transition-colors border border-red-100 rounded-xl">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-extrabold text-red-700">
                          Offense #{p.offenseNumber}: Reported fake issue
                        </h4>
                        <p className="text-xs text-red-600/80 italic font-medium">
                          Target: "{p.issue.title}"
                        </p>
                        <div className="text-[11px] text-red-500 font-semibold">
                          Date: {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-left sm:text-right space-y-2 w-full sm:w-auto">
                        <div className="text-sm font-extrabold text-red-700 font-mono bg-white px-3 py-1.5 rounded-lg border border-red-200 inline-block sm:block text-center sm:text-right shadow-sm">
                          ₹{p.fineAmount} Fine
                        </div>
                        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                          {p.suspensionDays && (
                             <div className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-bold uppercase shadow-sm">
                              {p.suspensionDays} Days Suspended
                            </div>
                          )}
                          {p.isPermanentBan && (
                            <div className="text-[10px] text-red-600 bg-red-100 px-2.5 py-1 rounded-md border border-red-200 font-bold uppercase shadow-sm">
                              Banned
                            </div>
                          )}
                        </div>
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
