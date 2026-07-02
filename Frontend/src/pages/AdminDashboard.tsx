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
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-amber-500/20 p-6 rounded-2xl shadow-xl bg-amber-500/5">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-amber-400" /> Municipal Verification Dashboard
            </h1>
            <p className="text-slate-400 text-sm">
              Jurisdiction: <strong>Pune Municipal Corporation (PMC)</strong>
            </p>
          </div>
          
          <button
            onClick={loadAdminIssues}
            className="p-2 border border-slate-700 hover:border-slate-600 rounded-lg transition"
            title="Refresh feed"
          >
            <RefreshCw className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Info stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Pipeline</span>
            <div className="text-3xl font-extrabold text-amber-400">
              {issues.filter(i => i.status === 'ESCALATED').length}
            </div>
            <p className="text-[11px] text-slate-500">Escalated issues requiring audit</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress Wards</span>
            <div className="text-3xl font-extrabold text-indigo-400">
              {issues.filter(i => i.status === 'IN_PROGRESS').length}
            </div>
            <p className="text-[11px] text-slate-500">Scheduled repairs and maintenance</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ward Feed</span>
            <div className="text-3xl font-extrabold text-white">
              {issues.length}
            </div>
            <p className="text-[11px] text-slate-500">Total reports currently active</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-slate-850 gap-4 text-sm font-semibold">
          <button
            onClick={() => setStatusFilter('ESCALATED')}
            className={`pb-3 px-1 border-b-2 transition ${statusFilter === 'ESCALATED' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Escalated (Waiting Review)
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`pb-3 px-1 border-b-2 transition ${statusFilter === 'IN_PROGRESS' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`pb-3 px-1 border-b-2 transition ${statusFilter === 'ALL' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            All Ward Reports
          </button>
        </div>

        {/* Issues list */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-400"></div>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-slate-900 border border-slate-850 p-12 text-center rounded-2xl">
            <AlertCircle className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-base">No ward issues found in this category.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Votes</th>
                  <th className="px-6 py-4">Reported On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {issues.map(i => (
                  <tr key={i.id} className="hover:bg-slate-850/30 transition">
                    <td className="px-6 py-4 font-bold text-white max-w-xs truncate">
                      <Link to={`/issue/${i.id}`} className="hover:text-emerald-400 transition">{i.title}</Link>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {i.category.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                        i.status === 'ESCALATED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        i.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        i.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        i.status === 'MARKED_FAKE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {i.meTooCount}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(i.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/issue/${i.id}`}
                        className="bg-slate-800 hover:bg-emerald-400 hover:text-slate-900 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-slate-750"
                      >
                        Audit Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
