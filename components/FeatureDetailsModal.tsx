
import React from 'react';
import { Feature } from '../types';
import { PLANS } from '../constants';

interface FeatureDetailsModalProps {
  feature: Feature | null;
  onClose: () => void;
}

const FeatureDetailsModal: React.FC<FeatureDetailsModalProps> = ({ feature, onClose }) => {
  if (!feature) return null;

  // Helper to determine capability icon based on keywords
  const getCapabilityIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('ai') || t.includes('machine learning') || t.includes('automated')) return 'fa-robot';
    if (t.includes('threat') || t.includes('phishing') || t.includes('protection') || t.includes('safe')) return 'fa-shield-halved';
    if (t.includes('simulation') || t.includes('training')) return 'fa-user-graduate';
    if (t.includes('audit') || t.includes('investigation') || t.includes('explorer')) return 'fa-magnifying-glass-chart';
    if (t.includes('encryption') || t.includes('key')) return 'fa-key';
    if (t.includes('identity') || t.includes('pim') || t.includes('access')) return 'fa-user-shield';
    if (t.includes('manual') || t.includes('user-driven')) return 'fa-hand-pointer';
    if (t.includes('retention') || t.includes('label')) return 'fa-tag';
    return 'fa-check';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center relative">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.25em] shadow-lg shadow-blue-200">
                {feature.category}
              </span>
              {feature.tierComparison && (
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.25em]">
                  Tiered Mapping
                </span>
              )}
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{feature.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm hover:rotate-90"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar bg-white">
          {/* Description Section */}
          <section className="relative px-6">
            <div className="absolute left-0 top-1 bottom-1 w-1.5 bg-blue-500 rounded-full"></div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Functional Definition</h3>
            <p className="text-slate-700 leading-relaxed text-lg font-medium max-w-4xl">
              {feature.description} This service scales across different Microsoft 365 licensing tiers to provide varying levels of granularity, automation, and security oversight.
            </p>
          </section>

          {/* Tiers Comparison Section */}
          {feature.tierComparison ? (
            <section className="space-y-8">
              <div className="flex items-center gap-6 px-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">
                  {feature.tierComparison.title}
                </h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-6">
                {feature.tierComparison.tiers.map((tier, idx) => {
                  const isPlan2 = idx === 1;
                  return (
                    <div 
                      key={idx} 
                      className={`group relative rounded-[3rem] p-10 border-2 transition-all duration-500 flex flex-col h-full ${
                        isPlan2 
                          ? 'bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-white border-blue-400 shadow-2xl shadow-blue-100' 
                          : 'bg-white border-slate-200 shadow-xl shadow-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {/* Tier Identifier Badge */}
                      <div className="mb-8 flex items-center justify-between">
                        <div>
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isPlan2 ? 'text-blue-600' : 'text-slate-400'}`}>
                            Tier Level {idx + 1}
                          </div>
                          <h4 className={`text-2xl font-black tracking-tight ${isPlan2 ? 'text-blue-900' : 'text-slate-900'}`}>
                            {tier.tierName}
                          </h4>
                        </div>
                        <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-lg ${
                          isPlan2 ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-900 text-white shadow-slate-200'
                        }`}>
                          <i className={`fas ${isPlan2 ? 'fa-rocket' : 'fa-check-double'}`}></i>
                        </div>
                      </div>

                      {/* Included in Licenses Section */}
                      {tier.includedInPlanIds && tier.includedInPlanIds.length > 0 && (
                        <div className={`mb-10 p-6 rounded-[2rem] border transition-colors ${
                          isPlan2 ? 'bg-white/80 border-blue-100' : 'bg-slate-50 border-slate-100'
                        }`}>
                          <div className="flex items-center gap-2 mb-4">
                            <i className="fas fa-id-card text-xs opacity-40"></i>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available in Licenses:</span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {tier.includedInPlanIds.map(pid => {
                              const plan = PLANS.find(p => p.id === pid);
                              return (
                                <div 
                                  key={pid} 
                                  className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                                >
                                  <div className="w-3 h-3 rounded-full shadow-inner ring-2 ring-slate-50" style={{ backgroundColor: plan?.color }} />
                                  {plan?.name}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Capabilities List */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Capabilities</span>
                          <div className={`flex-1 h-0.5 ${isPlan2 ? 'bg-blue-100' : 'bg-slate-100'}`}></div>
                        </div>
                        <ul className="space-y-4">
                          {tier.capabilities.map((cap, cIdx) => {
                            const icon = getCapabilityIcon(cap);
                            const isModifier = cap.toLowerCase().includes('all plan 1');
                            
                            return (
                              <li 
                                key={cIdx} 
                                className={`flex items-start gap-5 p-4 rounded-2xl transition-all duration-300 ${
                                  isModifier 
                                    ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' 
                                    : (isPlan2 ? 'hover:bg-blue-100/30' : 'hover:bg-slate-100/50')
                                }`}
                              >
                                <div className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-sm ${
                                  isModifier 
                                    ? 'bg-white/10' 
                                    : (isPlan2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600')
                                }`}>
                                  <i className={`fas ${icon}`}></i>
                                </div>
                                <div className="space-y-1">
                                  <span className={`text-sm leading-tight font-black ${isModifier ? 'text-white' : 'text-slate-800'}`}>
                                    {cap}
                                  </span>
                                  {!isModifier && (
                                    <p className={`text-[11px] font-semibold tracking-tight ${isPlan2 ? 'text-blue-500' : 'text-slate-400'}`}>
                                      {isPlan2 ? 'Advanced Governance' : 'Standard Inclusion'}
                                    </p>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Bottom Accent */}
                      {isPlan2 && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="bg-slate-900 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] border-4 border-white shadow-2xl">
                            Enterprise Plus
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="mx-6 bg-slate-50 rounded-[4rem] p-20 border-2 border-dashed border-slate-200 flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white text-blue-600 flex items-center justify-center text-4xl shadow-2xl shadow-slate-200/50">
                <i className="fas fa-boxes-stacked"></i>
              </div>
              <div className="space-y-3">
                <h4 className="text-3xl font-black text-slate-900 tracking-tight">Standard Shared Capability</h4>
                <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed font-semibold">
                  This feature represents a foundational service within the Microsoft 365 ecosystem. Its core functionality is delivered consistently across all licenses that support it, with no differentiated Plan 1 or Plan 2 tiers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-center items-center gap-6">
          {feature.link && (
            <a 
              href={feature.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-4 px-14 py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95 group"
            >
              Access Official Documentation
              <i className="fas fa-external-link-alt text-xs opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
            </a>
          )}
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-12 py-6 bg-white border-2 border-slate-200 text-slate-700 rounded-[2rem] text-sm font-black hover:bg-slate-100 transition-all shadow-sm"
          >
            Close Navigator
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetailsModal;
