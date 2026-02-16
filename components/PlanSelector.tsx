
import React from 'react';
import { Plan } from '../types';
import { useData } from '../context/DataContext';

interface PlanSelectorProps {
  selectedPlanIds: string[];
  onToggle: (id: string) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ selectedPlanIds, onToggle }) => {
  const { plans } = useData();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3 mb-8">
      {plans.map((plan) => {
        const isSelected = selectedPlanIds.includes(plan.id);
        return (
          <button
            key={plan.id}
            onClick={() => onToggle(plan.id)}
            className={`px-3 py-3 rounded-xl text-[11px] font-black transition-all border flex flex-col items-center justify-center text-center gap-2 group relative overflow-hidden h-full ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-100 ring-offset-2'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div 
              className={`w-2 h-2 rounded-full absolute top-2 right-2 ${isSelected ? 'bg-white' : ''}`}
              style={!isSelected ? { backgroundColor: plan.color } : {}}
            />
            <span className="leading-tight uppercase tracking-tighter line-clamp-2">{plan.name}</span>
            <div className="flex flex-col gap-0.5">
              <span className={`text-[9px] font-bold opacity-70 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {plan.price}
              </span>
              <span className={`text-[8px] font-black ${isSelected ? 'text-blue-200' : 'text-blue-600/60'}`}>
                {plan.priceINR}
              </span>
            </div>
            {plan.type === 'Add-on' && (
              <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                Add-on
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PlanSelector;
