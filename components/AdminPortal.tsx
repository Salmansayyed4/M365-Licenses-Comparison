
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Feature, Plan, CategoryType } from '../types';

interface ConfirmConfig {
  title: string;
  message: string;
  actionLabel: string;
  onConfirm: () => void;
  variant: 'danger' | 'warning';
}

const AdminPortal: React.FC = () => {
  const { features, plans, currentUser, updateFeature, addFeature, deleteFeature, updatePlan, addPlan, deletePlan, approveAdmin, deleteUser, resetData } = useData();
  const [activeTab, setActiveTab] = useState<'features' | 'plans' | 'users'>('features');
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // Track changes to prevent accidental loss
  useEffect(() => {
    if (editingFeature || editingPlan) setIsDirty(true);
    else setIsDirty(false);
  }, [editingFeature, editingPlan]);

  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
    return (
      <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          <i className="fas fa-lock text-3xl"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-500 font-medium">This sector is reserved for verified administrators only. Please sign in with appropriate credentials to continue.</p>
      </div>
    );
  }

  // --- Reusable Confirm Helper ---
  const requestConfirm = (config: ConfirmConfig) => setConfirmConfig(config);

  // --- Feature Handlers ---
  const saveAndCloseFeatureModal = () => {
    if (editingFeature) {
      if (isAddingNew) addFeature(editingFeature);
      else updateFeature(editingFeature);
      setEditingFeature(null);
      setIsAddingNew(false);
    }
  };

  const handleCloseFeatureEditor = () => {
    if (isDirty) {
      requestConfirm({
        title: "Unsaved Changes",
        message: "You have pending edits in this service definition. Closing now will discard these changes forever.",
        actionLabel: "Discard Edits",
        variant: 'warning',
        onConfirm: () => { setEditingFeature(null); setIsAddingNew(false); }
      });
    } else {
      setEditingFeature(null);
      setIsAddingNew(false);
    }
  };

  const startNewFeature = () => {
    const newFeature: Feature = {
      id: `feat-${Date.now()}`,
      name: '',
      description: '',
      category: CategoryType.PRODUCTIVITY,
      link: ''
    };
    setEditingFeature(newFeature);
    setIsAddingNew(true);
    setIsDirty(false);
  };

  // --- Plan Handlers ---
  const saveAndClosePlanModal = () => {
    if (editingPlan) {
      if (isAddingNew) addPlan(editingPlan);
      else updatePlan(editingPlan);
      setEditingPlan(null);
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

  const startNewPlan = () => {
    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      name: '',
      type: 'Enterprise',
      price: '$0.00',
      priceINR: '₹0',
      color: '#000000',
      description: '',
      features: []
    };
    setEditingPlan(newPlan);
    setIsAddingNew(true);
    setIsDirty(false);
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

  const handleTabSwitch = (tab: 'features' | 'plans' | 'users') => {
    if (isDirty) {
      requestConfirm({
        title: "Discard Current Session?",
        message: "Switching tabs will lose any unsaved edits in the current editor.",
        actionLabel: "Switch Tab",
        variant: 'warning',
        onConfirm: () => {
          setEditingFeature(null);
          setEditingPlan(null);
          setIsAddingNew(false);
          setActiveTab(tab);
        }
      });
    } else {
      setActiveTab(tab);
    }
  };

  // --- Tier Logic Handlers (Feature Modal) ---
  const handleUpdateCapability = (tierIdx: number, capIdx: number, value: string) => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    const updated = JSON.parse(JSON.stringify(editingFeature));
    updated.tierComparison.tiers[tierIdx].capabilities[capIdx] = value;
    setEditingFeature(updated);
  };

  const handleAddCapability = (tierIdx: number) => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    const updated = JSON.parse(JSON.stringify(editingFeature));
    updated.tierComparison.tiers[tierIdx].capabilities.push('');
    setEditingFeature(updated);
  };

  const handleRemoveCapability = (tierIdx: number, capIdx: number) => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    requestConfirm({
      title: "Remove Capability?",
      message: "This specific feature detail will be removed from this tier level.",
      actionLabel: "Remove Detail",
      variant: 'danger',
      onConfirm: () => {
        const updated = JSON.parse(JSON.stringify(editingFeature));
        updated.tierComparison.tiers[tierIdx].capabilities.splice(capIdx, 1);
        setEditingFeature(updated);
      }
    });
  };

  const handleToggleIncludedPlan = (tierIdx: number, planId: string) => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    const updated = JSON.parse(JSON.stringify(editingFeature));
    const tier = updated.tierComparison.tiers[tierIdx];
    if (!tier.includedInPlanIds) tier.includedInPlanIds = [];
    if (tier.includedInPlanIds.includes(planId)) {
      tier.includedInPlanIds = tier.includedInPlanIds.filter((id: string) => id !== planId);
    } else {
      tier.includedInPlanIds.push(planId);
    }
    setEditingFeature(updated);
  };

  const handleAddTier = () => {
    if (!editingFeature) return;
    const updated = JSON.parse(JSON.stringify(editingFeature));
    if (!updated.tierComparison) {
      updated.tierComparison = { title: 'Standard vs Premium', tiers: [] };
    }
    updated.tierComparison.tiers.push({
      tierName: `Plan ${updated.tierComparison.tiers.length + 1}`,
      capabilities: ['New feature capability'],
      includedInPlanIds: []
    });
    setEditingFeature(updated);
  };

  const handleRemoveTier = (tierIdx: number) => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    const tierName = editingFeature.tierComparison.tiers[tierIdx].tierName || `Tier ${tierIdx + 1}`;
    
    requestConfirm({
      title: "Permanently Delete Tier?",
      message: `You are about to delete the entire "${tierName}" definition. This includes all its listed capabilities and plan mappings. This cannot be undone.`,
      actionLabel: "Delete Tier",
      variant: 'danger',
      onConfirm: () => {
        const updated = JSON.parse(JSON.stringify(editingFeature));
        updated.tierComparison.tiers.splice(tierIdx, 1);
        if (updated.tierComparison.tiers.length === 0) updated.tierComparison = undefined;
        setEditingFeature(updated);
      }
    });
  };

  const handleTierTitleChange = (val: string) => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    const updated = JSON.parse(JSON.stringify(editingFeature));
    updated.tierComparison.title = val;
    setEditingFeature(updated);
  };

  const handleTierNameChange = (tierIdx: number, val: string) => {
    if (!editingFeature || !editingFeature.tierComparison) return;
    const updated = JSON.parse(JSON.stringify(editingFeature));
    updated.tierComparison.tiers[tierIdx].tierName = val;
    setEditingFeature(updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* ACTION CONFIRM MODAL */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${confirmConfig.variant === 'danger' ? 'bg-red-50 text-red-600 shadow-red-100' : 'bg-amber-50 text-amber-600 shadow-amber-100'}`}>
              <i className={`fas ${confirmConfig.variant === 'danger' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}`}></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{confirmConfig.title}</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">{confirmConfig.message}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { confirmConfig.onConfirm(); setConfirmConfig(null); }}
                className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${confirmConfig.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-100' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'}`}
              >
                {confirmConfig.actionLabel}
              </button>
              <button 
                onClick={() => setConfirmConfig(null)}
                className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-100">
            <i className="fas fa-user-shield"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Control Center</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-500 font-bold text-sm">Operator: <span className="text-blue-600">{currentUser.username}</span></span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => requestConfirm({
            title: "Factory Reset All Data?",
            message: "This will revert all services, license bundles, and technical tiering to system defaults. Custom changes will be lost.",
            actionLabel: "Perform Hard Reset",
            variant: 'danger',
            onConfirm: resetData
          })}
          className="px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
        >
          Factory Reset Data
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3 bg-slate-200/50 p-2 rounded-[1.5rem] w-fit">
        <button 
          onClick={() => handleTabSwitch('features')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'features' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
        >
          <i className="fas fa-list-check mr-2"></i> Features
        </button>
        <button 
          onClick={() => handleTabSwitch('plans')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'plans' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
        >
          <i className="fas fa-box-open mr-2"></i> Plan Bundles
        </button>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[600px]">
        {activeTab === 'features' && (
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <button 
                onClick={startNewFeature}
                className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-200 text-slate-300 group-hover:text-blue-600 group-hover:scale-110 transition-all flex items-center justify-center shadow-sm">
                  <i className="fas fa-plus text-2xl"></i>
                </div>
                <h4 className="text-lg font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-tight">Add New Service</h4>
              </button>

              {features.map(feature => (
                <div key={feature.id} className="p-8 border border-slate-100 rounded-[2.5rem] hover:border-blue-400 hover:shadow-2xl transition-all group bg-slate-50/20 flex flex-col h-full relative">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] rounded-full text-slate-400 shadow-sm">
                      {feature.category}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingFeature(JSON.parse(JSON.stringify(feature)))}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white shadow-md"
                      >
                        <i className="fas fa-pencil text-sm"></i>
                      </button>
                      <button 
                        onClick={() => requestConfirm({
                          title: "Delete Service Capability?",
                          message: `Are you sure you want to completely remove "${feature.name}"? It will be removed from all associated plan bundles and matrices.`,
                          actionLabel: "Delete Feature",
                          variant: 'danger',
                          onConfirm: () => deleteFeature(feature.id)
                        })}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white shadow-md"
                      >
                        <i className="fas fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-3 truncate">{feature.name}</h4>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-6 font-medium">{feature.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <i className="fas fa-link"></i>
                      {feature.link ? 'Linked' : 'No Link'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <button 
                onClick={startNewPlan}
                className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-200 text-slate-300 group-hover:text-blue-600 group-hover:scale-110 transition-all flex items-center justify-center shadow-sm">
                  <i className="fas fa-plus text-2xl"></i>
                </div>
                <h4 className="text-lg font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-tight">Add New Plan</h4>
              </button>

              {plans.map(plan => (
                <div key={plan.id} className="p-8 border border-slate-100 rounded-[2.5rem] hover:border-blue-400 hover:shadow-2xl transition-all group bg-slate-50/20 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: plan.color }} />
                      <span className="px-4 py-1.5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] rounded-full text-slate-400 shadow-sm">
                        {plan.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingPlan(JSON.parse(JSON.stringify(plan)))}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white shadow-md"
                      >
                        <i className="fas fa-pencil text-sm"></i>
                      </button>
                      <button 
                        onClick={() => requestConfirm({
                          title: "Delete License Bundle?",
                          message: `Are you sure you want to remove the "${plan.name}" plan? User comparisons for this plan will be lost.`,
                          actionLabel: "Delete Plan",
                          variant: 'danger',
                          onConfirm: () => deletePlan(plan.id)
                        })}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white shadow-md"
                      >
                        <i className="fas fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-1 truncate">{plan.name}</h4>
                  <div className="flex items-baseline gap-2 mb-3">
                    <p className="text-lg font-black text-blue-600">{plan.price}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{plan.priceINR}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feature Edit Modal */}
      {editingFeature && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden p-12 space-y-10 animate-in zoom-in-95 duration-200 my-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{isAddingNew ? 'Create New Service' : 'Technical Data Override'}</h3>
              </div>
              <button onClick={handleCloseFeatureEditor} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-200 flex items-center justify-center">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-10">
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Base Identity</span>
                    <div className="h-px bg-slate-100 flex-1"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Feature Name</label>
                      <input type="text" value={editingFeature.name} onChange={e => { setEditingFeature({...editingFeature, name: e.target.value}); setIsDirty(true); }} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Module</label>
                      <select value={editingFeature.category} onChange={e => { setEditingFeature({...editingFeature, category: e.target.value as CategoryType}); setIsDirty(true); }} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none">
                        {Object.values(CategoryType).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                      </select>
                    </div>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-7 space-y-10 border-l border-slate-100 pl-12">
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Availability Tiers</span>
                    <div className="h-px bg-slate-100 flex-1 ml-4"></div>
                  </div>
                  {editingFeature.tierComparison ? (
                    <div className="space-y-10">
                      {editingFeature.tierComparison.tiers.map((tier, tIdx) => (
                        <div key={tIdx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 relative group/tier">
                          <button onClick={() => handleRemoveTier(tIdx)} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white text-red-400 hover:text-red-600 transition-all flex items-center justify-center opacity-0 group-hover/tier:opacity-100 shadow-sm"><i className="fas fa-trash-can"></i></button>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">Service Tier Name</label>
                            <input type="text" value={tier.tierName} onChange={e => { handleTierNameChange(tIdx, e.target.value); setIsDirty(true); }} className="w-full bg-white px-6 py-4 rounded-xl text-sm font-black tracking-tight border-2 border-slate-200 outline-none" />
                          </div>
                          <div className="space-y-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tier Specific Payloads:</span>
                            <div className="space-y-3">
                              {tier.capabilities.map((cap, cIdx) => (
                                <div key={cIdx} className="flex gap-2">
                                  <input value={cap} onChange={e => { handleUpdateCapability(tIdx, cIdx, e.target.value); setIsDirty(true); }} className="flex-1 bg-white px-4 py-3 rounded-xl text-xs font-semibold border border-slate-200" />
                                  <button onClick={() => handleRemoveCapability(tIdx, cIdx)} className="w-10 h-10 rounded-xl bg-white text-slate-300 hover:text-red-500 transition-all flex items-center justify-center"><i className="fas fa-times"></i></button>
                                </div>
                              ))}
                              <button onClick={() => handleAddCapability(tIdx)} className="w-full py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2"><i className="fas fa-plus"></i>Append Statement</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button onClick={handleAddTier} className="w-full py-8 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3"><i className="fas fa-layer-group text-2xl"></i><span className="text-xs font-black uppercase tracking-widest">Inject New Capability Level</span></button>
                    </div>
                  ) : (
                    <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30 flex flex-col items-center justify-center gap-6">
                      <button onClick={handleAddTier} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">Enable Tiered Comparison</button>
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="flex gap-4 pt-10 sticky bottom-0 bg-white z-20 py-6 border-t border-slate-100 mt-auto">
              <button onClick={saveAndCloseFeatureModal} className="flex-1 py-6 bg-blue-600 text-white text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100">Apply Overrides</button>
              <button onClick={handleCloseFeatureEditor} className="px-12 py-6 bg-white border-2 border-slate-200 text-slate-700 text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-slate-50 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden p-12 space-y-10 animate-in zoom-in-95 duration-200 my-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{isAddingNew ? 'Inject New License Bundle' : 'Plan Configuration'}</h3>
              </div>
              <button onClick={handleClosePlanEditor} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-200 flex items-center justify-center">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-10">
                <section className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bundle Name</label>
                      <input type="text" value={editingPlan.name} onChange={e => { setEditingPlan({...editingPlan, name: e.target.value}); setIsDirty(true); }} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (USD)</label>
                        <input type="text" value={editingPlan.price} onChange={e => { setEditingPlan({...editingPlan, price: e.target.value}); setIsDirty(true); }} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (INR)</label>
                        <input type="text" value={editingPlan.priceINR} onChange={e => { setEditingPlan({...editingPlan, priceINR: e.target.value}); setIsDirty(true); }} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold" />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-7 space-y-10 border-l border-slate-100 pl-12">
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Inclusion Mapping</span>
                    <div className="h-px bg-slate-100 flex-1 ml-4"></div>
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
              <button onClick={saveAndClosePlanModal} className="flex-1 py-6 bg-blue-600 text-white text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100">Synchronize Bundle</button>
              <button onClick={handleClosePlanEditor} className="px-12 py-6 bg-white border-2 border-slate-200 text-slate-700 text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-slate-50 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
