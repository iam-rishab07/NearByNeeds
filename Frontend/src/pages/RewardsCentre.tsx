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
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] text-[#111111] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="bg-glow top-0 left-0"></div>
      <div className="bg-glow bottom-0 right-0"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Points Header card */}
        <div className="flex flex-col md:flex-row justify-between items-center premium-card p-8 gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold flex items-center gap-3 text-[#111111]">
              <Award className="h-8 w-8 text-[#FFD21F]" /> Civic Rewards Center
            </h1>
            <p className="text-[#666666] text-sm leading-relaxed max-w-2xl font-medium">
              Earn points by filing local civic issues that get successfully resolved. Redeem points for city gift cards, bus passes, and merchandise.
            </p>
          </div>
          <div className="bg-[#FAFAF8] border border-[#E8E8E8] px-8 py-5 rounded-2xl text-center min-w-48 shadow-sm">
            <span className="text-xs text-[#666666] font-bold uppercase tracking-wider block mb-1">Your Balance</span>
            <span className="text-4xl font-black text-[#FFD21F] font-mono">{user?.rewardPoints || 0}</span>
            <span className="text-[10px] text-[#666666] font-semibold block mt-1 uppercase tracking-wider">points active</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#E8E8E8] gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('shop')}
            className={`pb-3 px-1 border-b-2 transition ${activeTab === 'shop' ? 'border-[#FFD21F] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'}`}
          >
            Browse Rewards Shop
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 border-b-2 transition ${activeTab === 'history' ? 'border-[#FFD21F] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'}`}
          >
            Transaction History
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FFD21F]"></div>
          </div>
        ) : activeTab === 'shop' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {catalog.map(item => {
              const canAfford = user && user.rewardPoints >= item.pointsRequired;
              const hasStock = item.stockQuantity > 0;

              return (
                <div 
                  key={item.id} 
                  className="premium-card hover:border-[#FFD21F]/50 transition-all hover:-translate-y-1 flex flex-col p-6 space-y-5"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-[#111111] text-lg leading-tight">{item.name}</h3>
                      <Tag className="h-5 w-5 text-[#FFD21F] shrink-0" />
                    </div>
                    <p className="text-[#666666] font-medium text-xs leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#E8E8E8]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#666666] font-bold uppercase tracking-wider">Cost</span>
                      <span className="text-base font-extrabold text-[#111111] font-mono bg-[#FFD21F]/10 px-2.5 py-1 rounded-md border border-[#FFD21F]/20">{item.pointsRequired} pts</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#666666] font-bold uppercase tracking-wider">Stock</span>
                      <span className="font-bold text-[#666666] font-mono bg-[#FAFAF8] px-2.5 py-1 rounded-md border border-[#E8E8E8]">{item.stockQuantity} items</span>
                    </div>

                    <button
                      onClick={() => handleRedeem(item.id, item.name)}
                      disabled={!canAfford || !hasStock || redeemingMap[item.id]}
                      className="w-full py-3 px-4 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 btn-primary disabled:opacity-30 disabled:pointer-events-none shadow-[0_4px_14px_rgba(255,210,31,0.25)]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {!hasStock ? 'Out of Stock' : !canAfford ? 'Insufficient Points' : redeemingMap[item.id] ? 'Processing...' : 'Redeem Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="premium-card overflow-hidden max-w-4xl mx-auto">
            <div className="px-8 py-5 bg-[#FAFAF8] border-b border-[#E8E8E8] font-bold text-sm tracking-wider uppercase text-[#666666]">
              Reward Point Logs
            </div>
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-[#666666] text-sm font-semibold">
                No point logs available. Earn points by verifying issues or having reports resolved!
              </div>
            ) : (
              <div className="divide-y divide-[#E8E8E8]">
                {transactions.map(t => (
                  <div key={t.id} className="px-8 py-5 flex items-center justify-between hover:bg-[#FAFAF8] transition-colors">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-extrabold text-[#111111]">{t.reason}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#666666] font-bold">
                        <Clock className="h-3 w-3" />
                        {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={`text-lg font-extrabold font-mono flex items-center gap-1 ${t.pointsChange > 0 ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-red-700 bg-red-50 border border-red-200'} px-3 py-1.5 rounded-lg shadow-sm`}>
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
