import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, User as UserIcon, LogOut, Award, ShieldAlert, Layers } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const Navbar: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      refreshUser();
    } catch (error) {
      console.error("Error marking notification read", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Layers className="h-8 w-8 text-emerald-400 animate-pulse" />
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                NearByNeeds
              </span>
            </Link>
            <div className="hidden md:block ml-10 flex items-baseline space-x-4">
              <Link to="/" className="hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              {user && user.role === 'CITIZEN' && (
                <Link to="/rewards" className="hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <Award className="h-4 w-4 text-amber-400" /> Rewards Shop
                </Link>
              )}
              {user && (user.role === 'MUNICIPAL_ADMIN' || user.role === 'SUPER_ADMIN') && (
                <Link to="/admin" className="hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 text-amber-400 border border-amber-500/30 bg-amber-500/5">
                  <ShieldAlert className="h-4 w-4" /> Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Points Badge */}
                {user.role === 'CITIZEN' && (
                  <div className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    {user.rewardPoints} points
                  </div>
                )}

                {/* User Role Badge */}
                <div className="hidden sm:block text-xs bg-slate-800 px-2.5 py-1 rounded-md text-slate-400 border border-slate-700 font-mono">
                  {user.role}
                </div>

                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none relative"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-2xl bg-slate-800 border border-slate-700 ring-1 ring-black ring-opacity-5 py-1 text-slate-100 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-slate-700 font-bold text-sm flex justify-between items-center">
                        <span>Notifications</span>
                        <span className="text-xs text-slate-400">{unreadCount} unread</span>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-slate-400 text-sm">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`px-4 py-3 hover:bg-slate-700 transition cursor-pointer border-b border-slate-700/50 flex flex-col gap-1 ${!n.isRead ? 'bg-slate-700/30 border-l-2 border-emerald-400' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${n.type === 'PENALTY' ? 'bg-rose-500/10 text-rose-400' : n.type === 'RESOLUTION' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-300'}`}>
                                {n.type}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-200">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Profile icon */}
                <Link to="/profile" className="flex items-center space-x-1 hover:text-emerald-300">
                  <div className="bg-slate-800 p-1.5 rounded-full border border-slate-700">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{user.fullName}</span>
                </Link>

                {/* Logout */}
                <button 
                  onClick={handleLogout}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium hover:text-emerald-400 px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-medium bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2 rounded-md transition text-slate-900 font-bold">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
