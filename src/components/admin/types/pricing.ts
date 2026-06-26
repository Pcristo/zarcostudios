import { ClientProject } from "./project";

export interface PricingPlan {
  id: string;
  nameEn: string;
  namePt: string;
  price: number;
  priceSuffixEn: string;
  priceSuffixPt: string;
  descriptionEn: string;
  descriptionPt: string;
  buttonTextEn: string;
  buttonTextPt: string;
  servicesEn: string[];
  servicesPt: string[];
  show: boolean;
  isHighlighted: boolean;
  discountPercentage: number;
  periodicity: string;
  order: number;
}

export interface PricingSettings {
  showSection: boolean;
}

export interface NewsletterSettings {
  showSection: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: any;
  lang: 'en' | 'pt';
  active?: boolean;
}

export interface Review {
  id: string;
  name: string;
  companyName: string;
  avatar: string;
  reviewTextEn: string;
  reviewTextPt: string;
  lang: "en" | "pt" | "both";
  show: boolean;
  order: number;
  rating: number;
  linkedInUsername?: string;
}

export interface TestimonialsSettings {
  showSection: boolean;
  displayMode: "grid" | "carousel";
}

export type AdminView =
  | "list"
  | "create"
  | "edit"
  | "portfolio-list"
  | "pricing-list"
  | "pricing-form"
  | "clients-list"
  | "clients-form"
  | "clients-view"
  | "client-project-form"
  | "managed-projects-list"
  | "client-project-view"
  | "billing-list"
  | "billing-form"
  | "billing-view"
  | "billing-summary"
  | "subscribers"
  | "subscriptions-view"
  | "reviews-list"
  | "reviews-form"
  | "settings"
  | "trash-bin";

export interface AdminToast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export interface FeedbackAlert {
  id: string;
  text: string;
  createdAt: string;
  project: ClientProject;
}

export interface ExpiringAsset {
  projectId: string;
  projectName: string;
  assetName: string;
  provider: string;
  expirationDate: string;
  isHost: boolean;
  daysRemaining: number;
}
