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
      case 'OPEN': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'ESCALATED': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'IN_PROGRESS': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'MARKED_FAKE': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'REJECTED': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] text-[#111111] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="bg-glow top-0 left-0"></div>
      <div className="bg-glow bottom-0 right-0"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Landing Page Hero Section (Only shown to guests) */}
        {!user && (
          <div className="relative premium-card overflow-hidden rounded-[32px] mb-12 border-0 bg-[#FAFAF8] shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAF8] via-[#F5F5F2] to-[#FFD21F]/10 z-0"></div>
            
            {/* Floating ambient shapes */}
            <div className="absolute top-10 right-20 w-64 h-64 bg-[#FFD21F]/20 rounded-full blur-[80px] animate-pulse-glow z-0"></div>
            <div className="absolute bottom-10 left-20 w-80 h-80 bg-amber-200/20 rounded-full blur-[100px] animate-pulse-glow delay-200 z-0"></div>

            <div className="relative z-10 px-8 py-24 sm:px-16 lg:px-24 flex flex-col items-center text-center space-y-8 animate-fade-in-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-[#E8E8E8] text-[#666666] text-xs font-bold uppercase tracking-widest shadow-sm animate-float">
                Smart City, Better City
              </span>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#111111] tracking-tight leading-tight max-w-4xl">
                Let's make <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD21F] to-amber-500">Your City</span> better, together.
              </h1>
              
              <p className="text-lg md:text-xl text-[#666666] max-w-2xl font-medium leading-relaxed">
                Report issues, vote, and track real change in your community. Join thousands of active citizens transforming their neighborhoods.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/login" className="btn-primary px-8 py-4 text-base shadow-[0_8px_30px_rgba(255,210,31,0.3)]">
                  Report an Issue →
                </Link>
                <Link to="/register" className="btn-secondary px-8 py-4 text-base bg-white">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 premium-card p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">
              Civic Issue Feed
            </h1>
            <p className="text-sm text-[#666666]">
              Browse issues reported in your area, vote "Me Too" to validate, and track escalations.
            </p>
          </div>
          {user && user.role === 'CITIZEN' && (
            <Link 
              to="/post-issue"
              className="flex items-center justify-center gap-2 btn-primary px-6 py-3 shadow-[0_4px_14px_rgba(255,210,31,0.25)]"
            >
              <Plus className="h-5 w-5" /> Report Civic Issue
            </Link>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="premium-card p-5 space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="premium-input block w-full pl-11 p-3 text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="premium-input block w-full p-3 text-sm appearance-none"
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
              className="premium-input block w-full p-3 text-sm appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ESCALATED">Escalated</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="MARKED_FAKE">Marked Fake</option>
            </select>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#E8E8E8] text-xs text-[#666666]">
            <div className="font-semibold">
              Showing {issues.length} issues
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3 w-3" />
              <span>Sort by:</span>
              <button 
                onClick={() => setSortBy('createdAt')}
                className={`font-bold transition ${sortBy === 'createdAt' ? 'text-[#111111]' : 'hover:text-[#111111]'}`}
              >
                Recent
              </button>
              <span className="text-[#E8E8E8]">|</span>
              <button 
                onClick={() => setSortBy('meTooCount')}
                className={`font-bold transition ${sortBy === 'meTooCount' ? 'text-[#111111]' : 'hover:text-[#111111]'}`}
              >
                Most Upvoted
              </button>
            </div>
          </div>
        </div>

        {/* Issue Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD21F]"></div>
          </div>
        ) : issues.length === 0 ? (
          <div className="premium-card p-12 text-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <p className="text-[#111111] font-bold text-lg">No reported civic issues found matching your filters.</p>
            <p className="text-[#666666] text-sm mt-1">Be the first to file a report in your area!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {issues.map((issue, index) => (
              <div 
                key={issue.id}
                className="premium-card overflow-hidden flex flex-col group border border-[#E8E8E8] hover:border-[#FFD21F]/50 animate-fade-in-up"
                style={{ animationDelay: `${(index % 9) * 100 + 150}ms` }}
              >
                {/* Photo cover */}
                <div className="h-48 w-full bg-[#F5F5F2] relative overflow-hidden">
                  {issue.photoUrls ? (
                    <img 
                      src={`http://localhost:8080${issue.photoUrls}`} 
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#666666] bg-[#F5F5F2] font-semibold text-sm">
                      No Photo Available
                    </div>
                  )}
                  {/* Category badge */}
                  <span className="absolute top-4 left-4 text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[#111111] border border-[#E8E8E8] shadow-sm">
                    {issue.category.name}
                  </span>
                  
                  {/* Status badge */}
                  <span className={`absolute top-4 right-4 text-[9px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full border shadow-sm ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-lg text-[#111111] group-hover:text-[#FFD21F] transition-colors leading-snug">
                      <Link to={`/issue/${issue.id}`}>{issue.title}</Link>
                    </h3>
                    <p className="text-[#666666] text-sm line-clamp-3 leading-relaxed font-medium">
                      {issue.description}
                    </p>
                  </div>

                  {/* Ward / Location info */}
                  <div className="space-y-2 text-xs text-[#666666] border-t border-[#E8E8E8] pt-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#FFD21F] shrink-0" />
                      <span className="truncate font-semibold text-[#111111]">Location Details</span>
                    </div>
                    {issue.addressText && (
                      <div className="text-[11px] text-[#666666] pl-6 truncate font-medium">
                        {issue.addressText}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 pl-6 text-[10px] text-[#666666] font-mono">
                      LAT: {issue.latitude.toFixed(5)}, LNG: {issue.longitude.toFixed(5)}
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#E8E8E8] text-xs">
                    <div className="flex items-center gap-1.5 bg-[#F5F5F2] px-2.5 py-1.5 rounded-lg border border-[#E8E8E8]">
                      <Calendar className="h-3.5 w-3.5 text-[#666666]" />
                      <span className="text-[#111111] font-bold">
                        {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {user && user.role === 'CITIZEN' && user.id !== issue.user.id && issue.status === 'OPEN' ? (
                        <button
                          onClick={(e) => handleVote(issue.id, e)}
                          disabled={votingMap[issue.id]}
                          className="flex items-center gap-1.5 bg-white hover:bg-[#F5F5F2] border border-[#E8E8E8] px-3 py-1.5 rounded-lg text-xs font-bold transition text-[#666666] hover:text-[#111111] shadow-sm disabled:opacity-50"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Me Too ({issue.meTooCount})</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#666666] px-2.5 py-1.5 rounded-lg bg-[#FAFAF8] border border-[#E8E8E8] text-xs font-bold shadow-sm">
                          <ThumbsUp className="h-3.5 w-3.5 text-[#FFD21F]" />
                          <span>Votes: {issue.meTooCount}</span>
                        </div>
                      )}
                      <Link 
                        to={`/issue/${issue.id}`}
                        className="bg-white hover:bg-[#FFD21F] hover:text-[#111111] hover:border-[#FFD21F] p-1.5 rounded-lg border border-[#E8E8E8] transition text-[#666666] shadow-sm"
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
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-[#E8E8E8]">
            <button
              disabled={page === 0}
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              className="btn-secondary px-5 py-2.5 text-sm disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-[#666666] font-mono bg-white border border-[#E8E8E8] px-3 py-1.5 rounded-md font-bold shadow-sm">Page {page + 1} of {totalPages}</span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(prev => prev + 1)}
              className="btn-secondary px-5 py-2.5 text-sm disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
