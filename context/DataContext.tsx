
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Feature, Plan, UserAccount, UserRole, EntraTenantInfo, BillingFrequency, AuthConfig, TierDetail, CategoryType } from '../types';
import { FEATURES as INITIAL_FEATURES, PLANS as INITIAL_PLANS } from '../constants';
import * as msal from '@azure/msal-browser';
import { supabase } from '../services/supabase';

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
  resetData: () => Promise<void>;
  syncTenant: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURR_USER: 's_v2_curr_user',
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
  return {
    clientId: '',
    tenantId: '',
    redirectUri: window.location.origin,
    isProduction: false
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Feature[]>(INITIAL_FEATURES);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [tenantInfo, setTenantInfo] = useState<EntraTenantInfo>(MOCK_TENANT);
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>(() => {
    return (localStorage.getItem(STORAGE_KEYS.BILLING) as BillingFrequency) || 'monthly';
  });
  const [authConfig, setAuthConfig] = useState<AuthConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved ? JSON.parse(saved) : getInitialAuth();
  });
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURR_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const getEnv = () => (window as any).process?.env || {};

  // Fetch initial data from Supabase
  const fetchData = async () => {
    try {
      const env = getEnv();
      if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('placeholder')) {
        console.info("Supabase not configured. Using local data context.");
        return;
      }

      // 1. Fetch Features with Tiers
      const { data: feats, error: featError } = await supabase
        .from('features')
        .select(`
          *,
          feature_tiers (
            id,
            tier_name,
            capabilities,
            display_order,
            plan_feature_tiers (plan_id)
          )
        `);

      if (feats && feats.length > 0 && !featError) {
        const mappedFeatures: Feature[] = feats.map(f => ({
          id: f.id,
          name: f.name,
          description: f.description,
          category: f.category as CategoryType,
          link: f.documentation_link,
          tierComparison: f.has_tiers ? {
            title: f.tier_comparison_title || `${f.name} Tier Mapping`,
            tiers: f.feature_tiers.sort((a: any, b: any) => a.display_order - b.display_order).map((t: any) => ({
              tierName: t.tier_name,
              capabilities: t.capabilities,
              includedInPlanIds: t.plan_feature_tiers.map((pt: any) => pt.plan_id)
            }))
          } : undefined
        }));
        setFeatures(mappedFeatures);
      }

      // 2. Fetch Plans
      const { data: pls, error: plError } = await supabase
        .from('plans')
        .select(`
          *,
          plan_features (feature_id)
        `);

      if (pls && pls.length > 0 && !plError) {
        const mappedPlans: Plan[] = pls.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type as any,
          price: `$${p.price_usd_monthly}`,
          priceINR: `₹${p.price_inr_monthly}`,
          priceAnnual: `$${p.price_usd_annual}`,
          priceAnnualINR: `₹${p.price_inr_annual}`,
          color: p.color_code,
          description: p.description,
          features: p.plan_features.map((pf: any) => pf.feature_id)
        }));
        setPlans(mappedPlans);
      }

      // 3. Fetch Tenant
      const { data: tenants } = await supabase.from('tenants').select('*').limit(1);
      if (tenants && tenants[0]) {
        setTenantInfo({
          tenantId: tenants[0].entra_tenant_id,
          name: tenants[0].name,
          domain: tenants[0].domain,
          isVerified: tenants[0].is_verified,
          syncStatus: tenants[0].sync_status as any,
          lastSync: tenants[0].last_sync
        });
      }
    } catch (err) {
      console.warn("Supabase fetch failed. Application falling back to static constants.", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const msalInstance = useMemo(() => {
    if (!authConfig.isProduction || !authConfig.clientId) return null;
    return new msal.PublicClientApplication({
      auth: {
        clientId: authConfig.clientId,
        authority: `https://login.microsoftonline.com/${authConfig.tenantId || 'common'}`,
        redirectUri: authConfig.redirectUri,
      },
      cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false }
    });
  }, [authConfig]);

  useEffect(() => {
    if (msalInstance) msalInstance.initialize();
  }, [msalInstance]);

  // Persistent storage for auth/session only
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURR_USER, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BILLING, billingFrequency); }, [billingFrequency]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authConfig)); }, [authConfig]);

  const updateFeature = async (updated: Feature) => {
    setFeatures(prev => prev.map(f => f.id === updated.id ? updated : f));
    
    try {
      const env = getEnv();
      if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('placeholder')) return;

      await supabase.from('features').upsert({
        id: updated.id,
        name: updated.name,
        description: updated.description,
        category: updated.category,
        documentation_link: updated.link,
        has_tiers: !!updated.tierComparison,
        tier_comparison_title: updated.tierComparison?.title
      });

      if (updated.tierComparison) {
        await supabase.from('feature_tiers').delete().eq('feature_id', updated.id);
        for (let i = 0; i < updated.tierComparison.tiers.length; i++) {
          const tier = updated.tierComparison.tiers[i];
          const { data: newTier } = await supabase.from('feature_tiers').insert({
            feature_id: updated.id,
            tier_name: tier.tierName,
            capabilities: tier.capabilities,
            display_order: i
          }).select().single();

          if (newTier && tier.includedInPlanIds) {
            const links = tier.includedInPlanIds.map(pid => ({
              plan_id: pid,
              tier_id: newTier.id
            }));
            await supabase.from('plan_feature_tiers').insert(links);
          }
        }
      }
    } catch (e) {
      console.error("Supabase sync failed for feature update:", e);
    }
  };

  const addFeature = async (newFeature: Feature) => {
    setFeatures(prev => [...prev, newFeature]);
    await updateFeature(newFeature);
  };

  const deleteFeature = async (id: string) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
    try {
      const env = getEnv();
      if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('placeholder')) return;
      await supabase.from('features').delete().eq('id', id);
    } catch (e) {
      console.error("Supabase delete failed for feature:", e);
    }
  };

  const updatePlan = async (updated: Plan) => {
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
    
    try {
      const env = getEnv();
      if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('placeholder')) return;
      
      const priceClean = (p: string) => parseFloat(p.replace(/[$,₹,]/g, '')) || 0;

      const { error } = await supabase.from('plans').upsert({
        id: updated.id,
        name: updated.name,
        type: updated.type,
        price_usd_monthly: priceClean(updated.price),
        price_inr_monthly: priceClean(updated.priceINR),
        price_usd_annual: priceClean(updated.priceAnnual),
        price_inr_annual: priceClean(updated.priceAnnualINR),
        color_code: updated.color,
        description: updated.description
      });

      if (!error) {
        await supabase.from('plan_features').delete().eq('plan_id', updated.id);
        const featureLinks = updated.features.map(fid => ({
          plan_id: updated.id,
          feature_id: fid
        }));
        await supabase.from('plan_features').insert(featureLinks);
      }
    } catch (e) {
      console.error("Supabase sync failed for plan update:", e);
    }
  };

  const addPlan = async (newPlan: Plan) => {
    setPlans(prev => [...prev, newPlan]);
    await updatePlan(newPlan);
  };

  const deletePlan = async (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    try {
      const env = getEnv();
      if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('placeholder')) return;
      await supabase.from('plans').delete().eq('id', id);
    } catch (e) {
      console.error("Supabase delete failed for plan:", e);
    }
  };

  const loginWithEntra = async (requestedRole: UserRole = 'USER') => {
    if (authConfig.isProduction && msalInstance) {
      try {
        const loginResponse = await msalInstance.loginPopup({ scopes: ['User.Read'] });
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
        setCurrentUser(entraUser);
      } catch (err) {
        console.error("Entra ID Production Login Error:", err);
        throw err;
      }
      return;
    }

    const entraUser: UserAccount = {
      id: `mock-${Date.now()}`,
      username: requestedRole === 'SUPER_ADMIN' ? 'Megan Bowen' : 'Adele Vance',
      email: requestedRole === 'SUPER_ADMIN' ? 'meganb@contoso.com' : 'adelev@contoso.com',
      role: requestedRole,
      isApproved: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${requestedRole}`
    };
    setCurrentUser(entraUser);
  };

  const syncTenant = async () => {
    const lastSync = new Date().toISOString();
    setTenantInfo(prev => ({ ...prev, lastSync, syncStatus: 'Healthy' }));
    try {
      const env = getEnv();
      if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('placeholder')) return;
      await supabase.from('tenants').upsert({ entra_tenant_id: tenantInfo.tenantId, name: tenantInfo.name, domain: tenantInfo.domain, last_sync: lastSync, sync_status: 'Healthy' });
    } catch (e) {
      console.error("Supabase sync failed for tenant status:", e);
    }
  };

  const logout = () => {
    if (authConfig.isProduction && msalInstance) msalInstance.logoutPopup();
    setCurrentUser(null);
  };

  const approveAdmin = (userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true } : u));
  };

  const deleteUser = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const resetData = async () => {
    setFeatures(INITIAL_FEATURES);
    setPlans(INITIAL_PLANS);
    setAuthConfig(getInitialAuth());

    const env = getEnv();
    if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('placeholder')) return;
    
    console.info("Seeding Supabase with initial M365 constants...");
    try {
      for (const feat of INITIAL_FEATURES) {
        await updateFeature(feat);
      }
      for (const plan of INITIAL_PLANS) {
        await updatePlan(plan);
      }
      console.info("Seeding complete.");
    } catch (err) {
      console.error("Failed to seed Supabase:", err);
    }
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
