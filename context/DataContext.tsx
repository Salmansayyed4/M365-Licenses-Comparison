
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Feature, Plan, UserAccount, UserRole } from '../types';
import { FEATURES as INITIAL_FEATURES, PLANS as INITIAL_PLANS } from '../constants';

interface DataContextType {
  features: Feature[];
  plans: Plan[];
  currentUser: UserAccount | null;
  allUsers: UserAccount[];
  updateFeature: (feature: Feature) => void;
  addFeature: (feature: Feature) => void;
  deleteFeature: (id: string) => void;
  updatePlan: (plan: Plan) => void;
  addPlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;
  login: (username: string, role: UserRole) => void;
  logout: () => void;
  approveAdmin: (userId: string) => void;
  deleteUser: (userId: string) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FEATURES: 's_v2_features',
  PLANS: 's_v2_plans',
  USERS: 's_v2_users',
  CURR_USER: 's_v2_curr_user'
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Feature[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEATURES);
    return saved ? JSON.parse(saved) : INITIAL_FEATURES;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    const defaultUsers: UserAccount[] = [
      { id: 'sa-1', username: 'SuperAdmin', role: 'SUPER_ADMIN', isApproved: true }
    ];
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURR_USER);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(features));
  }, [features]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURR_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  const updateFeature = (updated: Feature) => {
    setFeatures(prev => prev.map(f => f.id === updated.id ? JSON.parse(JSON.stringify(updated)) : f));
  };

  const addFeature = (newFeature: Feature) => {
    setFeatures(prev => [...prev, newFeature]);
  };

  const deleteFeature = (id: string) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
  };

  const updatePlan = (updated: Plan) => {
    setPlans(prev => prev.map(p => p.id === updated.id ? JSON.parse(JSON.stringify(updated)) : p));
  };

  const addPlan = (newPlan: Plan) => {
    setPlans(prev => [...prev, newPlan]);
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const login = (username: string, role: UserRole) => {
    const existing = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (existing) {
      if (existing.isApproved || existing.role === 'SUPER_ADMIN') {
        setCurrentUser(existing);
      } else {
        alert("Your admin account is pending approval from the Super Admin.");
      }
    } else {
      const newUser: UserAccount = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        role,
        isApproved: role === 'SUPER_ADMIN' 
      };
      setAllUsers(prev => [...prev, newUser]);
      if (newUser.isApproved) {
        setCurrentUser(newUser);
      } else {
        alert("Registration successful. Access will be granted once the Super Admin approves your account.");
      }
    }
  };

  const logout = () => setCurrentUser(null);

  const approveAdmin = (userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true } : u));
  };

  const deleteUser = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const resetData = () => {
    setFeatures(INITIAL_FEATURES);
    setPlans(INITIAL_PLANS);
  };

  return (
    <DataContext.Provider value={{ 
      features, plans, currentUser, allUsers, 
      updateFeature, addFeature, deleteFeature, updatePlan, addPlan, deletePlan, login, logout, 
      approveAdmin, deleteUser, resetData 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
