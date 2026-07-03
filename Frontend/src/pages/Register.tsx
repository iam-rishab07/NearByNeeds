import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User as UserIcon, Phone, Layers } from 'lucide-react';



export const Register: React.FC = () => {
  const { registerUser, login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const role = 'CITIZEN';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        fullName,
        email,
        phone,
        password,
        role
      };

      await registerUser(payload);
      // Auto login after register
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[var(--color-bg)] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="bg-glow top-0 left-1/4"></div>
      <div className="bg-glow bottom-0 right-1/4"></div>

      <div className="max-w-md w-full space-y-8 auth-glass-card p-10 relative z-10">
        <div>
          <div className="flex justify-center">
            <div className="bg-[#FFFFFF] p-4 rounded-[20px] border border-[#E8E8E8] shadow-[0_8px_20px_rgba(255,210,31,0.15)]">
              <Layers className="h-10 w-10 text-[#FFD21F]" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#111111]">
            Create citizen account
          </h2>
          <p className="mt-2 text-center text-sm text-[#666666]">
            Or{' '}
            <Link to="/login" className="font-semibold text-[#FFD21F] hover:text-[#F4C430] transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="premium-input block w-full pl-11 p-3 text-sm"
                  placeholder="Vrushabh Patel"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="premium-input block w-full pl-11 p-3 text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-wider mb-1">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <Phone className="h-5 w-5" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="premium-input block w-full pl-11 p-3 text-sm"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input block w-full pl-11 p-3 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 text-sm btn-primary disabled:opacity-50"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                <UserPlus className="h-5 w-5 text-[#111111] opacity-70 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </span>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
