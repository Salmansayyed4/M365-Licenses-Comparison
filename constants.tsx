
import { Plan, Feature, CategoryType } from './types';

export const FEATURES: Feature[] = [
  // Productivity
  { id: 'p1', name: 'Outlook', description: 'Web and desktop email client.', category: CategoryType.PRODUCTIVITY, link: 'https://www.microsoft.com/en-us/microsoft-365/outlook/' },
  { id: 'p2', name: 'Word', description: 'Advanced word processing.', category: CategoryType.PRODUCTIVITY, link: 'https://www.microsoft.com/en-us/microsoft-365/word' },
  { id: 'p3', name: 'Excel', description: 'Advanced spreadsheets.', category: CategoryType.PRODUCTIVITY, link: 'https://www.microsoft.com/en-us/microsoft-365/excel' },
  { id: 'p4', name: 'PowerPoint', description: 'Dynamic presentations.', category: CategoryType.PRODUCTIVITY, link: 'https://www.microsoft.com/en-us/microsoft-365/powerpoint' },
  { id: 'p5', name: 'OneNote', description: 'Digital note-taking.', category: CategoryType.PRODUCTIVITY, link: 'https://www.microsoft.com/en-us/microsoft-365/onenote' },
  { id: 'p6', name: 'Publisher', description: 'Desktop publishing (PC only).', category: CategoryType.PRODUCTIVITY },
  { id: 'p7', name: 'Access', description: 'Database management (PC only).', category: CategoryType.PRODUCTIVITY },
  { id: 'p9', name: 'Bookings', description: 'Schedule and manage appointments.', category: CategoryType.PRODUCTIVITY },
  { id: 'p10', name: 'Shared Computer Activation', description: 'Deploy M365 Apps to shared devices (VDI/RDS).', category: CategoryType.PRODUCTIVITY },
  { id: 'p8', name: 'Copilot', description: 'AI-powered productivity assistant (add-on).', category: CategoryType.PRODUCTIVITY, link: 'https://www.microsoft.com/en-us/microsoft-365/copilot' },

  // Security - Defender Suite
  { 
    id: 's1', 
    name: 'Defender for Office 365', 
    description: 'Cloud-based email filtering and threat protection.', 
    category: CategoryType.SECURITY, 
    link: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/mdo-deployment-guide',
    tierComparison: {
      title: "Defender for O365: Plan 1 vs Plan 2",
      tiers: [
        {
          tierName: "Plan 1",
          includedInPlanIds: ['m365-bp'],
          capabilities: ["Safe Attachments", "Safe Links", "Anti-phishing protection", "Real-time detections"]
        },
        {
          tierName: "Plan 2",
          includedInPlanIds: ['m365-e5', 'm365-e5-sec'],
          capabilities: ["All Plan 1 features", "Threat Trackers", "Threat Explorer", "Automated Investigation & Response (AIR)", "Attack Simulation Training"]
        }
      ]
    }
  },
  { 
    id: 's3', 
    name: 'Defender for Endpoint', 
    description: 'Enterprise endpoint security platform.', 
    category: CategoryType.SECURITY, 
    tierComparison: {
      title: "Endpoint Protection Tiers",
      tiers: [
        {
          tierName: "Business / P1",
          includedInPlanIds: ['m365-bp', 'm365-e3'],
          capabilities: ["Next-generation protection", "Attack surface reduction", "Manual remediation actions"]
        },
        {
          tierName: "Plan 2",
          includedInPlanIds: ['m365-e5', 'm365-e5-sec'],
          capabilities: ["All P1 features", "Endpoint detection and response (EDR)", "Automated investigation and remediation", "Threat Analytics"]
        }
      ]
    }
  },
  { id: 's8', name: 'Defender for Business', description: 'Enterprise-grade security specially designed for small businesses.', category: CategoryType.SECURITY },
  { id: 's9', name: 'Defender for Identity', description: 'Cloud-based security solution that leverages your on-premises AD signals.', category: CategoryType.SECURITY },
  { id: 's10', name: 'Defender for Cloud Apps', description: 'Cloud Access Security Broker (CASB).', category: CategoryType.SECURITY },

  // Security - Identity
  { 
    id: 's4', 
    name: 'Entra ID (Azure AD)', 
    description: 'Identity and access management.', 
    category: CategoryType.SECURITY, 
    tierComparison: {
      title: "Entra ID P1 vs P2 Capabilities",
      tiers: [
        {
          tierName: "Plan 1 (P1)",
          includedInPlanIds: ['m365-bp', 'm365-e3', 'm365-f1', 'm365-f3'],
          capabilities: ["Conditional Access", "Group-based access management", "Passwordless authentication", "Cloud App Discovery"]
        },
        {
          tierName: "Plan 2 (P2)",
          includedInPlanIds: ['m365-e5', 'm365-e5-sec'],
          capabilities: ["All P1 features", "Identity Protection (Risk-based CA)", "Privileged Identity Management (PIM)", "Access Reviews", "Entitlement Management"]
        }
      ]
    }
  },
  { id: 's6', name: 'Intune', description: 'Cloud-based device management.', category: CategoryType.SECURITY },
  { id: 's7', name: 'Conditional Access', description: 'Policy-based access control.', category: CategoryType.SECURITY },

  // Compliance - Purview Suite
  { 
    id: 'c1', 
    name: 'Information Protection', 
    description: 'Sensitive data labeling and encryption.', 
    category: CategoryType.COMPLIANCE, 
    tierComparison: {
      title: "Manual vs Automatic Labeling",
      tiers: [
        {
          tierName: "Standard",
          includedInPlanIds: ['m365-bp', 'm365-e3', 'm365-f3'],
          capabilities: ["Manual sensitivity labels", "Basic Office 365 DLP", "Manual retention labels"]
        },
        {
          tierName: "Premium",
          includedInPlanIds: ['m365-e5', 'm365-e5-comp'],
          capabilities: ["Automatic sensitivity labeling", "Machine learning classifiers", "Customer Key", "Double Key Encryption"]
        }
      ]
    }
  },
  { 
    id: 'c2', 
    name: 'Data Loss Prevention (DLP)', 
    description: 'Prevent accidental sharing of sensitive information.', 
    category: CategoryType.COMPLIANCE,
    tierComparison: {
      title: "DLP Scopes",
      tiers: [
        {
          tierName: "Standard DLP",
          includedInPlanIds: ['m365-bs', 'm365-e3'],
          capabilities: ["DLP for Exchange Online", "DLP for SharePoint Online", "DLP for OneDrive"]
        },
        {
          tierName: "Advanced DLP",
          includedInPlanIds: ['m365-bp', 'm365-e5', 'm365-e5-comp'],
          capabilities: ["Teams DLP (Chat and Channels)", "Endpoint DLP (Device-level)", "DLP for PowerBI"]
        }
      ]
    }
  },
  { id: 'c7', name: 'Teams DLP', description: 'Protect sensitive data in Teams chats and channel messages.', category: CategoryType.COMPLIANCE },
  { id: 'c8', name: 'Endpoint DLP', description: 'Monitor and protect sensitive items on Windows 10/11 devices.', category: CategoryType.COMPLIANCE },
  { 
    id: 'c3', 
    name: 'eDiscovery', 
    description: 'Legal hold and data searching.', 
    category: CategoryType.COMPLIANCE,
    tierComparison: {
      title: "Standard vs Premium eDiscovery",
      tiers: [
        {
          tierName: "Standard",
          includedInPlanIds: ['m365-e3'],
          capabilities: ["Basic search and export", "Case management", "Hold capabilities"]
        },
        {
          tierName: "Premium",
          includedInPlanIds: ['m365-e5', 'm365-e5-comp'],
          capabilities: ["Predictive coding", "Review sets", "Advanced analytics", "Custodian management"]
        }
      ]
    }
  },
  { id: 'c4', name: 'Insider Risk Management', description: 'Detect and mitigate internal threats.', category: CategoryType.COMPLIANCE },
  { id: 'c5', name: 'Audit (Standard)', description: 'Standard auditing logs.', category: CategoryType.COMPLIANCE },
  { id: 'c6', name: 'Audit (Premium)', description: 'Advanced auditing and retention (1 year by default).', category: CategoryType.COMPLIANCE },

  // Teams Premium
  { id: 'tp1', name: 'Intelligent Recap (AI)', description: 'AI-generated meeting notes, tasks, and personalized highlights.', category: CategoryType.VOICE },
  { id: 'tp2', name: 'Advanced Webinars', description: 'Registration waitlists, manual approvals, and green rooms.', category: CategoryType.VOICE },
  { id: 'tp3', name: 'Meeting Protection', description: 'Watermarking and End-to-end encryption for meetings.', category: CategoryType.VOICE },
  { id: 'tp4', name: 'Branded Meetings', description: 'Custom meeting backgrounds, lobby themes, and organizational branding.', category: CategoryType.VOICE },

  // Viva Suite
  { id: 'viva1', name: 'Viva Insights (Advanced)', description: 'Organization-wide workplace trends and employee sentiment analysis.', category: CategoryType.VIVA },
  { id: 'viva2', name: 'Viva Goals', description: 'OKR (Objectives and Key Results) management platform.', category: CategoryType.VIVA },
  { id: 'viva3', name: 'Viva Glint', description: 'Advanced employee engagement surveys and analytics.', category: CategoryType.VIVA },
  { id: 'viva4', name: 'Viva Learning', description: 'Enterprise learning management and content aggregation.', category: CategoryType.VIVA },

  // Windows 365
  { id: 'cloudpc1', name: 'Persistent Cloud Desktop', description: 'A personal Windows desktop in the cloud, accessible from any device.', category: CategoryType.WINDOWS },
  { id: 'cloudpc2', name: 'Cross-platform Streaming', description: 'Stream your Windows experience to iPad, Mac, and Android devices.', category: CategoryType.WINDOWS },

  // Management
  { id: 'm1', name: 'SCCM', description: 'System Center Configuration Manager.', category: CategoryType.MANAGEMENT },
  { id: 'm2', name: 'AutoPilot', description: 'Automated device deployment.', category: CategoryType.MANAGEMENT },
  { id: 'm3', name: 'Power Apps (Seeded)', description: 'Low-code app development.', category: CategoryType.MANAGEMENT },
  { id: 'm4', name: 'Power Automate (Seeded)', description: 'Workflow automation.', category: CategoryType.MANAGEMENT },

  // Voice & Collab
  { id: 'v1', name: 'Microsoft Teams', description: 'Unified communication platform.', category: CategoryType.VOICE },
  { id: 'v2', name: 'SharePoint Online', description: 'Content collaboration.', category: CategoryType.VOICE },
  { id: 'v3', name: 'OneDrive for Business', description: 'Cloud storage.', category: CategoryType.VOICE },
  { id: 'v4', name: 'Phone System', description: 'Cloud-based PBX.', category: CategoryType.VOICE },
  { id: 'v5', name: 'Audio Conferencing', description: 'Join meetings via phone dial-in.', category: CategoryType.VOICE },

  // Windows
  { id: 'w1', name: 'Windows 10/11 Enterprise E3', description: 'Advanced Windows OS features.', category: CategoryType.WINDOWS },
  { id: 'w2', name: 'Windows 10/11 Enterprise E5', description: 'Full Windows OS security suite.', category: CategoryType.WINDOWS },
];

