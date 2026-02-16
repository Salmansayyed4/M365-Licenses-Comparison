
export enum CategoryType {
  PRODUCTIVITY = 'Productivity',
  SECURITY = 'Security',
  COMPLIANCE = 'Compliance',
  MANAGEMENT = 'Management',
  VOICE = 'Voice & Collab',
  WINDOWS = 'Windows & OS',
  VIVA = 'Employee Experience'
}

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserAccount {
  id: string;
  username: string;
  role: UserRole;
  isApproved: boolean;
}

export interface TierDetail {
  tierName: string;
  capabilities: string[];
  includedInPlanIds?: string[];
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: CategoryType;
  link?: string;
  tierComparison?: {
    title: string;
    tiers: TierDetail[];
  };
}

export interface Plan {
  id: string;
  name: string;
  type: 'Business' | 'Enterprise' | 'Frontline' | 'Add-on';
  price: string;
  priceINR: string;
  color: string;
  features: string[];
  description: string;
}

export interface ComparisonState {
  planIds: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
