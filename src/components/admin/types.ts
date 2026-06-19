import { db } from "@/lib/firebase";

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

export const PROJECT_STATUSES = [
  "Lead",
  "Planning",
  "Design",
  "Development",
  "Testing",
  "Completed",
  "Maintenance",
];

export const TECHNICAL_STACK = {
  frontend: [
    "HTML5",
    "CSS3",
    "JavaScript",
    "TypeScript",
    "React",
    "Bootstrap",
    "Tailwind CSS",
    "Next.js"
  ],
  backend: [
    "Django",
    "Flask",
    "NestJS",
    "REST APIs",
    "Express.js",
    "FastAPI"
  ],
  programmingLanguages: [
    "Python",
    "JavaScript",
    "TypeScript",
    "PHP",
    "SQL"
  ],
  databases: [
    "MongoDB",
    "Firebase",
    "PostgreSQL",
    "MySQL"
  ],
  hostingDeployment: [
    "Render",
    "Netlify",
    "Cloudflare",
    "Vercel",
    "Docker"
  ],
  payments: [
    "Stripe",
    "PayPal",
    "Lemon Squeezy"
  ]
};

export const TECH_STACK_OPTIONS = Array.from(
  new Set(Object.values(TECHNICAL_STACK).flat())
);

export const INFRASTRUCTURE_PROVIDERS = [
  "Hostinger",
  "GoDaddy",
  "Namecheap",
  "Amazon Web Services (AWS)",
  "Cloudinary",
  "Render",
  "Heroku",
  "Firebase",
  "Vercel",
  "Netlify",
  "Cloudflare Pages",
  "Other",
];

export const PAID_STATUSES = ["Paid", "Pending", "Deposit", "Proposal"];

export const normalizeStatus = (statusStr: string | undefined): string => {
  const s = (statusStr || "").toUpperCase();
  if (s === "DRAFT") return "DRAFT";
  if (s === "SENT" || s === "PENDING") return "PENDING";
  if (s === "PAID") return "PAID";
  if (s === "OVERDUE" || s === "UNPAID") return "UNPAID";
  if (s === "CANCELLED" || s === "VOID") return "VOID";
  if (s === "DUPLICATE") return "DUPLICATE";
  return s || "DRAFT";
};

export interface Project {
  id: string;
  title: string;
  titlePt?: string;
  category: string;
  institution?: string;
  year: string;
  image: string;
  shortDescription?: string;
  shortDescriptionPt?: string;
  fullDescription?: string;
  fullDescriptionPt?: string;
  goals?: string;
  goalsPt?: string;
  liveUrl?: string;
  repoUrl?: string;
  techStack?: string[];
  gallery?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
}

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

export interface Host {
  domainName: string;
  providerUrl: string;
  domainProvider: string;
  domainExpiration: string;
  hostingType: "Frontend" | "Backend" | "Database" | "Fullstack" | "Other" | "";
  isHostingFree: boolean;
  isClientProvided?: boolean;
  showDomainExpiration?: boolean;
  isPaymentManagedByCustomer?: boolean;
}

export interface PrototypeEntry {
  id: string;
  title: string;
  embedHtml: string;
}

export interface ClientProject {
  id: string;
  clientId: string;
  projectName: string;
  projectType: string;
  status:
    | "Lead"
    | "Planning"
    | "Design"
    | "Development"
    | "Testing"
    | "Completed"
    | "Maintenance";
  shortDescription: string;
  fullDescription: string;
  techStack: string[];
  liveUrl: string;
  otherUrls?: { label: string; url: string }[];
  providerUrl: string;
  githubUrl: string;
  figmaUrl: string;
  serviceEmail?: string;
  domainName: string;
  domainProvider: string;
  domainExpiration: string;
  hostingType: "Frontend" | "Backend" | "Database" | "Fullstack" | "Other" | "";
  isHostingFree: boolean;
  isClientProvided?: boolean;
  showDomainExpiration?: boolean;
  isPaymentManagedByCustomer?: boolean;
  hosts?: Host[];
  mainImage: string;
  gallery: string[];
  demoVideoUrl: string;
  startDate: string;
  deadline: string;
  deliveryDate: string;
  price: string;
  paidStatus: "Paid" | "Pending" | "Deposit" | "Proposal";
  maintenancePlan: boolean;
  internalNotes: string;
  clientFeedback: string;
  issues: string;
  createdAt?: any;
  updatedAt?: any;
  shareUsername?: string;
  sharePassword?: string;
  isShared?: boolean;
  projectPurpose?: string;
  pagesCount?: string;
  pagesList?: string;
  featuresList?: string;
  wireframes?: string;
  budgetLines?: { item: string; description?: string; cost: number | string; isOptional?: boolean }[];
  shareLanguage?: string;
  expectedDuration?: string;
  onlyShowExpected?: boolean;
  showFullDescription?: boolean;
  showReviewsBox?: boolean;
  prototypesList?: PrototypeEntry[];
  hasManualTesting?: boolean;
  manualTestingUrl?: string;
  hasAutomatedTesting?: boolean;
  automatedTestingUrl?: string;
  feedbacksList?: { id: string; text: string; createdAt: string }[];
  discountPercent?: string | number;
  vatPercent?: string | number;
  applyVat?: boolean;
  customServices?: { id: string; item: string; description?: string; cost: number; isOptional?: boolean; quantity?: number; hours?: number; unitPrice?: number }[];
  hasSubscription?: boolean;
  subscriptionTitle?: string;
  subscriptionDescription?: string;
  subscriptionInterval?: "monthly" | "yearly";
  subscriptionPrice?: string | number;
  subscriptionEnabled?: boolean;
  subscriptionPaid?: boolean;
  subscriptionPaidAt?: string;
  subscriptionCancelled?: boolean;
  subscriptionCancelledBy?: 'customer' | 'admin';
  subFeaturesSlack?: boolean;
  subFeaturesSecurity?: boolean;
  subFeaturesHosting?: boolean;
  subscriptionFeatures?: string[];
  subscriptionPaidCountPriorCancellation?: number | string;
  secondaryBudgetLines?: { item: string; description?: string; cost: number | string; isOptional?: boolean }[];
  secondaryCustomServices?: { id: string; item: string; description?: string; cost: number; isOptional?: boolean; quantity?: number; hours?: number; unitPrice?: number }[];
  secondaryDiscountPercent?: string | number;
  secondaryVatPercent?: string | number;
  secondaryApplyVat?: boolean;
  secondaryPaidStatus?: "Paid" | "Pending" | "Deposit" | "Proposal";
  secondaryPrice?: string;
  termsSubtitle?: string;
  termsDescription?: string;
  termsUrl?: string;
  showTermsButton?: boolean;
}