export const PLANS: Plan[] = [
  {
    id: 'm365-bb',
    name: 'M365 Business Basic',
    type: 'Business',
    price: '$6.00',
    priceINR: '₹174',
    priceAnnual: '$72.00',
    priceAnnualINR: '₹1,740',
    color: '#00a1f1',
    description: 'Cloud services only. Email, web/mobile versions of apps.',
    features: ['p1', 'p2', 'p3', 'p4', 'p5', 'v1', 'v2', 'v3', 'm3', 'm4']
  },
  {
    id: 'm365-bs',
    name: 'M365 Business Standard',
    type: 'Business',
    price: '$12.50',
    priceINR: '₹925',
    priceAnnual: '$150.00',
    priceAnnualINR: '₹9,240',
    color: '#7fba00',
    description: 'Business apps (Desktop) plus Basic features.',
    features: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p9', 'v1', 'v2', 'v3', 'm3', 'm4', 'c2']
  },
  {
    id: 'm365-bp',
    name: 'M365 Business Premium',
    type: 'Business',
    price: '$22.00',
    priceINR: '₹2,175',
    priceAnnual: '$264.00',
    priceAnnualINR: '₹21,780',
    color: '#0078d4',
    description: 'Advanced security for SMBs. Includes Intune, Defender, and Information Protection.',
    features: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p9', 'p10', 'v1', 'v2', 'v3', 's1', 's3', 's4', 's6', 's7', 's8', 'c1', 'c2', 'c7', 'c8', 'm2', 'm3', 'm4']
  },
  {
    id: 'm365-e3',
    name: 'Microsoft 365 E3',
    type: 'Enterprise',
    price: '$36.00',
    priceINR: '₹3,130',
    priceAnnual: '$432.00',
    priceAnnualINR: '₹31,320',
    color: '#005a9e',
    description: 'Enterprise productivity with standard security and compliance.',
    features: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p9', 'p10', 'v1', 'v2', 'v3', 's3', 's4', 's6', 's7', 'c1', 'c2', 'c3', 'c5', 'm1', 'm2', 'm3', 'm4', 'w1']
  },
  {
    id: 'm365-e5',
    name: 'Microsoft 365 E5',
    type: 'Enterprise',
    price: '$57.00',
    priceINR: '₹5,350',
    priceAnnual: '$684.00',
    priceAnnualINR: '₹53,520',
    color: '#002050',
    description: 'The full suite. Advanced security, compliance, and voice.',
    features: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p9', 'p10', 'v1', 'v2', 'v3', 'v4', 'v5', 's1', 's3', 's4', 's6', 's7', 's9', 's10', 'c1', 'c2', 'c3', 'c4', 'c6', 'c7', 'c8', 'm1', 'm2', 'm3', 'm4', 'w2']
  },
  {
    id: 'm365-e5-sec',
    name: 'M365 E5 Security',
    type: 'Add-on',
    price: '$12.00',
    priceINR: '₹1,000',
    priceAnnual: '$144.00',
    priceAnnualINR: '₹12,000',
    color: '#d13438',
    description: 'Advanced security bundle for E3 customers. Includes P2 versions of security tools.',
    features: ['s1', 's3', 's4', 's9', 's10']
  },
  {
    id: 'm365-e5-comp',
    name: 'M365 E5 Compliance',
    type: 'Add-on',
    price: '$12.00',
    priceINR: '₹1,000',
    priceAnnual: '$144.00',
    priceAnnualINR: '₹12,000',
    color: '#8e44ad',
    description: 'Advanced compliance bundle for E3 customers. Automated labeling, advanced eDiscovery.',
    features: ['c1', 'c2', 'c3', 'c4', 'c6', 'c7', 'c8']
  },
  {
    id: 'm365-teams-prem',
    name: 'Teams Premium',
    type: 'Add-on',
    price: '$7.00',
    priceINR: '₹585',
    priceAnnual: '$84.00',
    priceAnnualINR: '₹7,020',
    color: '#6264a7',
    description: 'AI-powered meetings, advanced protection, and branding.',
    features: ['tp1', 'tp2', 'tp3', 'tp4']
  },
  {
    id: 'm365-viva-suite',
    name: 'Viva Suite',
    type: 'Add-on',
    price: '$12.00',
    priceINR: '₹1,000',
    priceAnnual: '$144.00',
    priceAnnualINR: '₹12,000',
    color: '#ffb900',
    description: 'Full employee experience platform including Insights, Goals, and Learning.',
    features: ['viva1', 'viva2', 'viva3', 'viva4']
  },
  {
    id: 'm365-teams-phone',
    name: 'Teams Phone',
    type: 'Add-on',
    price: '$8.00',
    priceINR: '₹670',
    priceAnnual: '$96.00',
    priceAnnualINR: '₹8,040',
    color: '#464775',
    description: 'Cloud PBX capabilities for Microsoft Teams.',
    features: ['v4', 'v5']
  },
  {
    id: 'm365-cloud-pc',
    name: 'Windows 365',
    type: 'Add-on',
    price: '$28.00',
    priceINR: '₹2,340',
    priceAnnual: '$336.00',
    priceAnnualINR: '₹28,080',
    color: '#004e8c',
    description: 'Windows desktop in the cloud, accessible from any device.',
    features: ['cloudpc1', 'cloudpc2']
  },
  {
    id: 'm365-f1',
    name: 'Microsoft 365 F1',
    type: 'Frontline',
    price: '$2.25',
    priceINR: '₹185',
    priceAnnual: '$27.00',
    priceAnnualINR: '₹2,220',
    color: '#4b5320',
    description: 'Frontline baseline. Teams and security features.',
    features: ['v1', 's4', 's6', 's7']
  },
  {
    id: 'm365-f3',
    name: 'Microsoft 365 F3',
    type: 'Frontline',
    price: '$8.00',
    priceINR: '₹660',
    priceAnnual: '$96.00',
    priceAnnualINR: '₹7,920',
    color: '#107c10',
    description: 'Mobile/web access for frontline workers with productivity tools.',
    features: ['p1', 'p2', 'p3', 'p4', 'v1', 'v2', 'v3', 's4', 's6', 's7', 'c1', 'm2', 'm3', 'm4']
  }
];

export const CATEGORY_COLORS = {
  [CategoryType.PRODUCTIVITY]: 'bg-blue-50 text-blue-700 border-blue-200',
  [CategoryType.SECURITY]: 'bg-red-50 text-red-700 border-red-200',
  [CategoryType.COMPLIANCE]: 'bg-purple-50 text-purple-700 border-purple-200',
  [CategoryType.MANAGEMENT]: 'bg-green-50 text-green-700 border-green-200',
  [CategoryType.VOICE]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [CategoryType.WINDOWS]: 'bg-slate-50 text-slate-700 border-slate-200',
  [CategoryType.VIVA]: 'bg-amber-50 text-amber-700 border-amber-200',
};
