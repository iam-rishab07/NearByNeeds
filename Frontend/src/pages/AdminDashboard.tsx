import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface Issue {
  id: number;
  title: string;
  category: { name: string };
  latitude: number;
  longitude: number;
  status: 'OPEN' | 'ESCALATED' | 'IN_PROGRESS' | 'RESOLVED' | 'MARKED_FAKE';
  meTooCount: number;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ESCALATED' | 'IN_PROGRESS' | 'ALL'>('ESCALATED');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'MUNICIPAL_ADMIN' && user.role !== 'SUPER_ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const loadAdminIssues = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 0,
        size: 50,
      };
      
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      
      const response = await api.get('/admin/issues', { params });
      setIssues(response.data.content || response.data);
    } catch (err) {
      console.error("Failed to load admin issues", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAdminIssues();
    }
  }, [statusFilter, user]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] text-[#111111] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="bg-glow top-0 left-0"></div>
      <div className="bg-glow bottom-0 right-0"></div>
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 premium-card p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold flex items-center gap-2 text-[#111111]">
              <ShieldCheck className="h-7 w-7 text-[#FFD21F]" /> Municipal Verification Dashboard
            </h1>
            <p className="text-[#666666] text-sm">
              Jurisdiction: <strong className="text-[#111111]">Your City Municipal Corporation</strong>
            </p>
          </div>
          
          <button
            onClick={loadAdminIssues}
            className="p-3 bg-white border border-[#E8E8E8] hover:border-[#FFD21F]/50 rounded-xl transition shadow-sm hover:text-[#FFD21F]"
            title="Refresh feed"
          >
            <RefreshCw className="h-5 w-5 text-[#666666] hover:text-[#FFD21F] transition-colors" />
          </button>
        </div>

        {/* Info stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-6 space-y-2 transition-all hover:-translate-y-1 hover:border-[#FFD21F]/50">
            <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">Review Pipeline</span>
            <div className="text-4xl font-extrabold text-[#FFD21F]">
              {issues.filter(i => i.status === 'ESCALATED').length}
            </div>
            <p className="text-[11px] text-[#666666] font-medium">Escalated issues requiring audit</p>
          </div>

          <div className="premium-card p-6 space-y-2 transition-all hover:-translate-y-1 hover:border-indigo-400">
            <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">In Progress Wards</span>
            <div className="text-4xl font-extrabold text-indigo-500">
              {issues.filter(i => i.status === 'IN_PROGRESS').length}
            </div>
            <p className="text-[11px] text-[#666666] font-medium">Scheduled repairs and maintenance</p>
          </div>

          <div className="premium-card p-6 space-y-2 transition-all hover:-translate-y-1 hover:border-[#111111]/30">
            <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">Total Ward Feed</span>
            <div className="text-4xl font-extrabold text-[#111111]">
              {issues.length}
            </div>
            <p className="text-[11px] text-[#666666] font-medium">Total reports currently active</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-[#E8E8E8] gap-6 text-sm font-semibold">
          <button
            onClick={() => setStatusFilter('ESCALATED')}
            className={`pb-3 px-1 border-b-2 transition ${statusFilter === 'ESCALATED' ? 'border-[#FFD21F] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'}`}
          >
            Escalated (Waiting Review)
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`pb-3 px-1 border-b-2 transition ${statusFilter === 'IN_PROGRESS' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-[#666666] hover:text-[#111111]'}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`pb-3 px-1 border-b-2 transition ${statusFilter === 'ALL' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'}`}
          >
            All Ward Reports
          </button>
        </div>

        {/* Issues list */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FFD21F]"></div>
          </div>
        ) : issues.length === 0 ? (
          <div className="premium-card p-12 text-center">
            <AlertCircle className="h-10 w-10 text-[#666666] mx-auto mb-3" />
            <p className="text-[#666666] text-base font-medium">No ward issues found in this category.</p>
          </div>
        ) : (
          <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#FAFAF8] text-[#666666] uppercase text-xs font-bold border-b border-[#E8E8E8]">
                  <tr>
                    <th className="px-6 py-5">Title</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Votes</th>
                    <th className="px-6 py-5">Reported On</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {issues.map(i => (
                    <tr key={i.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#111111] max-w-xs truncate">
                        <Link to={`/issue/${i.id}`} className="hover:text-[#FFD21F] transition-colors">{i.title}</Link>
                      </td>
                      <td className="px-6 py-4 text-[#666666] font-medium">
                        {i.category.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${
                          i.status === 'ESCALATED' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          i.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                          i.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          i.status === 'MARKED_FAKE' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                          'bg-sky-50 text-sky-600 border-sky-200'
                        }`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#666666] font-mono font-medium">
                        {i.meTooCount}
                      </td>
                      <td className="px-6 py-4 text-[#666666] font-medium">
                        {new Date(i.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/issue/${i.id}`}
                          className="bg-white hover:bg-[#FFD21F] hover:text-[#111111] text-[#666666] hover:border-[#FFD21F] px-4 py-2 rounded-xl text-xs font-bold transition-all border border-[#E8E8E8] shadow-sm"
                        >
                          Audit Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
