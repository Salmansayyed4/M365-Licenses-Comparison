
import React, { useState, useMemo } from 'react';
import { Plan, Feature, CategoryType } from '../types.ts';
import { CATEGORY_COLORS } from '../constants.tsx';
import FeatureDetailsModal from './FeatureDetailsModal.tsx';
import { useData } from '../context/DataContext.tsx';

interface FeatureMatrixProps {
  plans: Plan[];
}

const FeatureMatrix: React.FC<FeatureMatrixProps> = ({ plans }) => {
  const { features } = useData();
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

  return (
    <div className="space-y-6">
      <FeatureDetailsModal feature={activeFeature} onClose={() => setActiveFeature(null)} />

      <div className="sticky top-16 z-20 bg-[#f8fafc]/95 backdrop-blur-md py-6 -mx-4 px-4 space-y-4 border-b border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search capabilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-11 pr-11 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoriesToRender.map((cat) => {
          const catFeatures = features.filter(f => f.category === cat);
          const filteredCatFeatures = getFilteredFeatures(catFeatures);
          const activeFeatures = filteredCatFeatures.filter(f => allSelectedFeatures.has(f.id));

          if (activeFeatures.length === 0) return null;

          return (
            <div key={cat} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-fit">
              <div className={`px-6 py-4 border-b font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-between ${CATEGORY_COLORS[cat]}`}>
                <div className="flex items-center gap-3">
                  <i className={`fas ${getCategoryIcon(cat)}`}></i>
                  {cat}
                </div>
              </div>
              <div className="p-6 space-y-3">
                {activeFeatures.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-blue-50/50 border border-transparent hover:border-blue-200 transition-all cursor-pointer group" onClick={() => setActiveFeature(f)}>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center text-white text-[10px]">
                        <i className="fas fa-check"></i>
                      </div>
                      <span className="text-xs font-black text-slate-800">{f.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureMatrix;
