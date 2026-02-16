
import React, { useState, useMemo } from 'react';
import { Plan, Feature, CategoryType } from '../types';
import { CATEGORY_COLORS } from '../constants';
import FeatureDetailsModal from './FeatureDetailsModal';
import { useData } from '../context/DataContext';

const ComparisonTool: React.FC = () => {
  const { features, plans } = useData();
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([
    plans[2]?.id || '', // BP
    plans[3]?.id || '', // E3
    plans[4]?.id || ''  // E5
  ].filter(Boolean));
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

  const selectedPlans = useMemo(() => 
    plans.filter(p => selectedPlanIds.includes(p.id)),
    [selectedPlanIds, plans]
  );

  const categories = Object.values(CategoryType);

  const togglePlan = (id: string) => {
    setSelectedPlanIds(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(pId => pId !== id) : prev) 
        : [...prev, id]
    );
  };

  const getCellContent = (plan: Plan, feature: Feature) => {
    const hasFeature = plan.features.includes(feature.id);
    if (!hasFeature) return null;

    if (feature.tierComparison) {
      const tier = feature.tierComparison.tiers.find(t => t.includedInPlanIds?.includes(plan.id));
      if (tier) {
        const condensed = tier.tierName.replace('Plan ', 'P').replace('Standard', 'Std').replace('Premium', 'Prem').replace('Business / P1', 'P1/Bus');
        return <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 whitespace-nowrap">{condensed}</span>;
      }
    }

    return (
      <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shadow-sm border border-green-100">
        <i className="fas fa-check text-[10px]"></i>
      </div>
    );
  };

  const exportToCSV = () => {
    // Generate headers
    const headers = ["Category", "Feature", "Description", ...selectedPlans.map(p => `${p.name} (${p.price}/${p.priceINR})`)];
    
    const rows: string[][] = [];
    categories.forEach(cat => {
      const catFeatures = features.filter(f => f.category === cat);
      const filteredFeatures = catFeatures.filter(f => 
        selectedPlans.some(p => p.features.includes(f.id))
      );
      
      filteredFeatures.forEach(f => {
        const row = [cat, f.name, f.description];
        selectedPlans.forEach(plan => {
          const hasFeature = plan.features.includes(f.id);
          if (!hasFeature) {
            row.push("No");
          } else {
            if (f.tierComparison) {
              const tier = f.tierComparison.tiers.find(t => t.includedInPlanIds?.includes(plan.id));
              row.push(tier ? tier.tierName : "Yes");
            } else {
              row.push("Yes");
            }
          }
        });
        rows.push(row);
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `m365_comparison_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `minmax(280px, 2fr) repeat(${selectedPlans.length}, minmax(130px, 1fr))`
  };

  return (
    <div className="space-y-6 print-container">
      <FeatureDetailsModal feature={activeFeature} onClose={() => setActiveFeature(null)} />

      {/* Selection Area */}
      <div className="no-print bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <i className="fas fa-layer-group text-blue-500"></i>
              Configure Matrix
            </h3>
            <div className="flex flex-wrap gap-2">
              {plans.map(p => {
                const isSelected = selectedPlanIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlan(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-50'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300 hover:bg-white'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <i className="fas fa-file-csv"></i>
              CSV Export
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-3 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <i className="fas fa-file-export"></i>
              Export View
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div style={gridStyle} className="min-w-full">
            <div className="contents">
              <div className="p-6 bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-800 sticky left-0 z-30">
                Service & Capability Map
              </div>
              {selectedPlans.map(plan => (
                <div key={plan.id} className="p-6 bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white text-center border-r border-slate-800 last:border-r-0 sticky top-0 z-20">
                  <div className="flex flex-col gap-1">
                    <span className="truncate">{plan.name}</span>
                    <div className="flex flex-col opacity-80">
                      <span className="text-blue-400">{plan.price}</span>
                      <span className="text-[8px] text-slate-400">{plan.priceINR}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="contents divide-y divide-slate-100">
              {categories.map(cat => {
                const catFeatures = features.filter(f => f.category === cat);
                const filteredFeatures = catFeatures.filter(f => 
                  selectedPlans.some(p => p.features.includes(f.id))
                );
                
                if (filteredFeatures.length === 0) return null;

                return (
                  <React.Fragment key={cat}>
                    <div style={{ gridColumn: `span ${selectedPlans.length + 1}` }} className={`${CATEGORY_COLORS[cat]} px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] border-y border-black/5 sticky left-0 z-10`}>
                      {cat}
                    </div>
                    
                    {filteredFeatures.map(f => (
                      <div key={f.id} className="contents group">
                        <div 
                          className="p-6 border-r border-slate-100 flex flex-col gap-1 bg-white sticky left-0 group-hover:bg-slate-50 transition-all cursor-pointer z-10 shadow-[4px_0_15px_rgba(0,0,0,0.02)]"
                          onClick={() => setActiveFeature(f)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors border-b-2 border-transparent group-hover:border-blue-200">
                              {f.name}
                            </span>
                            {f.tierComparison && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-[10px] font-medium text-slate-400 leading-tight group-hover:text-slate-500 transition-all line-clamp-1">{f.description}</p>
                        </div>

                        {selectedPlans.map(plan => {
                          const content = getCellContent(plan, f);
                          return (
                            <div key={plan.id} className="p-6 border-r border-slate-100 flex items-center justify-center group-hover:bg-slate-50/50 transition-colors last:border-r-0">
                              {content ? content : (
                                <div className="text-slate-200 text-[10px]">
                                  <i className="fas fa-minus opacity-20"></i>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTool;