export interface InvoiceItem {
  description: string;
  details?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId: string;
  invoiceNumber: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  discountRate: number;
  discountAmount: number;
  amount: number;
  currency: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  description: string;
  items: InvoiceItem[];
  applyVat: boolean;
  applyDiscount: boolean;
  showClientVat?: boolean;
  showClientName?: boolean;
  showClientCompany?: boolean;
  notes?: string;
  isSubscription?: boolean;
  subscriptionMonth?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CompanySettings {
  companyName: string;
  freelancerName: string;
  croNumber: string;
  businessType: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
  email: string;
  vatNumber: string;
  logoUrl?: string;
  bankTransferDetails?: string;
  showBankDetails?: boolean;
  revolutDetails?: string;
  revolutLink?: string;
  revolutQrCodeUrl?: string;
  showRevolutDetails?: boolean;
  whatsappNumber?: string;
  whatsappNumberPT?: string;
  showWhatsappButton?: boolean;
  showTrustWidget?: boolean;
  trustWidgetCode?: string;
  showMaintenance?: boolean;
  customPayments?: {
    id: string;
    name: string;
    details: string;
    link: string;
    qrCodeUrl: string;
    show: boolean;
  }[];
  invoicePrefix?: string;
  nextInvoiceNumber?: number;
  autoGenerateInvoices?: boolean;
  updatedAt?: any;
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
  type: "success" | "error" | "info";
}

export const parseFlexibleDate = (dateStr: string | undefined): Date | null => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Try standard Date parsing first
  let d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const parts = trimmed.split(/[-/.]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);

    if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
      if (parts[0].length === 4) {
        d = new Date(p0, p1 - 1, p2);
        if (!isNaN(d.getTime())) return d;
      } else if (parts[2].length === 4) {
        if (p1 <= 12) {
          d = new Date(p2, p1 - 1, p0);
        } else if (p0 <= 12) {
          d = new Date(p2, p0 - 1, p1);
        } else {
          d = new Date(p2, p1 - 1, p0);
        }
        if (!isNaN(d.getTime())) return d;
      } else if (parts[2].length === 2) {
        const year = p2 + 2000;
        if (p1 <= 12) {
          d = new Date(year, p1 - 1, p0);
        } else if (p0 <= 12) {
          d = new Date(year, p0 - 1, p1);
        } else {
          d = new Date(year, p1 - 1, p0);
        }
        if (!isNaN(d.getTime())) return d;
      }
    }
  }

  return null;
};

export const isAssetExpiringSoon = (expirationDate: string | undefined, _isFree?: boolean | string | undefined, _showExp?: boolean | string | undefined) => {
  if (!expirationDate) return false;
  
  const exp = parseFlexibleDate(expirationDate);
  if (!exp || isNaN(exp.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Expiring within 30 days or already expired
  return diffDays <= 30;
};

export const getRenewalTheme = (expirationDate: string, isFree?: boolean) => {
  if (!expirationDate) return "text-white/20";

  const exp = parseFlexibleDate(expirationDate);
  if (!exp || isNaN(exp.getTime())) return "text-white/20";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30)
    return "text-white font-bold bg-red-600 px-2 py-0.5 rounded border border-red-500 uppercase tracking-tighter animate-pulse";

  return "text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase tracking-tighter font-black";
};

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
