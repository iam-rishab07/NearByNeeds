import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, MapPin, ThumbsUp, MessageSquare, Calendar, Filter, ArrowUpDown } from 'lucide-react';

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
}

interface Category {
  id: number;
  name: string;
}



export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filtering & Paging state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'meTooCount'>('createdAt');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [votingMap, setVotingMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Load categories and wards
    const loadMasterData = async () => {
      try {
        await api.get('/rewards/catalog'); // Catalog or seed holds categories.
        
        
        // Load default categories list
        const categoriesList = [
          { id: 1, name: 'Garbage' },
          { id: 2, name: 'Pothole' },
          { id: 3, name: 'Streetlight' },
          { id: 4, name: 'Water Leakage' },
          { id: 5, name: 'Illegal Construction' },
          { id: 6, name: 'Other' }
        ];
        setCategories(categoriesList);
      } catch (err) {
        console.error("Failed to load filters", err);
      }
    };
    loadMasterData();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        size: 9,
      };

      if (selectedStatus) params.status = selectedStatus;
      if (selectedCategory) params.category_id = selectedCategory;
      
      const response = await api.get('/issues', { params });
      
      let items = response.data.content || response.data;
      
      // Sort issues locally for rich experience
      if (sortBy === 'meTooCount') {
        items.sort((a: Issue, b: Issue) => b.meTooCount - a.meTooCount);
      } else {
        items.sort((a: Issue, b: Issue) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      // Local search filtering
      if (search) {
        items = items.filter((i: Issue) => 
          i.title.toLowerCase().includes(search.toLowerCase()) || 
          i.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      setIssues(items);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch issues", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [page, selectedCategory, selectedStatus, sortBy, search]);

  const handleVote = async (issueId: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Prevent double clicking
    if (votingMap[issueId]) return;
    setVotingMap(prev => ({ ...prev, [issueId]: true }));

    try {
      const response = await api.post(`/issues/${issueId}/me-too`);
      // Update local issue count
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, meTooCount: response.data.meTooCount, status: response.data.status } : issue
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to register Me Too vote.");
    } finally {
      setVotingMap(prev => ({ ...prev, [issueId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'ESCALATED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'IN_PROGRESS': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'MARKED_FAKE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'REJECTED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Civic Issue Feed
            </h1>
            <p className="text-sm text-slate-400">
              Browse issues reported in Pune municipal corporation wards, vote "Me Too" to validate, and track escalations.
            </p>
          </div>
          {user && user.role === 'CITIZEN' && (
            <Link 
              to="/post-issue"
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-500/10"
            >
              <Plus className="h-5 w-5" /> Report Civic Issue
            </Link>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5 outline-none text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-lg block w-full p-2.5 outline-none text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>



            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-lg block w-full p-2.5 outline-none text-sm"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ESCALATED">Escalated</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="MARKED_FAKE">Marked Fake</option>
            </select>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            <div>
              Showing {issues.length} issues
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3 w-3" />
              <span>Sort by:</span>
              <button 
                onClick={() => setSortBy('createdAt')}
                className={`font-semibold hover:text-white transition ${sortBy === 'createdAt' ? 'text-emerald-400' : ''}`}
              >
                Recent
              </button>
              <span className="text-slate-700">|</span>
              <button 
                onClick={() => setSortBy('meTooCount')}
                className={`font-semibold hover:text-white transition ${sortBy === 'meTooCount' ? 'text-emerald-400' : ''}`}
              >
                Most Upvoted
              </button>
            </div>
          </div>
        </div>

        {/* Issue Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-slate-900 border border-slate-850 p-12 text-center rounded-2xl">
            <p className="text-slate-400 text-lg">No reported civic issues found matching your filters.</p>
            <p className="text-slate-500 text-sm mt-1">Be the first to file a report in your ward!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {issues.map(issue => (
              <div 
                key={issue.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition duration-200 flex flex-col group"
              >
                {/* Photo cover */}
                <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
                  {issue.photoUrls ? (
                    <img 
                      src={`http://localhost:8080${issue.photoUrls}`} 
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
                      No Photo Available
                    </div>
                  )}
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-900/80 backdrop-blur text-emerald-400 border border-emerald-500/20">
                    {issue.category.name}
                  </span>
                  
                  {/* Status badge */}
                  <span className={`absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition leading-snug">
                      <Link to={`/issue/${issue.id}`}>{issue.title}</Link>
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {/* Ward / Location info */}
                  <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-850 pt-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Pune City Jurisdiction</span>
                    </div>
                    {issue.addressText && (
                      <div className="text-[11px] text-slate-500 pl-5 truncate">
                        {issue.addressText}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 pl-5 text-[10px] text-slate-600 font-mono">
                      LAT: {issue.latitude.toFixed(5)}, LNG: {issue.longitude.toFixed(5)}
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-850 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-500">
                        {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {user && user.role === 'CITIZEN' && user.id !== issue.user.id && issue.status === 'OPEN' ? (
                        <button
                          onClick={(e) => handleVote(issue.id, e)}
                          disabled={votingMap[issue.id]}
                          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-750 px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-200 hover:text-emerald-400"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Me Too ({issue.meTooCount})</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500 px-2 py-1 rounded bg-slate-950 text-xs">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Votes: {issue.meTooCount}</span>
                        </div>
                      )}
                      <Link 
                        to={`/issue/${issue.id}`}
                        className="bg-slate-800 hover:bg-emerald-400 hover:text-slate-900 p-1.5 rounded-lg border border-slate-750 transition text-slate-400"
                        title="View details & comments"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paging controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-900">
            <button
              disabled={page === 0}
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg text-sm transition disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 font-mono">Page {page + 1} of {totalPages}</span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(prev => prev + 1)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg text-sm transition disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
