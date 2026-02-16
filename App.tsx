import React, { useState, useMemo } from 'react';
import PlanSelector from './components/PlanSelector';
import FeatureMatrix from './components/FeatureMatrix';
import ComparisonTool from './components/ComparisonTool';
import AIConsultant from './components/AIConsultant';
import AdminPortal from './components/AdminPortal';
import { DataProvider, useData } from './context/DataContext';

const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  // Globally remove symbols, commas and any descriptive text, leaving only digits and dots
  const cleaned = priceStr.replace(/[$,₹,]/g, '').trim();
  // Extract only the leading numerical part
  const match = cleaned.match(/^(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'compare' | 'admin'>('map');
  // Fix: useData instead of useDataProxy as defined in context/DataContext.tsx
  const { plans, currentUser, loginWithEntra, logout, tenantInfo, billingFrequency, setBillingFrequency } = useData();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Handle local state for plan selection within app shell
  const [internalPlanIds, setInternalPlanIds] = useState<string[]>([plans[2]?.id || 'm365-bp']);

  const togglePlan = (id: string) => {
    setInternalPlanIds(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id) 
        : [...prev, id]
    );
  };

  const selectedPlans = useMemo(() => 
    plans.filter(p => internalPlanIds.includes(p.id)),
    [internalPlanIds, plans]
  );
  
  // Explicitly recalculate whenever billingFrequency or selectedPlans changes
  const totals = useMemo(() => {
    const usd = selectedPlans.reduce((sum, p) => {
      const priceStr = billingFrequency === 'monthly' ? p.price : p.priceAnnual;
      return sum + parsePrice(priceStr);
    }, 0);

    const inr = selectedPlans.reduce((sum, p) => {
      const priceStr = billingFrequency === 'monthly' ? p.priceINR : p.priceAnnualINR;
      return sum + parsePrice(priceStr);
    }, 0);

    return { usd, inr };
  }, [selectedPlans, billingFrequency]);

  const uniqueFeaturesCount = new Set(selectedPlans.flatMap(p => p.features)).size;

  const handleMicrosoftLogin = async (role: 'SUPER_ADMIN' | 'ADMIN') => {
    setIsLoggingIn(true);
    try {
      await loginWithEntra(role);
      setShowLogin(false);
      setActiveTab('admin');
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <i className="fas fa-map-marked-alt text-lg"></i>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-black text-slate-900 leading-tight">SaaSMap</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">M365 Navigator</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-center">
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider ${
                  activeTab === 'map' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Visual Map
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider ${
                  activeTab === 'compare' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Matrix
              </button>
              {currentUser && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider ${
                    activeTab === 'admin' ? 'bg-blue-600 text-white shadow-sm border border-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Admin
                </button>
              )}
            </nav>

            {/* Global Billing Toggle - High Visibility */}
            <div className="hidden md:flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button 
                onClick={() => setBillingFrequency('monthly')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  billingFrequency === 'monthly' 
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingFrequency('annual')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  billingFrequency === 'annual' 
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-900 leading-none">{currentUser.username}</p>
                  <p className="text-[8px] text-blue-600 font-bold uppercase tracking-widest">{tenantInfo.name}</p>
                </div>
                <button 
                  onClick={logout}
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center border border-slate-200"
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
              >
                <i className="fab fa-microsoft"></i>
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'admin' ? (
          <AdminPortal />
        ) : activeTab === 'map' ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-[2rem] p-10 text-white relative overflow-hidden mb-8 shadow-2xl border border-white/5">
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedPlans.length > 0 ? (
                        selectedPlans.map(p => (
                          <span key={p.id} className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-sm">
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Plans Selected</span>
                      )}
                    </div>
                    
                    <h2 className="text-4xl font-black mb-4 tracking-tight">
                      {selectedPlans.length > 1 ? 'Multi-License Stack' : selectedPlans[0]?.name || 'Start Exploring'}
                    </h2>
                  </div>

                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 opacity-60">Current Commitment</span>
                     <div className="px-5 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest">
                        {billingFrequency} billing
                     </div>
                  </div>
                </div>
                
                {/* Fixed and completed Truncated Section */}
                <div className="flex flex-wrap items-center gap-10 mt-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-60">Total Estimated Cost</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black">${totals.usd.toFixed(2)}</span>
                      <span className="text-xl font-bold text-blue-400">/ ₹{totals.inr.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-white/10"></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-60">Combined Capabilities</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">{uniqueFeaturesCount}</span>
                      <span className="text-sm font-bold text-blue-400 uppercase">Active Maps</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">License Selection Portfolio</h3>
                <span className="text-[10px] font-bold text-slate-300 italic">Select multiple to stack features</span>
              </div>
              <PlanSelector selectedPlanIds={internalPlanIds} onToggle={togglePlan} />
            </section>

            <section className="pt-4">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Feature Map</h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <FeatureMatrix plans={selectedPlans} />
            </section>
          </div>
        ) : (
          <ComparisonTool />
        )}
      </main>

      <AIConsultant />

      {/* Login Simulation Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                <i className="fab fa-microsoft"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Admin Gateway</h3>
              <p className="text-slate-500 font-medium text-sm">Select your Entra ID simulation role to access the configuration portal.</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleMicrosoftLogin('SUPER_ADMIN')}
                disabled={isLoggingIn}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
              >
                {isLoggingIn ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-user-shield"></i>}
                Global Administrator
              </button>
              <button 
                onClick={() => handleMicrosoftLogin('ADMIN')}
                disabled={isLoggingIn}
                className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:border-blue-200 hover:text-blue-600 transition-all"
              >
                {isLoggingIn ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-user-gear"></i>}
                Standard IT Admin
              </button>
            </div>
            
            <button 
              onClick={() => setShowLogin(false)}
              className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Fix: Add wrapper component with Provider and export as default for index.tsx
const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;