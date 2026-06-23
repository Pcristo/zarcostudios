import { AdminView } from "../types";

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

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: any;
  lang: 'en' | 'pt';
  active?: boolean;
}
