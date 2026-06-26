export interface Client {
  id: string;
  fullName: string;
  companyName: string;
  businessType: string;
  industry: string;
  description: string;
  websiteUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  tiktokUrl?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  otherContact?: string;
  streetAddress?: string;
  addressLine2?: string;
  city: string;
  zipCode?: string;
  country: string;
  vatNumber?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const INDUSTRIES = [
  "Information & Communication",
  "Professional Services",
  "Wholesale & Retail Trade",
  "Manufacturing",
  "Construction & Real Estate",
  "Accommodation & Food Services",
  "Arts, Entertainment & Recreation",
  "Education",
  "Human Health & Social Work",
  "Financial & Insurance Activities",
  "Transportation & Storage",
  "Agriculture, Forestry & Fishing",
  "Energy & Utilities",
  "Other Services"
];

export const BUSINESS_TYPES = [
  "Sole Trader (Sole Proprietorship)",
  "Self-Employed Professional",
  "Partnership",
  "Limited Liability Company (Ltd, Lda, GmbH, SARL, SRL, BV, etc.)",
  "Public Limited Company (PLC, SA, AG, NV, etc.)",
  "Cooperative",
  "Non-Profit Organization (NPO)",
  "Association",
  "Foundation",
  "Government Entity",
  "Educational Institution",
  "Branch Office",
  "Holding Company",
  "Startup",
  "SME (Small and Medium-sized Enterprise)",
  "Large Enterprise",
  "Company SA"
];
