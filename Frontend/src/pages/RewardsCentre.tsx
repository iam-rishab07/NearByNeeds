import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, ShoppingCart, Clock, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

interface RewardCatalog {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  stockQuantity: number;
}

interface Transaction {
  id: number;
  pointsChange: number;
  reason: string;
  createdAt: string;
}

export const RewardsCentre: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [catalog, setCatalog] = useState<RewardCatalog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');
  const [loading, setLoading] = useState(false);
  const [redeemingMap, setRedeemingMap] = useState<Record<number, boolean>>({});

  const loadRewardsData = async () => {
    setLoading(true);
    try {
      const catRes = await api.get('/rewards/catalog');
      setCatalog(catRes.data);

      const transRes = await api.get('/rewards/transactions');
      setTransactions(transRes.data);
    } catch (err) {
      console.error("Failed to load rewards center data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRewardsData();
    }
  }, [user]);

  const handleRedeem = async (id: number, name: string) => {
    if (redeemingMap[id]) return;
    setRedeemingMap(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/rewards/redeem/${id}`);
      alert(`Redemption successful! You redeemed: ${name}`);
      await refreshUser();
      await loadRewardsData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Redemption failed.");
    } finally {
      setRedeemingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Points Header card */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <Award className="h-8 w-8 text-amber-400" /> Civic Rewards Center
            </h1>
            <p className="text-slate-400 text-sm">
              Earn points by filing local civic issues that get successfully resolved. Redeem points for city gift cards, bus passes, and merchandise.
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-850 px-6 py-4 rounded-xl text-center min-w-44 shadow-inner">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Your Balance</span>
            <span className="text-3xl font-black text-emerald-400 font-mono">{user?.rewardPoints || 0}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">points active</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-850 gap-4 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('shop')}
            className={`pb-3 px-1 border-b-2 transition ${activeTab === 'shop' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Browse Rewards Shop
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 border-b-2 transition ${activeTab === 'history' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Transaction History
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-400"></div>
          </div>
        ) : activeTab === 'shop' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {catalog.map(item => {
              const canAfford = user && user.rewardPoints >= item.pointsRequired;
              const hasStock = item.stockQuantity > 0;

              return (
                <div 
                  key={item.id} 
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col p-5 space-y-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-bold text-white leading-tight">{item.name}</h3>
                      <Tag className="h-4 w-4 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-850">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Cost</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">{item.pointsRequired} pts</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Stock Remaining</span>
                      <span className="font-semibold text-slate-300 font-mono">{item.stockQuantity} items</span>
                    </div>

                    <button
                      onClick={() => handleRedeem(item.id, item.name)}
                      disabled={!canAfford || !hasStock || redeemingMap[item.id]}
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {!hasStock ? 'Out of Stock' : !canAfford ? 'Insufficient Points' : redeemingMap[item.id] ? 'Processing...' : 'Redeem'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 font-bold text-sm">
              Reward Point Logs
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No point logs available. Earn points by verifying issues or having reports resolved!
              </div>
            ) : (
              <div className="divide-y divide-slate-850">
                {transactions.map(t => (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-850/10 transition">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-200">{t.reason}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={`text-base font-extrabold font-mono flex items-center gap-0.5 ${t.pointsChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.pointsChange > 0 ? (
                        <>
                          <ArrowUpRight className="h-4 w-4" />+{t.pointsChange}
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-4 w-4" />{t.pointsChange}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
