
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Feature, Plan, CategoryType, AuthConfig, TierDetail } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface ConfirmConfig {
  title: string;
  message: string;
  actionLabel: string;
  onConfirm: () => void;
  variant: 'danger' | 'warning';
}

const AdminPortal: React.FC = () => {
  const { 
    features, plans, currentUser, allUsers, tenantInfo, 
    updateFeature, addFeature, deleteFeature, updatePlan, 
    addPlan, deletePlan, resetData, syncTenant,
    authConfig, setAuthConfig 
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'features' | 'plans' | 'identity' | 'security'>('features');
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Local state for tracking which plans a feature belongs to during editing
  const [featurePlanLinks, setFeaturePlanLinks] = useState<string[]>([]);

  // Bulk Tier Editing States
  const [selectedTierIndices, setSelectedTierIndices] = useState<number[]>([]);
  const [bulkInput, setBulkInput] = useState('');

  // Local auth config for form handling
  const [localAuth, setLocalAuth] = useState<AuthConfig>(authConfig);

  // Sync localAuth when authConfig updates from context
  useEffect(() => {
    setLocalAuth(authConfig);
  }, [authConfig]);

  // Track changes to prevent accidental loss
  useEffect(() => {
    if (editingFeature || editingPlan) setIsDirty(true);
    else setIsDirty(false);
  }, [editingFeature, editingPlan]);

  // Sync plan links when starting to edit a feature
  useEffect(() => {
    if (editingFeature) {
      const linkedPlans = plans.filter(p => p.features.includes(editingFeature.id)).map(p => p.id);
      setFeaturePlanLinks(linkedPlans);
      setSelectedTierIndices([]); // Reset selection when switching features
    } else {
      setFeaturePlanLinks([]);
    }
  }, [editingFeature, plans]);

  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
    return (
      <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          <i className="fas fa-lock text-3xl"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-500 font-medium">This sector is reserved for verified administrators only. Please sign in with your Microsoft Entra ID credentials.</p>
      </div>
    );
  }

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      syncTenant();
      setIsSyncing(false);
    }, 2000);
  };

  const requestConfirm = (config: ConfirmConfig) => setConfirmConfig(config);

  const handleTabSwitch = (tab: any) => {
    if (isDirty) {
      requestConfirm({
        title: "Discard Current Edits?",
        message: "Moving away will lose pending changes in your current editor.",
        actionLabel: "Proceed",
        variant: 'warning',
        onConfirm: () => { setEditingFeature(null); setEditingPlan(null); setActiveTab(tab); }
      });
    } else {
      setActiveTab(tab);
    }
  };

  const saveAndClosePlanModal = () => {
    if (editingPlan) {
      if (isAddingNew) addPlan(editingPlan);
      else updatePlan(editingPlan);
      setEditingPlan(null);
      setIsAddingNew(false);
    }
  };

  const saveAndCloseFeatureModal = () => {
    if (editingFeature) {
      if (isAddingNew) addFeature(editingFeature);
      else updateFeature(editingFeature);

      plans.forEach(plan => {
        const shouldBeLinked = featurePlanLinks.includes(plan.id);
        const isCurrentlyLinked = plan.features.includes(editingFeature.id);

        if (shouldBeLinked && !isCurrentlyLinked) {
          const updatedPlan = { ...plan, features: [...plan.features, editingFeature.id] };
          updatePlan(updatedPlan);
        } else if (!shouldBeLinked && isCurrentlyLinked) {
          const updatedPlan = { ...plan, features: plan.features.filter(fid => fid !== editingFeature.id) };
          updatePlan(updatedPlan);
        }
      });

      setEditingFeature(null);
      setIsAddingNew(false);
    }
  };

  const handleClosePlanEditor = () => {
    if (isDirty) {
      requestConfirm({
        title: "Unsaved Changes",
        message: "This plan bundle has modified configurations. Discard changes?",
        actionLabel: "Discard",
        variant: 'warning',
        onConfirm: () => { setEditingPlan(null); setIsAddingNew(false); }
      });
    } else {
      setEditingPlan(null);
      setIsAddingNew(false);
    }
  };

  const handleCloseFeatureEditor = () => {
    if (isDirty) {
      requestConfirm({
        title: "Unsaved Changes",
        message: "This service capability has modified metadata. Discard changes?",
        actionLabel: "Discard",
        variant: 'warning',
        onConfirm: () => { setEditingFeature(null); setIsAddingNew(false); }
      });
    } else {
      setEditingFeature(null);
      setIsAddingNew(false);
    }
  };

  const handleToggleFeatureInPlan = (featureId: string) => {
    if (!editingPlan) return;
    const updated = { ...editingPlan };
    if (updated.features.includes(featureId)) {
      updated.features = updated.features.filter(id => id !== featureId);
    } else {
      updated.features = [...updated.features, featureId];
    }
    setEditingPlan(updated);
  };

  const handleTogglePlanInFeature = (planId: string) => {
    setFeaturePlanLinks(prev => 
      prev.includes(planId) ? prev.filter(id => id !== planId) : [...prev, planId]
    );
    setIsDirty(true);
  };

  const handleAddTier = () => {
    if (!editingFeature) return;
    const newTier: TierDetail = {
      tierName: 'New Tier Level',
      capabilities: [],
      includedInPlanIds: []
    };
    
    if (editingFeature.tierComparison) {
      setEditingFeature({
        ...editingFeature,
        tierComparison: {
          ...editingFeature.tierComparison,
          tiers: [...editingFeature.tierComparison.tiers, newTier]
        }
      });
    } else {
      setEditingFeature({
        ...editingFeature,
        tierComparison: {
          title: `${editingFeature.name} Tier Mapping`,
          tiers: [newTier]
        }
      });
    }
    setIsDirty(true);
  };

  const handleUpdateTier = (idx: number, updatedTier: TierDetail) => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    const newTiers = [...editingFeature.tierComparison.tiers];
    newTiers[idx] = updatedTier;
    setEditingFeature({
      ...editingFeature,
      tierComparison: {
        ...editingFeature.tierComparison,
        tiers: newTiers
      }
    });
    setIsDirty(true);
  };

  const handleRemoveTier = (idx: number) => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    const newTiers = editingFeature.tierComparison.tiers.filter((_, i) => i !== idx);
    setEditingFeature({
      ...editingFeature,
      tierComparison: newTiers.length > 0 ? {
        ...editingFeature.tierComparison,
        tiers: newTiers
      } : undefined
    });
    setIsDirty(true);
  };

  const handleMoveTier = (idx: number, direction: 'up' | 'down') => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    const tiers = [...editingFeature.tierComparison.tiers];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= tiers.length) return;
    
    [tiers[idx], tiers[targetIdx]] = [tiers[targetIdx], tiers[idx]];
    setEditingFeature({
      ...editingFeature,
      tierComparison: {
        ...editingFeature.tierComparison,
        tiers
      }
    });
    setIsDirty(true);
  };

  const handleToggleTierSelection = (idx: number) => {
    setSelectedTierIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleBulkOperation = (type: 'ADD' | 'REMOVE') => {
    if (!editingFeature || !editingFeature.tierComparison || selectedTierIndices.length === 0) return;
    
    const newCaps = bulkInput.split(',').map(s => s.trim()).filter(Boolean);
    if (newCaps.length === 0) return;

    const updatedTiers = [...editingFeature.tierComparison.tiers].map((tier, idx) => {
      if (!selectedTierIndices.includes(idx)) return tier;

      let currentCaps = [...tier.capabilities];
      if (type === 'ADD') {
        // Add only unique ones
        newCaps.forEach(nc => {
          if (!currentCaps.some(cc => cc.toLowerCase() === nc.toLowerCase())) {
            currentCaps.push(nc);
          }
        });
      } else {
        // Remove matching ones
        currentCaps = currentCaps.filter(cc => 
          !newCaps.some(nc => nc.toLowerCase() === cc.toLowerCase())
        );
      }

      return { ...tier, capabilities: currentCaps };
    });

    setEditingFeature({
      ...editingFeature,
      tierComparison: {
        ...editingFeature.tierComparison,
        tiers: updatedTiers
      }
    });
    setBulkInput('');
    setIsDirty(true);
  };

  const filteredFeatures = features.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveAuth = () => {
    setAuthConfig(localAuth);
    alert("Auth Configuration Saved. Changes will take effect on next login attempt.");
  };

  const handleCopyRedirectUri = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSyncRedirectToCurrent = () => {
    setLocalAuth({ ...localAuth, redirectUri: window.location.origin });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Confirmation Modal */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-8">
             <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{confirmConfig.title}</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">{confirmConfig.message}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { confirmConfig.onConfirm(); setConfirmConfig(null); }} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">
                {confirmConfig.actionLabel}
              </button>
              <button onClick={() => setConfirmConfig(null)} className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header with Tenant Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img src={currentUser.avatar} className="w-20 h-20 rounded-[1.5rem] shadow-xl border-4 border-white" alt="User" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center text-white text-[10px]">
              <i className="fab fa-microsoft"></i>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentUser.username}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-500 font-bold text-sm">{currentUser.jobTitle}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">{tenantInfo.name}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="px-6 py-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Entra ID Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${tenantInfo.syncStatus === 'Healthy' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-black text-blue-700">{tenantInfo.syncStatus}</span>
              </div>
            </div>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`w-10 h-10 rounded-xl bg-white border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all ${isSyncing ? 'animate-spin opacity-50' : ''}`}
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
          
          <button 
            onClick={() => requestConfirm({
              title: "System Reset",
              message: "Reverting all configurations to factory defaults will erase your Entra ID customizations. Continue?",
              actionLabel: "Revert All",
              variant: 'danger',
              onConfirm: resetData
            })}
            className="px-8 py-4 bg-slate-50 text-slate-400 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
          >
            Factory Reset
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-3 bg-slate-200/50 p-2 rounded-[1.5rem] w-fit">
        <button onClick={() => handleTabSwitch('features')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'features' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500'}`}>
          Services
        </button>
        <button onClick={() => handleTabSwitch('plans')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'plans' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500'}`}>
          Bundles
        </button>
        <button onClick={() => handleTabSwitch('identity')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'identity' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500'}`}>
          <i className="fab fa-microsoft mr-2 text-[10px]"></i> Sync
        </button>
        <button onClick={() => handleTabSwitch('security')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-white text-red-600 shadow-lg' : 'text-slate-500'}`}>
          <i className="fas fa-shield-halved mr-2 text-[10px]"></i> Security & Auth
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[600px]">
        {activeTab === 'security' ? (
          <div className="p-12 space-y-12 animate-in slide-in-from-right-4 duration-300">
            <div className="max-w-4xl">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Production Entra ID Setup</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                Connect SaaSMap to your real Microsoft 365 tenant using MSAL. Once enabled, mock logins are disabled and users must authenticate via your registered Azure Application.
              </p>
              
              <div className="space-y-8">
                {/* AADSTS50011 Specific Troubleshooting */}
                <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100 space-y-4">
                  <div className="flex items-center gap-4 text-red-600">
                    <i className="fas fa-circle-exclamation text-xl"></i>
                    <h4 className="text-xs font-black uppercase tracking-widest">Fixing AADSTS50011: Redirect URI Mismatch</h4>
                  </div>
                  <p className="text-[11px] text-red-800 font-medium leading-relaxed">
                    If you see a mismatch error, ensure the <strong>exactly detected URL</strong> below is added to your Azure App Registration as a <strong>Single-page application (SPA)</strong> redirect URI.
                  </p>
                  <div className="flex flex-col md:flex-row items-stretch gap-3 mt-4">
                    <div className="flex-1 bg-white border border-red-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
                      <span className="text-[10px] font-mono font-bold text-slate-600 truncate mr-4">{window.location.origin}</span>
                      <button 
                        onClick={handleCopyRedirectUri}
                        className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${copySuccess ? 'text-green-600' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        {copySuccess ? <><i className="fas fa-check"></i> Copied!</> : <><i className="fas fa-copy"></i> Copy URI</>}
                      </button>
                    </div>
                    <button 
                      onClick={handleSyncRedirectToCurrent}
                      className="px-8 py-4 bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      Sync Local Config
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application (Client) ID</label>
                    <input 
                      type="text" 
                      placeholder="00000000-0000-0000-0000-000000000000"
                      value={localAuth.clientId}
                      onChange={e => setLocalAuth({...localAuth, clientId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-mono text-xs focus:bg-white transition-all outline-none focus:ring-4 focus:ring-blue-100" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directory (Tenant) ID</label>
                    <input 
                      type="text" 
                      placeholder="00000000-0000-0000-0000-000000000000"
                      value={localAuth.tenantId}
                      onChange={e => setLocalAuth({...localAuth, tenantId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-mono text-xs focus:bg-white transition-all outline-none focus:ring-4 focus:ring-blue-100" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Redirect URI (Stored in Config)</label>
                  <input 
                    type="text" 
                    value={localAuth.redirectUri}
                    onChange={e => setLocalAuth({...localAuth, redirectUri: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-mono text-xs focus:bg-white transition-all outline-none focus:ring-4 focus:ring-blue-100" 
                    placeholder="Matches your Azure App Registration"
                  />
                </div>

                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${localAuth.isProduction ? 'bg-red-600 text-white shadow-xl shadow-red-100' : 'bg-white border border-slate-200 text-slate-300'}`}>
                      <i className="fas fa-toggle-on text-xl"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Enable Production Auth Mode</p>
                      <p className="text-[10px] text-slate-500 font-bold">Requires valid Azure configuration to log in.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setLocalAuth({...localAuth, isProduction: !localAuth.isProduction})}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${localAuth.isProduction ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {localAuth.isProduction ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="pt-6">
                   <button 
                    onClick={handleSaveAuth}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all"
                  >
                    Apply Security Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'identity' ? (
          <div className="p-12 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Tenant</h4>
                  <i className="fas fa-check-circle text-green-500"></i>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Organization</p>
                    <p className="text-sm font-black text-slate-900">{tenantInfo.name}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Primary Domain</p>
                    <p className="text-sm font-black text-slate-900">{tenantInfo.domain}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Tenant ID</p>
                    <p className="text-[10px] font-mono font-bold text-slate-500 truncate">{tenantInfo.tenantId}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Directory Synchronization</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Sync: {new Date(tenantInfo.lastSync).toLocaleString()}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                        <i className="fas fa-users"></i>
                      </div>
                      <div>
                        <p className="text-xs font-black text-blue-900">Enterprise Users</p>
                        <p className="text-[10px] text-blue-500 font-bold">{allUsers.length} Synced Accounts</p>
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-white text-blue-600 text-[10px] font-black uppercase rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Manage Directory</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'plans' ? (
          <div className="p-10 space-y-8">
            <div className="flex justify-between items-center px-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">License Catalog</h3>
                <p className="text-slate-400 text-xs font-medium">Manage pricing, commitments, and feature bundles.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingPlan({
                    id: `custom-${Date.now()}`,
                    name: 'New Custom Plan',
                    type: 'Business',
                    price: '$0.00',
                    priceINR: '₹0',
                    priceAnnual: '$0.00',
                    priceAnnualINR: '₹0',
                    color: '#64748b',
                    description: 'Plan description here...',
                    features: []
                  });
                  setIsAddingNew(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-slate-900 transition-all"
              >
                <i className="fas fa-plus"></i> Add New License
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map(plan => (
                <div key={plan.id} className="p-8 border border-slate-100 rounded-[2.5rem] hover:border-blue-400 hover:shadow-2xl transition-all group bg-slate-50/20 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: plan.color }} />
                      <span className="px-4 py-1.5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] rounded-full text-slate-400 shadow-sm">
                        {plan.type}
                      </span>
                    </div>
                    <button 
                      onClick={() => { setEditingPlan(JSON.parse(JSON.stringify(plan))); setIsAddingNew(false); }}
                      className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white shadow-md"
                    >
                      <i className="fas fa-pencil text-sm"></i>
                    </button>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-1 truncate">{plan.name}</h4>
                  
                  {/* Pricing Overview in Admin Card */}
                  <div className="space-y-4 mt-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Monthly Commitment</p>
                      <div className="flex justify-between">
                        <span className="text-sm font-black text-slate-900">{plan.price}</span>
                        <span className="text-sm font-black text-blue-600">{plan.priceINR}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/30">
                      <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-2">Annual Commitment</p>
                      <div className="flex justify-between">
                        <span className="text-sm font-black text-slate-900">{plan.priceAnnual}</span>
                        <span className="text-sm font-black text-blue-600">{plan.priceAnnualINR}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{plan.features.length} Features Included</span>
                    {plan.id.startsWith('custom-') && (
                       <button 
                        onClick={() => requestConfirm({
                          title: "Delete Custom Plan?",
                          message: "This will permanently remove this license from the navigator catalog.",
                          actionLabel: "Delete Plan",
                          variant: 'danger',
                          onConfirm: () => deletePlan(plan.id)
                        })}
                        className="text-[9px] font-black text-red-400 uppercase tracking-widest hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Service Capabilities</h3>
                <p className="text-slate-400 text-xs font-medium">Manage the technical features listed in the feature map.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative w-full md:w-96">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    type="text" 
                    placeholder="Search services..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white transition-all"
                  />
                </div>
                <button 
                  onClick={() => {
                    setEditingFeature({
                      id: `feat-${Date.now()}`,
                      name: 'New Service Capability',
                      description: 'Provide a clear technical description of the service.',
                      category: CategoryType.PRODUCTIVITY,
                      link: ''
                    });
                    setIsAddingNew(true);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-slate-900 transition-all flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i> Add New Service
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {filteredFeatures.map(f => (
                <div key={f.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all group relative overflow-hidden text-left">
                  <div className={`absolute top-0 right-0 w-2 h-full opacity-10 ${CATEGORY_COLORS[f.category]}`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${CATEGORY_COLORS[f.category]}`}>
                      {f.category}
                    </span>
                    <button 
                      onClick={() => { setEditingFeature(JSON.parse(JSON.stringify(f))); setIsAddingNew(false); }}
                      className="text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <i className="fas fa-pencil text-sm"></i>
                    </button>
                  </div>
                  <h5 className="text-sm font-black text-slate-900 mb-2 truncate">{f.name}</h5>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-2 min-h-[30px]">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Plan Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden p-12 space-y-10 animate-in zoom-in-95 duration-200 my-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white text-2xl shadow-xl" style={{ backgroundColor: editingPlan.color }}>
                  <i className="fas fa-cube"></i>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Bundle Architect</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Configuring {editingPlan.name}</p>
                </div>
              </div>
              <button onClick={handleClosePlanEditor} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-200 flex items-center justify-center">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
              <div className="lg:col-span-5 space-y-10">
                <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-file-invoice-dollar"></i>
                    Financial Configuration
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bundle Identifier</label>
                      <input type="text" value={editingPlan.name} onChange={e => { setEditingPlan({...editingPlan, name: e.target.value}); setIsDirty(true); }} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                    </div>
                    
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
                      {/* Monthly Section */}
                      <div className="space-y-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Monthly Commitment Rates</span>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase ml-1">USD Price</label>
                            <input type="text" value={editingPlan.price} onChange={e => { setEditingPlan({...editingPlan, price: e.target.value}); setIsDirty(true); }} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase ml-1">INR Price</label>
                            <input type="text" value={editingPlan.priceINR} onChange={e => { setEditingPlan({...editingPlan, priceINR: e.target.value}); setIsDirty(true); }} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold" />
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-200"></div>

                      {/* Annual Section */}
                      <div className="space-y-4">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Annual Commitment Rates</span>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-blue-400 uppercase ml-1">USD Price (Year)</label>
                            <input type="text" value={editingPlan.priceAnnual} onChange={e => { setEditingPlan({...editingPlan, priceAnnual: e.target.value}); setIsDirty(true); }} className="w-full px-5 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-slate-900 font-bold" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-blue-400 uppercase ml-1">INR Price (Year)</label>
                            <input type="text" value={editingPlan.priceAnnualINR} onChange={e => { setEditingPlan({...editingPlan, priceAnnualINR: e.target.value}); setIsDirty(true); }} className="w-full px-5 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-slate-900 font-bold" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Accent Color</label>
                        <input type="color" value={editingPlan.color} onChange={e => { setEditingPlan({...editingPlan, color: e.target.value}); setIsDirty(true); }} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl p-1 cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Category</label>
                        <select 
                          value={editingPlan.type} 
                          onChange={e => { setEditingPlan({...editingPlan, type: e.target.value as any}); setIsDirty(true); }} 
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold"
                        >
                          <option value="Business">Business</option>
                          <option value="Enterprise">Enterprise</option>
                          <option value="Frontline">Frontline</option>
                          <option value="Add-on">Add-on</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-7 space-y-10 border-l border-slate-100 pl-12">
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-2">
                      <i className="fas fa-layer-group text-blue-600"></i>
                      Feature Matrix Mapping
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">{editingPlan.features.length} Enabled</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                    {Object.values(CategoryType).map(cat => (
                      <div key={cat} className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">{cat}</h4>
                        <div className="space-y-2">
                          {features.filter(f => f.category === cat).map(f => {
                            const isIncluded = editingPlan.features.includes(f.id);
                            return (
                              <button 
                                key={f.id} 
                                onClick={() => { handleToggleFeatureInPlan(f.id); setIsDirty(true); }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between group ${isIncluded ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
                              >
                                <span className="truncate mr-2">{f.name}</span>
                                {isIncluded ? <i className="fas fa-check-circle"></i> : <i className="fas fa-circle-plus opacity-0 group-hover:opacity-100"></i>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="flex gap-4 pt-10 sticky bottom-0 bg-white z-20 py-6 border-t border-slate-100 mt-auto">
              <button onClick={saveAndClosePlanModal} className="flex-1 py-6 bg-blue-600 text-white text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100">Synchronize Catalog</button>
              <button onClick={handleClosePlanEditor} className="px-12 py-6 bg-white border-2 border-slate-200 text-slate-700 text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-slate-50 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Edit Modal */}
      {editingFeature && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-7xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200 my-10 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center sticky top-0 bg-white z-[60] pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4 text-left">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${CATEGORY_COLORS[editingFeature.category]}`}>
                  <i className="fas fa-cubes"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Service Blueprint</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAddingNew ? 'Constructing New Feature' : `Refining ${editingFeature.name}`}</p>
                </div>
              </div>
              <button onClick={handleCloseFeatureEditor} className="text-slate-400 hover:text-slate-900"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
              {/* Left Column: Metadata */}
              <div className="lg:col-span-4 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Name</label>
                    <input type="text" value={editingFeature.name} onChange={e => { setEditingFeature({...editingFeature, name: e.target.value}); setIsDirty(true); }} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Category</label>
                    <select 
                      value={editingFeature.category} 
                      onChange={e => { setEditingFeature({...editingFeature, category: e.target.value as CategoryType}); setIsDirty(true); }} 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      Official Documentation URL
                      {editingFeature.link && (
                        <a href={editingFeature.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                          <i className="fas fa-up-right-from-square text-[8px]"></i>
                          <span className="text-[8px] font-bold">Test</span>
                        </a>
                      )}
                    </label>
                    <div className="relative">
                      <i className="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <input 
                        type="url" 
                        placeholder="https://learn.microsoft.com/..."
                        value={editingFeature.link || ''} 
                        onChange={e => { setEditingFeature({...editingFeature, link: e.target.value}); setIsDirty(true); }} 
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marketing Description</label>
                    <textarea value={editingFeature.description} onChange={e => { setEditingFeature({...editingFeature, description: e.target.value}); setIsDirty(true); }} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold min-h-[140px] outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                  </div>
                </div>
              </div>

              {/* Middle Column: Tier Comparison Architect */}
              <div className="lg:col-span-8 space-y-8 border-l border-slate-100 pl-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-layer-group text-blue-600"></i>
                    Tier Progression Logic
                  </h4>
                  <button 
                    onClick={handleAddTier}
                    className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i> Add Level
                  </button>
                </div>

                {!editingFeature.tierComparison ? (
                  <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                      <i className="fas fa-stream"></i>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Standard Service Model</p>
                      <p className="text-[10px] text-slate-500 font-medium max-w-[200px] mt-1">This feature is currently non-tiered. Enable comparison to map Plan 1/Plan 2 variations.</p>
                    </div>
                    <button onClick={handleAddTier} className="mt-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Enable Multi-Tier Mapping</button>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {/* Bulk Architect Panel */}
                    {editingFeature.tierComparison.tiers.length > 1 && (
                      <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                              <i className="fas fa-screwdriver-wrench"></i>
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-blue-900 uppercase tracking-widest">Bulk Operations Architect</h5>
                              <p className="text-[10px] text-blue-500 font-bold">Apply changes to {selectedTierIndices.length} targeted tiers level(s)</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const allIndices = editingFeature.tierComparison!.tiers.map((_, i) => i);
                              setSelectedTierIndices(selectedTierIndices.length === allIndices.length ? [] : allIndices);
                            }}
                            className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                          >
                            {selectedTierIndices.length === editingFeature.tierComparison!.tiers.length ? 'Deselect All' : 'Select All Tiers'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                          <div className="md:col-span-8 space-y-2">
                            <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest ml-1">Bulk Capabilities (Comma separated)</label>
                            <input 
                              type="text" 
                              value={bulkInput}
                              onChange={e => setBulkInput(e.target.value)}
                              placeholder="e.g. Audit Logging, Data Retention, MFA..."
                              className="w-full px-5 py-3.5 bg-white border border-blue-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                          </div>
                          <div className="md:col-span-4 flex gap-2">
                            <button 
                              onClick={() => handleBulkOperation('ADD')}
                              disabled={selectedTierIndices.length === 0 || !bulkInput.trim()}
                              className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-plus-circle"></i> Inject
                            </button>
                            <button 
                              onClick={() => handleBulkOperation('REMOVE')}
                              disabled={selectedTierIndices.length === 0 || !bulkInput.trim()}
                              className="flex-1 py-3.5 bg-white border border-blue-200 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-minus-circle"></i> Prune
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar p-1">
                      {editingFeature.tierComparison.tiers.map((tier, tIdx) => {
                        const isSelected = selectedTierIndices.includes(tIdx);
                        return (
                          <div 
                            key={tIdx} 
                            className={`p-8 bg-white border-2 rounded-[2.5rem] shadow-sm space-y-5 relative group transition-all duration-300 ${isSelected ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                          >
                            {/* Reorder Controls */}
                            <div className="absolute right-6 top-6 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-10">
                              <button 
                                onClick={() => handleMoveTier(tIdx, 'up')}
                                disabled={tIdx === 0}
                                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 disabled:opacity-30 flex items-center justify-center"
                                title="Move Up"
                              >
                                <i className="fas fa-arrow-up text-xs"></i>
                              </button>
                              <button 
                                onClick={() => handleMoveTier(tIdx, 'down')}
                                disabled={tIdx === editingFeature.tierComparison!.tiers.length - 1}
                                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 disabled:opacity-30 flex items-center justify-center"
                                title="Move Down"
                              >
                                <i className="fas fa-arrow-down text-xs"></i>
                              </button>
                              <button 
                                onClick={() => handleRemoveTier(tIdx)}
                                className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                                title="Delete Tier"
                              >
                                <i className="fas fa-trash-alt text-xs"></i>
                              </button>
                            </div>

                            {/* Multi-select Checkbox */}
                            <button 
                              onClick={() => handleToggleTierSelection(tIdx)}
                              className={`absolute left-6 top-6 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-transparent'}`}
                            >
                              <i className="fas fa-check text-[10px]"></i>
                            </button>

                            <div className="flex flex-col gap-2 pt-4">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Level {tIdx + 1} Metadata</label>
                              <div className="flex items-center gap-4">
                                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                                  {tIdx + 1}
                                </span>
                                <input 
                                  type="text" 
                                  value={tier.tierName} 
                                  onChange={e => handleUpdateTier(tIdx, { ...tier, tierName: e.target.value })}
                                  className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" 
                                  placeholder="Tier Title (e.g. Premium)"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Capabilities Inventory</label>
                              <textarea 
                                value={tier.capabilities.join(', ')} 
                                onChange={e => handleUpdateTier(tIdx, { ...tier, capabilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[11px] font-medium min-h-[100px] outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all leading-relaxed"
                                placeholder="Feature set for this tier..."
                              />
                            </div>

                            <div className="space-y-3">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Associated Bundles</label>
                              <div className="flex flex-wrap gap-2">
                                {plans.map(p => {
                                  const isIncluded = tier.includedInPlanIds?.includes(p.id);
                                  return (
                                    <button 
                                      key={p.id}
                                      onClick={() => {
                                        const currentIds = tier.includedInPlanIds || [];
                                        const newIds = isIncluded ? currentIds.filter(id => id !== p.id) : [...currentIds, p.id];
                                        handleUpdateTier(tIdx, { ...tier, includedInPlanIds: newIds });
                                      }}
                                      className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-tight transition-all border ${
                                        isIncluded ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                      }`}
                                    >
                                      {p.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <button 
                        onClick={handleAddTier}
                        className="p-10 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-4 group h-full"
                      >
                        <div className="w-16 h-16 rounded-[2rem] bg-slate-50 group-hover:bg-blue-100 flex items-center justify-center transition-all shadow-sm">
                          <i className="fas fa-plus text-xl"></i>
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-black uppercase tracking-widest block mb-1">Add Tier Stage</span>
                          <p className="text-[10px] text-slate-400 font-bold max-w-[150px]">Append a new technical level to the service map</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex gap-4 pt-10 sticky bottom-0 bg-white z-40 pb-4 border-t border-slate-100 mt-auto">
              <button onClick={saveAndCloseFeatureModal} className="flex-1 py-5 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">Commit to Global Catalog</button>
              <button onClick={handleCloseFeatureEditor} className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-400 text-xs font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-slate-50 transition-all">Discard Blueprint</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
