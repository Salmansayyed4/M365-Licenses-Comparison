
import React from 'react';
import { Feature } from '../types';
import { PLANS } from '../constants';

interface FeatureDetailsModalProps {
  feature: Feature | null;
  onClose: () => void;
}

const FeatureDetailsModal: React.FC<FeatureDetailsModalProps> = ({ feature, onClose }) => {
  if (!feature) return null;

  // Tier-specific styling configuration
  const getTierStyle = (index: number, total: number) => {
    const isLast = index === total - 1 && total > 1;
    if (isLast) {
      return {
        card: 'bg-gradient-to-br from-indigo-50/60 via-blue-50/40 to-white border-indigo-300 shadow-2xl shadow-indigo-100',
        header: 'text-indigo-600',
        badge: 'bg-indigo-600 text-white shadow-indigo-200',
        icon: 'fa-rocket-launch',
        accent: 'border-indigo-100',
        itemHover: 'hover:bg-indigo-50/50'
      };
    }
    if (index === 1) {
      return {
        card: 'bg-gradient-to-br from-blue-50/50 to-white border-blue-200 shadow-xl shadow-blue-50',
        header: 'text-blue-600',
        badge: 'bg-blue-600 text-white shadow-blue-100',
        icon: 'fa-check-double',
        accent: 'border-blue-100',
        itemHover: 'hover:bg-blue-50/50'
      };
    }
    return {
      card: 'bg-white border-slate-200 shadow-xl shadow-slate-100',
      header: 'text-slate-400',
      badge: 'bg-slate-900 text-white shadow-slate-200',
      icon: 'fa-check',
      accent: 'border-slate-100',
      itemHover: 'hover:bg-slate-50'
    };
  };

  const getCapabilityIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('ai') || t.includes('machine learning') || t.includes('automated') || t.includes('predictive')) return 'fa-microchip-ai';
    if (t.includes('threat') || t.includes('phishing') || t.includes('protection') || t.includes('safe') || t.includes('attack')) return 'fa-shield-halved';
    if (t.includes('simulation') || t.includes('training')) return 'fa-user-graduate';
    if (t.includes('audit') || t.includes('investigation') || t.includes('explorer') || t.includes('analytics')) return 'fa-magnifying-glass-chart';
    if (t.includes('encryption') || t.includes('key')) return 'fa-key';
    if (t.includes('identity') || t.includes('pim') || t.includes('access') || t.includes('conditional')) return 'fa-user-shield';
    if (t.includes('manual') || t.includes('user-driven')) return 'fa-hand-pointer';
    if (t.includes('retention') || t.includes('label')) return 'fa-tag';
    if (t.includes('dlp') || t.includes('data loss')) return 'fa-file-shield';
    if (t.includes('edr') || t.includes('endpoint')) return 'fa-computer';
    if (t.includes('cloud app') || t.includes('casb')) return 'fa-cloud-shield';
    return 'fa-circle-check';
  };

  const isInherited = (cap: string) => {
    const t = cap.toLowerCase();
    return t.includes('all plan') || t.includes('all p1') || t.includes('all p2') || t.includes('includes ') || t.includes('base features');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center relative">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-blue-200">
                {feature.category}
              </span>
              {feature.tierComparison && (
                <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <i className="fas fa-layer-group text-[9px]"></i>
                  Service Progression
                </span>
              )}
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{feature.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 rounded-[1.5rem] bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm hover:rotate-90"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-12 space-y-16 custom-scrollbar bg-white">
          {/* Executive Summary */}
          <section className="relative pl-10">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Core Functional Overview</h3>
            <p className="text-slate-700 leading-relaxed text-xl font-medium max-w-5xl">
              {feature.description} This capability evolves across tiers, shifting from manual administrative tools to sophisticated, AI-driven automated responses as the license level increases.
            </p>
          </section>

          {/* Detailed Tier Matrix */}
          {feature.tierComparison ? (
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                  {feature.tierComparison.title}
                </h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {feature.tierComparison.tiers.map((tier, idx) => {
                  const styles = getTierStyle(idx, feature.tierComparison!.tiers.length);
                  const inheritedCaps = tier.capabilities.filter(isInherited);
                  const uniqueCaps = tier.capabilities.filter(c => !isInherited(c));

                  return (
                    <div 
                      key={idx} 
                      className={`group relative rounded-[3.5rem] p-12 border-2 transition-all duration-500 flex flex-col h-full ${styles.card}`}
                    >
                      {/* Floating Step Number */}
                      <div className="absolute -top-5 -left-5 w-12 h-12 bg-white border-2 border-inherit rounded-2xl flex items-center justify-center text-xs font-black text-slate-900 shadow-xl group-hover:-translate-y-2 transition-transform">
                        {idx + 1}
                      </div>

                      {/* Tier Info */}
                      <div className="mb-10 flex items-start justify-between">
                        <div className="space-y-1">
                          <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${styles.header}`}>
                            M365 Licensing Level {idx + 1}
                          </div>
                          <h4 className="text-3xl font-black text-slate-900 tracking-tight">
                            {tier.tierName}
                          </h4>
                        </div>
                        <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-2xl transition-all group-hover:scale-110 group-hover:rotate-6 ${styles.badge}`}>
                          <i className={`fas ${styles.icon}`}></i>
                        </div>
                      </div>

                      {/* License Availability */}
                      {tier.includedInPlanIds && tier.includedInPlanIds.length > 0 && (
                        <div className={`mb-10 p-6 rounded-[2rem] border-2 bg-white/40 ${styles.accent}`}>
                          <div className="flex items-center gap-2 mb-4">
                            <i className="fas fa-id-card text-xs opacity-30"></i>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entitled Bundles</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {tier.includedInPlanIds.map(pid => {
                              const plan = PLANS.find(p => p.id === pid);
                              return (
                                <div 
                                  key={pid} 
                                  className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-slate-100 text-[11px] font-black text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                >
                                  <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: plan?.color }} />
                                  {plan?.name}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Capabilities Display */}
                      <div className="flex-1 space-y-10">
                        {/* Inheritance Section - Consolidated */}
                        {inheritedCaps.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 px-1">
                              <span className={`text-[9px] font-black uppercase tracking-widest ${styles.header}`}>Foundation Components</span>
                              <div className={`flex-1 h-px opacity-30 ${styles.badge}`}></div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {inheritedCaps.map((cap, i) => (
                                <div key={i} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200">
                                  <i className="fas fa-link text-[8px] opacity-40"></i>
                                  {cap}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Unique Tier Additions */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 px-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {inheritedCaps.length > 0 ? 'Tier-Specific Enhancements' : 'Complete Feature Set'}
                            </span>
                            <div className="flex-1 h-px bg-slate-100"></div>
                          </div>
                          <ul className="grid grid-cols-1 gap-4">
                            {uniqueCaps.map((cap, cIdx) => (
                              <li 
                                key={cIdx} 
                                className={`flex items-start gap-5 p-5 rounded-2xl transition-all duration-300 border border-transparent ${styles.itemHover}`}
                              >
                                <div className={`mt-0.5 flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-base shadow-sm bg-white border border-slate-100 ${styles.header}`}>
                                  <i className={`fas ${getCapabilityIcon(cap)}`}></i>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[13px] leading-snug font-black text-slate-900">
                                    {cap}
                                  </span>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    Technical Capability
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Top-Tier Indicator Badge */}
                      {idx === feature.tierComparison!.tiers.length - 1 && feature.tierComparison!.tiers.length > 1 && (
                        <div className="absolute top-0 right-12 -translate-y-1/2">
                          <div className="bg-indigo-600 text-white text-[9px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.3em] border-4 border-white shadow-2xl flex items-center gap-3">
                            <i className="fas fa-crown text-[10px]"></i>
                            All-Inclusive Tier
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="mx-6 bg-slate-50/50 rounded-[4rem] p-24 border-4 border-dashed border-slate-100 flex flex-col items-center text-center space-y-8">
              <div className="w-28 h-28 rounded-[3rem] bg-white text-blue-600 flex items-center justify-center text-4xl shadow-2xl shadow-slate-200/40">
                <i className="fas fa-cube"></i>
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black text-slate-900 tracking-tight">Unified Service Model</h4>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-semibold">
                  This service is delivered as a standardized, non-tiered capability. Its full technical scope is available universally to all entitled license holders without additional Plan 1 or Plan 2 performance variances.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-12 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-center items-center gap-6">
          {feature.link && (
            <a 
              href={feature.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-5 px-16 py-7 bg-slate-900 text-white rounded-[2.5rem] text-sm font-black hover:bg-blue-600 transition-all shadow-2xl shadow-slate-300 active:scale-95 group"
            >
              Open Technical Documentation
              <i className="fas fa-arrow-right text-xs opacity-40 group-hover:translate-x-1.5 transition-transform"></i>
            </a>
          )}
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-16 py-7 bg-white border-2 border-slate-200 text-slate-700 rounded-[2.5rem] text-sm font-black hover:bg-slate-100 transition-all shadow-sm"
          >
            Return to Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetailsModal;
