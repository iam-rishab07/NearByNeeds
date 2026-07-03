import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, User as UserIcon, LogOut, Award, ShieldAlert } from 'lucide-react';
import gvLogo from '../assets/gv-logo.jpg';

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
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#E8E8E8]">
      <div className="max-w-[90rem] mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-[12px] shrink-0 whitespace-nowrap group overflow-hidden">
              <img src={gvLogo} alt="GV Logo" className="h-[28px] md:h-[32px] lg:h-[36px] max-h-[40px] w-auto object-contain overflow-hidden transition-transform group-hover:scale-105" />
              <span className="font-heading font-bold text-[1.6rem] tracking-tight text-[#111111]" style={{ letterSpacing: '-0.5px' }}>
                GeoVoice
              </span>
            </Link>
            <div className="hidden lg:flex ml-8 items-baseline space-x-2">
              <Link to="/" className="text-[#666666] hover:text-[#111111] hover:bg-[#F5F5F2] transition-colors px-3 py-2 rounded-lg text-sm font-semibold">Dashboard</Link>
              {user && user.role === 'CITIZEN' && (
                <Link to="/rewards" className="text-[#666666] hover:text-[#111111] hover:bg-[#F5F5F2] transition-colors px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#FFD21F]" /> Rewards
                </Link>
              )}
              {user && (user.role === 'MUNICIPAL_ADMIN' || user.role === 'SUPER_ADMIN') && (
                <Link to="/admin" className="text-[#111111] hover:bg-[#FFD21F]/10 transition-colors px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 bg-[#FFD21F]/5 border border-[#FFD21F]/20">
                  <ShieldAlert className="h-4 w-4 text-[#FFD21F]" /> Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* User Points Badge */}
                {user.role === 'CITIZEN' && (
                  <div className="bg-[#FAFAF8] border border-[#E8E8E8] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 text-[#111111] shadow-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFD21F]"></span>
                    {user.rewardPoints} pts
                  </div>
                )}

                {/* User Role Badge */}
                <div className="hidden sm:block text-[10px] bg-[#F5F5F2] px-2.5 py-1 rounded-md text-[#666666] border border-[#E8E8E8] font-bold tracking-wider uppercase">
                  {user.role}
                </div>

                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-1.5 rounded-full text-[#666666] hover:text-[#111111] hover:bg-[#F5F5F2] transition-colors focus:outline-none relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] bg-white border border-[#E8E8E8] py-1 max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-[#E8E8E8] font-bold text-sm flex justify-between items-center text-[#111111]">
                        <span>Notifications</span>
                        <span className="text-xs text-[#666666] font-medium">{unreadCount} unread</span>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-[#666666] text-sm">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`px-4 py-3 hover:bg-[#F5F5F2] transition-colors cursor-pointer border-b border-[#E8E8E8]/50 flex flex-col gap-1.5 ${!n.isRead ? 'bg-[#FFD21F]/5 border-l-2 border-l-[#FFD21F]' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${n.type === 'PENALTY' ? 'bg-red-50 text-red-600' : n.type === 'RESOLUTION' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-[#666666]'}`}>
                                {n.type}
                              </span>
                              <span className="text-[10px] text-[#666666] font-medium">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-[#111111] leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Profile icon */}
                <Link to="/profile" className="flex items-center space-x-2 text-[#666666] hover:text-[#111111] transition-colors ml-2 border-l border-[#E8E8E8] pl-4">
                  <div className="bg-[#F5F5F2] p-1.5 rounded-full border border-[#E8E8E8]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <span className="hidden md:inline text-sm font-semibold">{user.fullName}</span>
                </Link>

                {/* Logout */}
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded-full text-[#666666] hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-semibold text-[#666666] hover:text-[#111111] transition-colors px-2 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-5 py-2.5 shadow-sm">
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
