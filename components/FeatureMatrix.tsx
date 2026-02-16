
import React, { useState, useMemo } from 'react';
import { Plan, Feature, CategoryType } from '../types';
import { CATEGORY_COLORS } from '../constants';
import FeatureDetailsModal from './FeatureDetailsModal';
import { useData } from '../context/DataContext';

interface FeatureMatrixProps {
  plans: Plan[];
}

const FeatureMatrix: React.FC<FeatureMatrixProps> = ({ plans }) => {
  const { features, currentUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const categories = Object.values(CategoryType);
  const allSelectedFeatures = useMemo(() => new Set(plans.flatMap(p => p.features)), [plans]);

  const getFilteredFeatures = (featuresList: Feature[]) => {
    let result = featuresList;
    if (searchTerm.trim()) {
      result = result.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  };

  const categoriesToRender = useMemo(() => {
    if (selectedCategory === 'All') return categories;
    return [selectedCategory as CategoryType];
  }, [selectedCategory, categories]);

  const hasAnyMatches = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return features.some(f => {
      const matchesSearch = !term || f.name.toLowerCase().includes(term) || f.description.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, features]);

  if (plans.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <i className="fas fa-layer-group text-4xl text-slate-300 mb-4"></i>
        <h3 className="text-xl font-semibold text-slate-600">No licenses selected</h3>
        <p className="text-slate-400">Select one or more licenses above to see the combined feature map.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeatureDetailsModal feature={activeFeature} onClose={() => setActiveFeature(null)} />

      {/* Filters Header */}
      <div className="sticky top-16 z-20 bg-[#f8fafc]/95 backdrop-blur-md py-6 -mx-4 px-4 space-y-4 border-b border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-search text-slate-400 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Search capabilities (Security, Teams, DLP)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-11 pr-11 py-3 border border-slate-200 rounded-2xl bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className={`flex items-center justify-between gap-3 px-5 py-3 rounded-2xl border transition-all text-sm font-black uppercase tracking-widest min-w-[200px] ${
                  selectedCategory === 'All' 
                    ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300' 
                    : 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <i className={`fas ${selectedCategory === 'All' ? 'fa-filter' : getCategoryIcon(selectedCategory as CategoryType)}`}></i>
                  {selectedCategory === 'All' ? 'All Modules' : selectedCategory}
                </div>
                <i className={`fas fa-chevron-down text-[10px] transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {isCategoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsCategoryDropdownOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => { setSelectedCategory('All'); setIsCategoryDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          selectedCategory === 'All' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>All Modules</span>
                        {selectedCategory === 'All' && <i className="fas fa-check"></i>}
                      </button>
                      <div className="h-px bg-slate-100 mx-2 my-1"></div>
                      {categories.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => { setSelectedCategory(cat); setIsCategoryDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <i className={`fas ${getCategoryIcon(cat)} w-4 text-center opacity-70`}></i>
                            {cat}
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedCategory === cat ? 'bg-white/20' : 'bg-slate-100'}`}>
                            {features.filter(f => f.category === cat && allSelectedFeatures.has(f.id)).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] whitespace-nowrap">
              Active Map Coverage: <span className="text-blue-600 ml-1">{allSelectedFeatures.size} / {features.length}</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
              className="text-[10px] text-slate-400 hover:text-red-500 font-black uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <i className="fas fa-undo text-[9px]"></i> Reset
            </button>
          </div>
        </div>
      </div>

      {!hasAnyMatches && (searchTerm || selectedCategory !== 'All') ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-3xl">
            <i className="fas fa-search-minus"></i>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">No results matched your filter</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search terms or module selection.</p>
          </div>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} 
            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoriesToRender.map((cat) => {
            const catFeatures = features.filter(f => f.category === cat);
            const filteredCatFeatures = getFilteredFeatures(catFeatures);
            const activeFeatures = filteredCatFeatures.filter(f => allSelectedFeatures.has(f.id));
            const inactiveFeatures = filteredCatFeatures.filter(f => !allSelectedFeatures.has(f.id));

            if (filteredCatFeatures.length === 0) return null;

            return (
              <div key={cat} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-fit transition-all hover:shadow-xl hover:shadow-slate-200/50">
                <div className={`px-6 py-4 border-b font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-between ${CATEGORY_COLORS[cat]}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <i className={`fas ${getCategoryIcon(cat)}`}></i>
                    </div>
                    {cat}
                  </div>
                  <span className="opacity-70 bg-black/5 px-2 py-1 rounded-lg text-[9px]">
                    {activeFeatures.length} Active
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  {activeFeatures.map(f => {
                    const providers = plans.filter(p => p.features.includes(f.id));
                    return (
                      <div 
                        key={f.id} 
                        className="relative flex items-center justify-between p-3.5 rounded-2xl hover:bg-blue-50/50 border border-transparent hover:border-blue-200 transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-md"
                        onClick={() => setActiveFeature(f)}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-5 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-black opacity-50 uppercase text-[9px] tracking-[0.2em] text-blue-300">Feature Details</span>
                            <i className="fas fa-info-circle opacity-30"></i>
                          </div>
                          {f.description}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-slate-900"></div>
                        </div>

                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center text-white text-[10px] shadow-lg shadow-green-100 shrink-0 transition-transform group-hover:scale-110">
                            <i className="fas fa-check"></i>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition-colors truncate">{f.name}</span>
                            {f.tierComparison && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[8px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Tiered</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex -space-x-1.5 items-center ml-4 shrink-0">
                          {providers.map(p => (
                            <div 
                              key={p.id} 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 group-hover:scale-125 hover:z-10 cursor-pointer" 
                              style={{ backgroundColor: p.color }} 
                              title={p.name} 
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {inactiveFeatures.length > 0 && selectedCategory === 'All' && (
                    <div className="pt-4 mt-2 border-t border-slate-50 space-y-2">
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1 mb-1">Inactive Services</div>
                      {inactiveFeatures.slice(0, 5).map(f => (
                        <div 
                          key={f.id} 
                          className="flex items-center gap-3 px-3 py-2 grayscale opacity-40 cursor-not-allowed hover:grayscale-0 hover:opacity-100 hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <div className="w-5 h-5 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-[10px]">
                            <i className="fas fa-times"></i>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 line-through truncate">{f.name}</span>
                        </div>
                      ))}
                      {inactiveFeatures.length > 5 && (
                        <div className="text-[9px] text-slate-300 font-bold text-center pt-1 italic">
                          + {inactiveFeatures.length - 5} more unavailable
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const getCategoryIcon = (cat: CategoryType) => {
  switch (cat) {
    case CategoryType.PRODUCTIVITY: return 'fa-file-alt';
    case CategoryType.SECURITY: return 'fa-shield-alt';
    case CategoryType.COMPLIANCE: return 'fa-balance-scale';
    case CategoryType.MANAGEMENT: return 'fa-cog';
    case CategoryType.VOICE: return 'fa-phone-alt';
    case CategoryType.WINDOWS: return 'fa-desktop';
    default: return 'fa-cube';
  }
};

export default FeatureMatrix;
