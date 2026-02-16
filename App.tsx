
import React, { useState } from 'react';
import PlanSelector from './components/PlanSelector';
import FeatureMatrix from './components/FeatureMatrix';
import ComparisonTool from './components/ComparisonTool';
import AIConsultant from './components/AIConsultant';
import AdminPortal from './components/AdminPortal';
import { DataProvider, useData } from './context/DataContext';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'compare' | 'admin'>('map');
  const { plans, currentUser, login, logout } = useDataProxy();
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', passcode: '' });

  // Handle local state for plan selection within app shell
  const [internalPlanIds, setInternalPlanIds] = useState<string[]>([plans[0]?.id || 'm365-bb']);

  const togglePlan = (id: string) => {
    setInternalPlanIds(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id) 
        : [...prev, id]
    );
  };

  const selectedPlans = plans.filter(p => internalPlanIds.includes(p.id));
  
  const totalPriceUSD = selectedPlans.reduce((sum, p) => {
    const val = parseFloat(p.price.replace('$', '').replace(',', '')) || 0;
    return sum + val;
  }, 0);

  const totalPriceINR = selectedPlans.reduce((sum, p) => {
    const val = parseFloat(p.priceINR.replace('₹', '').replace(',', '')) || 0;
    return sum + val;
  }, 0);

  const uniqueFeaturesCount = new Set(selectedPlans.flatMap(p => p.features)).size;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.passcode === 'SUPER') {
      login(loginForm.username, 'SUPER_ADMIN');
    } else if (loginForm.passcode === 'ADMIN') {
      login(loginForm.username, 'ADMIN');
    } else {
      alert("Invalid passcode. Use 'SUPER' for Super Admin or 'ADMIN' for standard Admin access.");
      return;
    }
    setShowLogin(false);
    setLoginForm({ username: '', passcode: '' });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <i className="fas fa-map-marked-alt text-lg"></i>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-slate-900 leading-tight">SaaSMap</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">M365 Navigator</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-5 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${
                activeTab === 'map' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Visual Map
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-5 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${
                activeTab === 'compare' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Matrix
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-5 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${
                  activeTab === 'admin' ? 'bg-blue-600 text-white shadow-sm border border-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <i className="fas fa-lock text-[10px] mr-2"></i>
                Admin
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-900 leading-none">{currentUser.username}</p>
                  <p className="text-[8px] text-blue-600 font-bold uppercase tracking-widest">{currentUser.role}</p>
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
                className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Admin Login
              </button>
            )}
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <a href="https://github.com" target="_blank" className="text-slate-400 hover:text-blue-600 transition-colors hidden md:block">
              <i className="fab fa-github text-xl"></i>
            </a>
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
                
                <div className="flex flex-wrap items-center gap-12 mt-10">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Monthly Cost</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-blue-400">${totalPriceUSD.toFixed(2)}</span>
                      <span className="text-xl font-black text-white/40">/ ₹{totalPriceINR.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Aggregated Features</span>
                    <span className="text-4xl font-black">{uniqueFeaturesCount}</span>
                  </div>
                </div>
              </div>
              <div className="absolute right-[-5%] bottom-[-20%] h-full w-1/2 opacity-5 flex items-center justify-center pointer-events-none">
                <i className="fas fa-layer-group text-[400px]"></i>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Plan Selection</h3>
              {internalPlanIds.length > 0 && (
                <button 
                  onClick={() => setInternalPlanIds([])}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-black uppercase tracking-widest transition-colors"
                >
                  Reset All
                </button>
              )}
            </div>
            
            <PlanSelector selectedPlanIds={internalPlanIds} onToggle={togglePlan} />
            
            <FeatureMatrix plans={selectedPlans} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Side-by-Side Matrix</h2>
              <p className="text-slate-500 font-medium text-sm">Deep-dive technical comparison of Microsoft 365 licensing tiers.</p>
            </div>
            <ComparisonTool />
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 p-8">
              <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-xl shadow-blue-200 mb-4">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">Manage features and user permissions</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. jsmith"
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passcode</label>
                <input 
                  type="password" 
                  required
                  placeholder="Enter secret code..."
                  value={loginForm.passcode}
                  onChange={e => setLoginForm({...loginForm, passcode: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-1">
                  * Codes: "SUPER" or "ADMIN"
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-blue-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Consultant */}
      <AIConsultant />

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-400">
          <i className="fas fa-info-circle"></i>
        </div>
        <p className="text-xs text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Disclaimer: This dashboard is provided for informational purposes only. Microsoft 365 feature availability and pricing are subject to regional variations. 
          <span className="block mt-2 font-bold text-slate-500 uppercase tracking-[0.1em]">© 2024 SaaSMap Navigation Systems</span>
        </p>
      </footer>
    </div>
  );
};

// Helper proxy to use context safely
const useDataProxy = () => {
  const data = useData();
  return data;
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
