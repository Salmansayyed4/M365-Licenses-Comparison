
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Feature, Plan, UserAccount, UserRole, EntraTenantInfo, BillingFrequency, AuthConfig } from '../types';
import { FEATURES as INITIAL_FEATURES, PLANS as INITIAL_PLANS } from '../constants';
import * as msal from '@azure/msal-browser';

interface DataContextType {
  features: Feature[];
  plans: Plan[];
  currentUser: UserAccount | null;
  allUsers: UserAccount[];
  tenantInfo: EntraTenantInfo;
  billingFrequency: BillingFrequency;
  authConfig: AuthConfig;
  setAuthConfig: (config: AuthConfig) => void;
  setBillingFrequency: (freq: BillingFrequency) => void;
  updateFeature: (feature: Feature) => void;
  addFeature: (feature: Feature) => void;
  deleteFeature: (id: string) => void;
  updatePlan: (plan: Plan) => void;
  addPlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;
  loginWithEntra: (role?: UserRole) => Promise<void>;
  logout: () => void;
  approveAdmin: (userId: string) => void;
  deleteUser: (userId: string) => void;
  resetData: () => void;
  syncTenant: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FEATURES: 's_v2_features',
  PLANS: 's_v2_plans',
  USERS: 's_v2_users',
  CURR_USER: 's_v2_curr_user',
  TENANT: 's_v2_tenant',
  BILLING: 's_v2_billing',
  AUTH: 's_v2_auth'
};

const MOCK_TENANT: EntraTenantInfo = {
  tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
  name: 'Contoso Electronics',
  domain: 'contoso.com',
  isVerified: true,
  syncStatus: 'Healthy',
  lastSync: new Date().toISOString()
};

const getInitialAuth = (): AuthConfig => {
  const currentOrigin = window.location.origin;
  return {
    clientId: '',
    tenantId: '',
    redirectUri: currentOrigin,
    isProduction: false
  };
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

  const [tenantInfo, setTenantInfo] = useState<EntraTenantInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TENANT);
    return saved ? JSON.parse(saved) : MOCK_TENANT;
  });

  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILLING);
    return (saved as BillingFrequency) || 'monthly';
  });

  const [authConfig, setAuthConfig] = useState<AuthConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure redirectUri isn't empty if we have a saved config
      if (!parsed.redirectUri) parsed.redirectUri = window.location.origin;
      return parsed;
    }
    return getInitialAuth();
  });

  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    const defaultUsers: UserAccount[] = [
      { 
        id: 'entra-1', 
        username: 'Megan Bowen', 
        email: 'meganb@contoso.com',
        role: 'SUPER_ADMIN', 
        isApproved: true,
        jobTitle: 'Global Administrator',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Megan',
        entraGroups: ['Global Admins', 'IT Infrastructure'],
        tenantId: MOCK_TENANT.tenantId
      }
    ];
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURR_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const msalInstance = useMemo(() => {
    if (!authConfig.isProduction || !authConfig.clientId) return null;
    return new msal.PublicClientApplication({
      auth: {
        clientId: authConfig.clientId,
        authority: `https://login.microsoftonline.com/${authConfig.tenantId || 'common'}`,
        redirectUri: authConfig.redirectUri,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      }
    });
  }, [authConfig]);

  useEffect(() => {
    if (msalInstance) {
      msalInstance.initialize();
    }
  }, [msalInstance]);

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(tenantInfo));
  }, [tenantInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLING, billingFrequency);
  }, [billingFrequency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authConfig));
  }, [authConfig]);

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

  const loginWithEntra = async (requestedRole: UserRole = 'USER') => {
    if (authConfig.isProduction && msalInstance) {
      try {
        const loginResponse = await msalInstance.loginPopup({
          scopes: ['User.Read'],
        });
        
        const account = loginResponse.account;
        const entraUser: UserAccount = {
          id: account.localAccountId,
          username: account.name || 'Microsoft User',
          email: account.username,
          role: 'ADMIN', 
          isApproved: true,
          jobTitle: 'Production Tenant User',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.username}`,
          tenantId: account.tenantId
        };

        setAllUsers(prev => {
          const exists = prev.find(u => u.email === entraUser.email);
          if (exists) return prev;
          return [...prev, entraUser];
        });
        
        setCurrentUser(entraUser);
        setTenantInfo(prev => ({
          ...prev,
          tenantId: account.tenantId,
          name: 'Production Tenant',
          syncStatus: 'Healthy'
        }));
      } catch (err) {
        console.error("Entra ID Production Login Error:", err);
        // Throw it back so the UI can potentially show a help message
        throw err;
      }
      return;
    }

    // Fallback to Mock
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const entraUser: UserAccount = {
          id: `entra-${Math.random().toString(36).substr(2, 9)}`,
          username: requestedRole === 'SUPER_ADMIN' ? 'Megan Bowen' : 'Adele Vance',
          email: requestedRole === 'SUPER_ADMIN' ? 'meganb@contoso.com' : 'adelev@contoso.com',
          role: requestedRole,
          isApproved: true,
          jobTitle: requestedRole === 'SUPER_ADMIN' ? 'Global Administrator' : 'IT Compliance Officer',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${requestedRole}`,
          entraGroups: requestedRole === 'SUPER_ADMIN' ? ['Global Admins'] : ['Compliance Admins'],
          tenantId: tenantInfo.tenantId
        };
        
        setAllUsers(prev => {
          const exists = prev.find(u => u.email === entraUser.email);
          if (exists) return prev;
          return [...prev, entraUser];
        });
        
        setCurrentUser(entraUser);
        resolve();
      }, 1500);
    });
  };

  const syncTenant = () => {
    setTenantInfo(prev => ({
      ...prev,
      lastSync: new Date().toISOString(),
      syncStatus: 'Healthy'
    }));
  };

  const logout = () => {
    if (authConfig.isProduction && msalInstance) {
        msalInstance.logoutPopup();
    }
    setCurrentUser(null);
  }

  const approveAdmin = (userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true } : u));
  };

  const deleteUser = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const resetData = () => {
    setFeatures(INITIAL_FEATURES);
    setPlans(INITIAL_PLANS);
    setAuthConfig(getInitialAuth());
  };

  return (
    <DataContext.Provider value={{ 
      features, plans, currentUser, allUsers, tenantInfo, billingFrequency, setBillingFrequency,
      authConfig, setAuthConfig,
      updateFeature, addFeature, deleteFeature, updatePlan, addPlan, deletePlan, 
      loginWithEntra, logout, approveAdmin, deleteUser, resetData, syncTenant
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
