import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
} from "@/lib/firebase";
import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  RotateCcw,
  LayoutDashboard,
  LogOut,
  Star,
  Euro,
  Percent,
  AlertCircle,
  Calculator,
  FolderRoot,
  Settings,
  Image as ImageIcon,
  Globe,
  Github,
  Code2,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronDown,
  Upload,
  Loader2,
  X,
  Users,
  Instagram,
  Facebook,
  Linkedin,
  ExternalLink,
  Link as LinkIcon,
  Archive,
  Calendar,
  Check,
  FileText,
  Receipt,
  Download,
  BarChart3,
  Mail,
  Send,
  Save,
  Target as LangIcon,
  LayoutList,
  Grid3X3,
  MessageSquare,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  CreditCard,
} from "lucide-react";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { AdminTrashBin } from "./components/AdminTrashBin";
import { AdminSettings } from "./components/Settings/AdminSettings";
import { AdminReviews } from "./components/Reviews/AdminReviews";
import { AdminPricing } from "./components/Billing/AdminPricing";
import { AdminPortfolio } from "./components/Projects/AdminPortfolio";
import { AdminSubscriptions } from "./components/Billing/AdminSubscriptions";
import { AdminSubscribers } from "./components/Newsletter/AdminSubscribers";
import { AdminAttentionRequired } from "./components/AdminAttentionRequired";
import { AdminStatsGrid } from "./components/AdminStatsGrid";
import { AdminQuickNav } from "./components/AdminQuickNav";
import { AdminClients } from "./components/Clients/AdminClients";
import { AdminProjects } from "./components/Projects/AdminProjects";
import { AdminBilling } from "./components/Billing/AdminBilling";

const INDUSTRIES = [
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

const BUSINESS_TYPES = [
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

const PROJECT_STATUSES = [
  "Lead",
  "Planning",
  "Design",
  "Development",
  "Testing",
  "Completed",
  "Maintenance",
];
const TECHNICAL_STACK = {
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
const TECH_STACK_OPTIONS = Array.from(
  new Set(Object.values(TECHNICAL_STACK).flat())
);
const INFRASTRUCTURE_PROVIDERS = [
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
const PAID_STATUSES = ["Paid", "Pending", "Deposit", "Proposal"];

const normalizeStatus = (statusStr: string | undefined): string => {
  const s = (statusStr || "").toUpperCase();
  if (s === "DRAFT") return "DRAFT";
  if (s === "SENT" || s === "PENDING") return "PENDING";
  if (s === "PAID") return "PAID";
  if (s === "OVERDUE" || s === "UNPAID") return "UNPAID";
  if (s === "CANCELLED" || s === "VOID") return "VOID";
  if (s === "DUPLICATE") return "DUPLICATE";
  return s || "DRAFT";
};

interface Project {
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

interface PricingPlan {
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

interface PricingSettings {
  showSection: boolean;
}

interface NewsletterSettings {
  showSection: boolean;
}

interface Client {
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

interface Host {
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

interface PrototypeEntry {
  id: string;
  title: string;
  embedHtml: string;
}

interface ClientProject {
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
  subFeaturesSlack?: boolean;
  subFeaturesSecurity?: boolean;
  subFeaturesHosting?: boolean;
  subscriptionFeatures?: string[];
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

interface InvoiceItem {
  description: string;
  details?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
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

interface CompanySettings {
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

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: any;
  lang: 'en' | 'pt';
  active?: boolean;
}

interface Review {
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

interface TestimonialsSettings {
  showSection: boolean;
  displayMode: "grid" | "carousel";
}

type AdminView =
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

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<AdminView>("list");
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [subFilterStatus, setSubFilterStatus] = useState<"all" | "active" | "pending" | "cancelled">("all");
  
  interface AdminToast {
    id: string;
    type: 'success' | 'error' | 'warning';
    message: string;
  }
  const [adminToasts, setAdminToasts] = useState<AdminToast[]>([]);
  const [hasShownExpiringToast, setHasShownExpiringToast] = useState(false);

  const showAdminToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setAdminToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAdminToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null); // 'main' or 'gallery'
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    showSection: true,
  });
  const [newsletterSettings, setNewsletterSettings] = useState<NewsletterSettings>({
    showSection: true,
  });
  const [savingPricing, setSavingPricing] = useState(false);
  const [planConfirmingDelete, setPlanConfirmingDelete] = useState<string | null>(null);
  const [invoiceConfirmingDelete, setInvoiceConfirmingDelete] = useState<string | null>(null);
  const [projectConfirmingDelete, setProjectConfirmingDelete] = useState<string | null>(null);
  const [clientConfirmingDelete, setClientConfirmingDelete] = useState<string | null>(null);
  const [clientProjectConfirmingDelete, setClientProjectConfirmingDelete] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [testimonialsSettings, setTestimonialsSettings] = useState<TestimonialsSettings>({
    showSection: true,
    displayMode: "grid"
  });
  const [reviewConfirmingDelete, setReviewConfirmingDelete] = useState<string | null>(null);

  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");

  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);
  const [savingClient, setSavingClient] = useState(false);

  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [editingClientProject, setEditingClientProject] =
    useState<ClientProject | null>(null);
  const [showAdminUnsubscribeModal, setShowAdminUnsubscribeModal] = useState<boolean>(false);
  const [newSubscriptionFeature, setNewSubscriptionFeature] = useState<string>("");
  const [isDetailedScopeOpen, setIsDetailedScopeOpen] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [seenFeedbackIds, setSeenFeedbackIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("zarco_seen_feedback_ids") || "[]");
    } catch {
      return [];
    }
  });
  const [seenReviewIds, setSeenReviewIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("zarco_seen_review_ids") || "[]");
    } catch {
      return [];
    }
  });
  const [seenExpiringAssetIds, setSeenExpiringAssetIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("zarco_seen_expiring_asset_ids") || "[]");
    } catch {
      return [];
    }
  });
  const [seenSubscriptionSignatures, setSeenSubscriptionSignatures] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("zarco_seen_subscription_signatures") || "[]");
    } catch {
      return [];
    }
  });
  const [showAdminEstimatorModal, setShowAdminEstimatorModal] = useState(false);
  const [showFullDescModal, setShowFullDescModal] = useState(false);
  const [adminEstimatorMode, setAdminEstimatorMode] = useState<string>('primary');
  const [adminPricingActiveTab, setAdminPricingActiveTab] = useState<string>('primary');
  const [adminNewServiceName, setAdminNewServiceName] = useState("");
  const [adminNewServiceDesc, setAdminNewServiceDesc] = useState("");
  const [adminNewServiceCost, setAdminNewServiceCost] = useState("");
  const [adminNewServiceIsOptional, setAdminNewServiceIsOptional] = useState(false);
  const [adminNewServiceQuantity, setAdminNewServiceQuantity] = useState("1");
  const [adminNewServiceHours, setAdminNewServiceHours] = useState("");
  const [adminSelectedAddons, setAdminSelectedAddons] = useState<Record<number, boolean>>({});
  const [shareLanguage, setShareLanguage] = useState<"en" | "pt">("en");
  const [savingClientProject, setSavingClientProject] = useState(false);
  const [loadingClientProjects, setLoadingClientProjects] = useState(false);
  const [showPortalPassword, setShowPortalPassword] = useState(false);
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);

  // Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [isDeletingSubscriber, setIsDeletingSubscriber] = useState<string | null>(null);
  const [editingNewsletterId, setEditingNewsletterId] = useState<string | null>(null);

  const getProjectPhases = (proj: any) => {
    if (!proj) return [];
    const phases: any[] = [];
    
    phases.push({
      id: 'primary',
      title: 'Phase 1',
      budgetLines: proj.budgetLines || [],
      customServices: proj.customServices || [],
      discountPercent: proj.discountPercent || "0",
      applyVat: proj.applyVat !== false,
      vatPercent: proj.vatPercent !== undefined ? proj.vatPercent : "23",
      paidStatus: proj.paidStatus || "Pending",
      price: proj.price || ""
    });

    const hasSec = (proj.secondaryBudgetLines && proj.secondaryBudgetLines.length > 0) || 
                   (proj.secondaryCustomServices && proj.secondaryCustomServices.length > 0) || 
                   proj.secondaryPrice || 
                   proj.hasSecondaryPhase;
                   
    if (hasSec) {
      phases.push({
        id: 'secondary',
        title: 'Phase 2',
        budgetLines: proj.secondaryBudgetLines || [],
        customServices: proj.secondaryCustomServices || [],
        discountPercent: proj.secondaryDiscountPercent || "0",
        applyVat: proj.secondaryApplyVat !== false,
        vatPercent: proj.secondaryVatPercent !== undefined ? proj.secondaryVatPercent : "23",
        paidStatus: proj.secondaryPaidStatus || "Pending",
        price: proj.secondaryPrice || ""
      });
    }

    if (proj.additionalPhases && Array.isArray(proj.additionalPhases)) {
      proj.additionalPhases.forEach((phase: any, index: number) => {
        phases.push({
          id: `phase_${index}`,
          title: phase.title || `Phase ${index + 3}`,
          budgetLines: phase.budgetLines || [],
          customServices: phase.customServices || [],
          discountPercent: phase.discountPercent || "0",
          applyVat: phase.applyVat !== false,
          vatPercent: phase.vatPercent !== undefined ? phase.vatPercent : "23",
          paidStatus: phase.paidStatus || "Pending",
          price: phase.price || ""
        });
      });
    }

    return phases;
  };

  const updateProjectPhase = (proj: any, phaseId: string, updates: any) => {
    if (!proj) return proj;
    const newProj = { ...proj };
    
    if (phaseId === 'primary') {
      if (updates.budgetLines !== undefined) newProj.budgetLines = updates.budgetLines;
      if (updates.customServices !== undefined) newProj.customServices = updates.customServices;
      if (updates.discountPercent !== undefined) newProj.discountPercent = updates.discountPercent;
      if (updates.applyVat !== undefined) newProj.applyVat = updates.applyVat;
      if (updates.vatPercent !== undefined) newProj.vatPercent = updates.vatPercent;
      if (updates.paidStatus !== undefined) newProj.paidStatus = updates.paidStatus;
      if (updates.price !== undefined) newProj.price = updates.price;
    } else if (phaseId === 'secondary') {
      newProj.hasSecondaryPhase = true;
      if (updates.budgetLines !== undefined) newProj.secondaryBudgetLines = updates.budgetLines;
      if (updates.customServices !== undefined) newProj.secondaryCustomServices = updates.customServices;
      if (updates.discountPercent !== undefined) newProj.secondaryDiscountPercent = updates.discountPercent;
      if (updates.applyVat !== undefined) newProj.secondaryApplyVat = updates.applyVat;
      if (updates.vatPercent !== undefined) newProj.secondaryVatPercent = updates.vatPercent;
      if (updates.paidStatus !== undefined) newProj.secondaryPaidStatus = updates.secondaryPaidStatus !== undefined ? updates.secondaryPaidStatus : updates.paidStatus;
      if (updates.price !== undefined) newProj.secondaryPrice = updates.price;
    } else if (phaseId.startsWith('phase_')) {
      const idx = parseInt(phaseId.split('_')[1], 10);
      const api = [...(newProj.additionalPhases || [])];
      if (api[idx]) {
        api[idx] = {
          ...api[idx],
          ...updates
        };
        newProj.additionalPhases = api;
      }
    }
    return newProj;
  };

  const updateEstimatorActivePhaseFields = (proj: any, updates: any) => {
    if (!proj) return proj;
    const newProj = { ...proj };
    const phaseId = adminEstimatorMode;
    
    if (phaseId === 'primary') {
      if (updates.discountPercent !== undefined) newProj.discountPercent = updates.discountPercent;
      if (updates.applyVat !== undefined) newProj.applyVat = updates.applyVat;
      if (updates.vatPercent !== undefined) newProj.vatPercent = updates.vatPercent;
    } else if (phaseId === 'secondary') {
      if (updates.discountPercent !== undefined) newProj.secondaryDiscountPercent = updates.discountPercent;
      if (updates.applyVat !== undefined) newProj.secondaryApplyVat = updates.applyVat;
      if (updates.vatPercent !== undefined) newProj.secondaryVatPercent = updates.vatPercent;
    } else if (phaseId.startsWith('phase_')) {
      const idx = parseInt(phaseId.split('_')[1], 10);
      const api = [...(newProj.additionalPhases || [])];
      if (api[idx]) {
        api[idx] = {
          ...api[idx],
          ...updates
        };
        newProj.additionalPhases = api;
      }
    }
    return newProj;
  };
  
  // Newsletter State
  const [isComposing, setIsComposing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [savingNewsletter, setSavingNewsletter] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, type: 'subscriber' | 'newsletter', email?: string, lang?: 'en' | 'pt'} | null>(null);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: "",
    content: "",
    lang: "en" as "en" | "pt" | "all" | "selected"
  });
  const [archivedNewsletters, setArchivedNewsletters] = useState<any[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(false);
  const [newsletterTab, setNewsletterTab] = useState<"audience" | "archives">("audience");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [adminProjectSearch, setAdminProjectSearch] = useState("");
  const [adminBillingSearch, setAdminBillingSearch] = useState("");
  const [billingTypeFilter, setBillingTypeFilter] = useState<"all" | "subscription" | "project">("all");
  const [adminClientProjectSearch, setAdminClientProjectSearch] = useState("");

  // Trash Bin / Recycle Bin State
  const [trashItems, setTrashItems] = useState<any[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [trashFilter, setTrashFilter] = useState<"all" | "client" | "project" | "bill">("all");
  const [trashConfirmingDelete, setTrashConfirmingDelete] = useState<string | null>(null);
  const [confirmingEmptyTrash, setConfirmingEmptyTrash] = useState(false);

  // Company Settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: "",
    freelancerName: "",
    croNumber: "",
    businessType: "",
    addressLine1: "",
    addressLine2: "",
    zipCode: "",
    email: "",
    vatNumber: "",
    logoUrl: "",
    bankTransferDetails: "",
    showBankDetails: false,
    revolutDetails: "",
    revolutLink: "",
    revolutQrCodeUrl: "",
    showRevolutDetails: false,
    whatsappNumber: "",
    whatsappNumberPT: "",
    showWhatsappButton: false,
    showTrustWidget: false,
    trustWidgetCode: "",
    showMaintenance: false,
    customPayments: [],
    invoicePrefix: "INV",
    nextInvoiceNumber: 1,
    autoGenerateInvoices: true,
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const initialProjectState = {
    title: "",
    titlePt: "",
    category: "",
    institution: "none",
    year: new Date().getFullYear().toString(),
    image: "",
    shortDescription: "",
    shortDescriptionPt: "",
    fullDescription: "",
    fullDescriptionPt: "",
    goals: "",
    goalsPt: "",
    liveUrl: "",
    repoUrl: "",
    techStack: [] as string[],
    gallery: [] as string[],
    isFeatured: false,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialProjectState);

  const parseFlexibleDate = (dateStr: string | undefined): Date | null => {
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

  const getRenewalTheme = (expirationDate: string, isFree?: boolean) => {
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

  const isAssetExpiringSoon = (expirationDate: string | undefined, isFree?: boolean | string | undefined, showExp?: boolean | string | undefined) => {
    if (!expirationDate) return false;
    
    const isFreeBool = isFree === true || String(isFree).toLowerCase() === "true";
    const showExpBool = showExp === true || String(showExp).toLowerCase() === "true";
    if (isFreeBool && !showExpBool) return false;
    
    const exp = parseFlexibleDate(expirationDate);
    if (!exp || isNaN(exp.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Expiring within 30 days (less than one month). Counts expired too.
    return diffDays <= 30;
  };

  const getProjectExpiringAssetsCount = (proj: ClientProject) => {
    let count = 0;
    if (proj.domainName && isAssetExpiringSoon(proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration)) {
      count++;
    }
    if (proj.hosts) {
      proj.hosts.forEach((h) => {
        if (h.domainName && isAssetExpiringSoon(h.domainExpiration, h.isHostingFree, h.showDomainExpiration)) {
          count++;
        }
      });
    }
    return count;
  };

  const getProjectUnreadExpiringAssetsCount = (proj: ClientProject) => {
    let count = 0;
    if (proj.domainName && isAssetExpiringSoon(proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration)) {
      const assetId = `${proj.id}-${proj.domainName}`;
      if (!seenExpiringAssetIds.includes(assetId)) {
        count++;
      }
    }
    if (proj.hosts) {
      proj.hosts.forEach((h) => {
        if (h.domainName && isAssetExpiringSoon(h.domainExpiration, h.isHostingFree, h.showDomainExpiration)) {
          const assetId = `${proj.id}-${h.domainName}`;
          if (!seenExpiringAssetIds.includes(assetId)) {
            count++;
          }
        }
      });
    }
    return count;
  };

  useEffect(() => {
    let unsubscribeSettings: (() => void) | undefined;
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setAuthChecking(false);
      if (!user) {
        window.location.hash = "#login";
        if (unsubscribeSettings) {
          unsubscribeSettings();
          unsubscribeSettings = undefined;
        }
      } else {
        fetchProjects();
        fetchPricing();
        fetchClients();
        fetchClientProjects();
        fetchInvoices();
        fetchSubscribers();
        fetchReviews();
        fetchTestimonialsSettings();
        fetchPricingSettings();
        fetchNewsletterSettings();
        fetchArchives();
        
        // Real-time settings sync
        const settingsRef = doc(db, "settings", "company-legal");
        unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setCompanySettings(prev => ({
              ...prev,
              ...data
            }));
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  useEffect(() => {
    if (view === "reviews-list" && reviews.length > 0) {
      const pendingIds = reviews.filter(r => !r.show).map(r => r.id);
      if (pendingIds.length > 0) {
        const uniqueKeys = Array.from(new Set([...seenReviewIds, ...pendingIds]));
        setSeenReviewIds(uniqueKeys);
        localStorage.setItem("zarco_seen_review_ids", JSON.stringify(uniqueKeys));
      }
    }
  }, [view, reviews]);

  useEffect(() => {
    if (view === "subscriptions-view" && clientProjects.length > 0) {
      const currentSignatures = clientProjects
        .filter(p => p.hasSubscription && (p.subscriptionPaid || p.subscriptionCancelled))
        .map(p => `${p.id}_${p.subscriptionPaid ? 'paid' : 'unpaid'}_${p.subscriptionCancelled ? 'cancelled' : 'active'}`);
      
      if (currentSignatures.length > 0) {
        const hasUnseen = currentSignatures.some(sig => !seenSubscriptionSignatures.includes(sig));
        if (hasUnseen) {
          const updated = Array.from(new Set([...seenSubscriptionSignatures, ...currentSignatures]));
          setSeenSubscriptionSignatures(updated);
          localStorage.setItem("zarco_seen_subscription_signatures", JSON.stringify(updated));
        }
      }
    }
  }, [view, clientProjects, seenSubscriptionSignatures]);

  useEffect(() => {
    if (editingClientProject) {
      const projectFbs = editingClientProject.feedbacksList || [];
      if (projectFbs.length > 0) {
        const unreadIds = projectFbs.map(fb => fb.id).filter(id => !seenFeedbackIds.includes(id));
        if (unreadIds.length > 0) {
          const updated = [...seenFeedbackIds, ...unreadIds];
          setSeenFeedbackIds(updated);
          localStorage.setItem("zarco_seen_feedback_ids", JSON.stringify(updated));
        }
      }
    }
  }, [editingClientProject]);

  useEffect(() => {
    if (!loadingClientProjects && clientProjects.length > 0 && !hasShownExpiringToast) {
      const list: string[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkExpiring = (name: string, expDate: string, isFree: boolean | string | undefined, showExp: boolean | string | undefined) => {
        if (!expDate) return;
        const isFreeBool = isFree === true || String(isFree).toLowerCase() === "true";
        const showExpBool = showExp === true || String(showExp).toLowerCase() === "true";
        if (isFreeBool && !showExpBool) return;

        const exp = parseFlexibleDate(expDate);
        if (!exp || isNaN(exp.getTime())) return;

        const diffTime = exp.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
          list.push(name);
        }
      };

      clientProjects.forEach(proj => {
        if (proj.domainName) {
          checkExpiring(proj.domainName, proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration);
        }
        if (proj.hosts) {
          proj.hosts.forEach((h) => {
            if (h.domainName) {
              checkExpiring(h.domainName, h.domainExpiration, h.isHostingFree, h.showDomainExpiration);
            }
          });
        }
      });

      if (list.length > 0) {
        showAdminToast(
          `Alert: You have ${list.length} managed domain renewal(s) expiring within 1 month! Check 'Attention Required' or 'Projects'.`,
          "warning"
        );
        setHasShownExpiringToast(true);
      }
    }
  }, [loadingClientProjects, clientProjects, hasShownExpiringToast]);

  useEffect(() => {
    if (editingInvoice) {
      const subtotal = editingInvoice.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
      const discountAmount = editingInvoice.applyDiscount 
        ? (subtotal * (Number(editingInvoice.discountRate) / 100)) 
        : 0;
      const afterDiscount = subtotal - discountAmount;
      const vatAmount = editingInvoice.applyVat 
        ? (afterDiscount * (Number(editingInvoice.vatRate) / 100)) 
        : 0;
      const totalAmount = afterDiscount + vatAmount;

      if (
        Math.abs(editingInvoice.subtotal - subtotal) > 0.01 ||
        Math.abs(editingInvoice.amount - totalAmount) > 0.01 ||
        Math.abs(editingInvoice.vatAmount - vatAmount) > 0.01 ||
        Math.abs(editingInvoice.discountAmount - discountAmount) > 0.01
      ) {
        setEditingInvoice({
          ...editingInvoice,
          subtotal,
          amount: totalAmount,
          vatAmount,
          discountAmount
        });
      }
    }
  }, [
    editingInvoice?.items, 
    editingInvoice?.vatRate, 
    editingInvoice?.discountRate, 
    editingInvoice?.applyVat, 
    editingInvoice?.applyDiscount,
    editingInvoice?.currency
  ]);

  async function fetchInvoices() {
    setLoadingInvoices(true);
    try {
      const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          subtotal: d.subtotal ?? d.amount ?? 0,
          vatRate: d.vatRate ?? 23,
          vatAmount: d.vatAmount ?? 0,
          discountRate: d.discountRate ?? 0,
          discountAmount: d.discountAmount ?? 0,
          amount: d.amount ?? 0,
          applyVat: d.applyVat ?? false,
          applyDiscount: d.applyDiscount ?? false,
          items: (d.items || []).map((item: any) => ({
            ...item,
            details: item.details || ""
          }))
        };
      }) as Invoice[];
      setInvoices(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "invoices");
    } finally {
      setLoadingInvoices(false);
    }
  }

  async function fetchSubscribers() {
    setLoadingSubscribers(true);
    try {
      const qEn = query(collection(db, "subscribers"), orderBy("subscribedAt", "desc"));
      const qPt = query(collection(db, "pt_subscribers"), orderBy("subscribedAt", "desc"));
      
      const [snapshotEn, snapshotPt] = await Promise.all([
        getDocs(qEn),
        getDocs(qPt)
      ]);

      const dataEn = snapshotEn.docs.map(doc => ({ id: doc.id, ...doc.data(), lang: 'en' })) as Subscriber[];
      const dataPt = snapshotPt.docs.map(doc => ({ id: doc.id, ...doc.data(), lang: 'pt' })) as Subscriber[];
      
      // Merge and sort by subscribedAt
      const merged = [...dataEn, ...dataPt].sort((a, b) => {
        const dateA = a.subscribedAt?.toDate?.() || new Date(a.subscribedAt);
        const dateB = b.subscribedAt?.toDate?.() || new Date(b.subscribedAt);
        return dateB - dateA;
      });

      setSubscribers(merged);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      // We don't use handleFirestoreError here to avoid the blocking alert
      // for this secondary view, especially since it might be a rules issue.
    } finally {
      setLoadingSubscribers(false);
    }
  }

  async function fetchReviews() {
    setLoadingReviews(true);
    try {
      const q = query(collection(db, "reviews"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      setReviews(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "reviews");
    } finally {
      setLoadingReviews(false);
    }
  }

  async function fetchTestimonialsSettings() {
    try {
      const docRef = doc(db, "settings", "testimonials");
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setTestimonialsSettings(snapshot.data() as TestimonialsSettings);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "settings/testimonials");
    }
  }

  async function toggleSubscriberStatus(email: string, lang: 'en' | 'pt', currentStatus: boolean) {
    const newStatus = !currentStatus;
    const collectionName = lang === 'pt' ? 'pt_subscribers' : 'subscribers';
    try {
      await updateDoc(doc(db, collectionName, email), { active: newStatus });
      setSubscribers(prev => prev.map(s => 
        (s.email === email && s.lang === lang) ? { ...s, active: newStatus } : s
      ));
      showAdminToast(`Subscriber subscriber status updated to ${newStatus ? 'Active' : 'Inactive'}!`, "success");
    } catch (error) {
      console.error("Error toggling status:", error);
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${email}`);
    }
  }

  async function deleteSubscriber(id: string, email: string, lang: 'en' | 'pt') {
    setIsDeletingSubscriber(id);
    const collectionName = lang === 'pt' ? 'pt_subscribers' : 'subscribers';
    try {
      await deleteDoc(doc(db, collectionName, id));
      setSubscribers(prev => prev.filter(s => !(s.id === id && s.lang === lang)));
      showAdminToast("Subscriber deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    } finally {
      setIsDeletingSubscriber(null);
      setDeleteConfirm(null);
    }
  }

  async function saveNewsletter(isSent = false) {
    if (!newsletterForm.subject || !newsletterForm.content) {
      showAdminToast("Please fill in the newsletter content before saving.", "warning");
      return;
    }

    setSavingNewsletter(true);
    try {
      const payload = {
        ...newsletterForm,
        isSent,
        sentAt: isSent ? serverTimestamp() : (newsletterForm as any).sentAt || null,
        updatedAt: serverTimestamp(),
        recipientsCount: newsletterForm.lang === 'selected' ? selectedEmails.length : 'audience-wide',
        status: isSent ? 'sent' : 'draft'
      };

      if (editingNewsletterId) {
        await updateDoc(doc(db, "newsletters", editingNewsletterId), payload);
      } else {
        await addDoc(collection(db, "newsletters"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      
      if (!isSent) {
        showAdminToast(
          newsletterForm.lang === 'pt' 
            ? "Rascunho da newsletter guardado com sucesso!" 
            : "Newsletter draft saved successfully!", 
          "success"
        );
        setIsComposing(false);
        setNewsletterForm({ subject: "", content: "", lang: "en" });
        setEditingNewsletterId(null);
      }
      fetchArchives();
    } catch (error) {
      console.error("Error saving newsletter:", error);
      showAdminToast(
        newsletterForm.lang === 'pt'
          ? "Falha ao guardar rascunho."
          : "Failed to save newsletter.",
        "error"
      );
    } finally {
      setSavingNewsletter(false);
    }
  }

  async function fetchArchives() {
    setLoadingArchives(true);
    try {
      const q = query(collection(db, "newsletters"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setArchivedNewsletters(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching archives:", error);
    } finally {
      setLoadingArchives(false);
    }
  }

  async function deleteNewsletter(id: string) {
    try {
      await deleteDoc(doc(db, "newsletters", id));
      setArchivedNewsletters(prev => prev.filter(n => n.id !== id));
      showAdminToast("Newsletter archived campaign deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting newsletter archive:", error);
      handleFirestoreError(error, OperationType.DELETE, `newsletters/${id}`);
    } finally {
      setDeleteConfirm(null);
    }
  }

  function loadDraft(newsletter: any) {
    setNewsletterForm({
      subject: newsletter.subject,
      content: newsletter.content,
      lang: newsletter.lang || 'en'
    });
    setEditingNewsletterId(newsletter.id);
    setIsComposing(true);
  }
  async function sendNewsletter() {
    if (!newsletterForm.subject || !newsletterForm.content) {
      showAdminToast("Please fill in both subject and content.", "warning");
      return;
    }

    if (newsletterForm.lang === 'selected' && selectedEmails.length === 0) {
      showAdminToast("Please select at least one subscriber.", "warning");
      return;
    }

    setSendingNewsletter(true);
    try {
      const payload = {
        ...newsletterForm,
        emails: newsletterForm.lang === 'selected' ? selectedEmails : undefined
      };

      const response = await fetch("/api/admin/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const isPt = newsletterForm.lang === 'pt';
        let feedbackMessage = isPt 
          ? "Newsletter enviada com sucesso!" 
          : "Newsletter sent successfully!";
        let toastType: 'success' | 'warning' | 'error' = "success";

        if (data.sentCount !== undefined && data.failCount !== undefined) {
          if (data.sentCount > 0 && data.failCount === 0) {
            feedbackMessage = isPt
              ? `Campanha enviada com sucesso para ${data.sentCount} destinatários.`
              : `Newsletter sent successfully to ${data.sentCount} recipients.`;
            toastType = "success";
          } else if (data.sentCount === 0 && data.failCount > 0) {
            feedbackMessage = isPt
              ? `Falha ao enviar campanha para os ${data.failCount} destinatários.`
              : `Failed to send newsletter email to all ${data.failCount} recipients.`;
            toastType = "error";
          } else if (data.failCount > 0) {
            feedbackMessage = isPt
              ? `Campanha parcialmente enviada. Sucesso: ${data.sentCount}, Falhas: ${data.failCount}.`
              : `Newsletter partially sent. Successfully sent to ${data.sentCount}, but ${data.failCount} failed.`;
            toastType = "warning";
          }
        }

        showAdminToast(feedbackMessage, toastType);

        // Log it to the archives
        await saveNewsletter(true);
        setIsComposing(false);
        setNewsletterForm({ subject: "", content: "", lang: "en" });
        setSelectedEmails([]);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to send newsletter");
      }
    } catch (error: any) {
      console.error("Error sending newsletter:", error);
      showAdminToast(`Error: ${error.message}`, 'error');
    } finally {
      setSendingNewsletter(false);
    }
  }

  async function fetchCompanySettings() {
    setLoadingSettings(true);
    try {
      const docRef = doc(db, "settings", "company-legal");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCompanySettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const docRef = doc(db, "settings", "company-legal");
      await setDoc(docRef, {
        ...companySettings,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showAdminToast("Settings saved successfully!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "settings/company-legal");
    } finally {
      setSavingSettings(false);
    }
  }

  async function uploadToCloudinary(file: File, folderName?: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    if (folderName) {
      formData.append("folder", folderName);
    } else {
      formData.append("folder", "portfolio/general");
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    return data.url;
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected for logo upload");
      return;
    }

    console.log("Starting logo upload:", file.name, file.size);
    setUploading("logo");
    try {
      const url = await uploadToCloudinary(file, "portfolio/settings/logo");
      console.log("Cloudinary URL obtained:", url);
      setCompanySettings(prev => ({ ...prev, logoUrl: url }));
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      showAdminToast(`Upload failed: ${error.message || "Unknown error"}`, "error");
    } finally {
      setUploading(null);
      // Clear the input value so the same file can be uploaded again
      e.target.value = "";
    }
  }

  async function handleQrCodeUpload(e: React.ChangeEvent<HTMLInputElement>, type: "revolut" | "custom", customId?: string) {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected for QR code upload");
      return;
    }

    console.log(`Starting ${type} QR upload:`, file.name);
    setUploading(type === "revolut" ? "qrcode" : `custom_qrcode_${customId}`);
    try {
      const url = await uploadToCloudinary(file, `portfolio/settings/payments`);
      console.log("Cloudinary URL obtained:", url);
      
      if (type === "revolut") {
        setCompanySettings(prev => ({ ...prev, revolutQrCodeUrl: url }));
      } else if (customId) {
        setCompanySettings(prev => {
          const newPayments = (prev.customPayments || []).map(p => 
            p.id === customId ? { ...p, qrCodeUrl: url } : p
          );
          return { ...prev, customPayments: newPayments };
        });
      }
    } catch (error: any) {
      console.error("Error uploading QR code:", error);
      showAdminToast(`Upload failed: ${error.message || "Unknown error"}`, "error");
    } finally {
      setUploading(null);
      // Clear the input value so the same file can be uploaded again
      e.target.value = "";
    }
  }

  async function fetchPricing() {
    setLoading(true);
    try {
      const plansSnapshot = await getDocs(collection(db, "pricing"));
      const plansData = plansSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nameEn: data.nameEn || "",
          namePt: data.namePt || "",
          price: data.price !== undefined ? Number(data.price) : 0,
          priceSuffixEn: data.priceSuffixEn || "",
          priceSuffixPt: data.priceSuffixPt || "",
          descriptionEn: data.descriptionEn || "",
          descriptionPt: data.descriptionPt || "",
          buttonTextEn: data.buttonTextEn || "Enquire Now",
          buttonTextPt: data.buttonTextPt || "Pedir Orçamento",
          servicesEn: Array.isArray(data.servicesEn) ? data.servicesEn : [],
          servicesPt: Array.isArray(data.servicesPt) ? data.servicesPt : [],
          show: data.show ?? true,
          isHighlighted: data.isHighlighted ?? false,
          discountPercentage:
            data.discountPercentage !== undefined
              ? Number(data.discountPercentage)
              : 0,
          periodicity: data.periodicity || "Monthly",
          order: data.order || 0,
        };
      }) as PricingPlan[];

      // If we actually fetched plans from DB, use them.
      // If the DB is empty, use defaults.
      if (plansData.length === 0) {
        const defaults: PricingPlan[] = [
          {
            id: "hourly",
            nameEn: "Hourly",
            namePt: "Por Hora",
            price: 65,
            priceSuffixEn: "/ Ex VAT",
            priceSuffixPt: "/ Sem IVA",
            descriptionEn:
              "Pay only for the time you need— no long-term commitment.",
            descriptionPt:
              "Pague apenas pelo tempo que necessita— sem compromissos a longo prazo.",
            buttonTextEn: "Enquire Now",
            buttonTextPt: "Pedir Orçamento",
            servicesEn: [
              "Website updates or fixes",
              "No ongoing commitment",
              "Fast turnaround on small tasks",
            ],
            servicesPt: [
              "Atualizações ou correções",
              "Sem compromisso contínuo",
              "Entrega rápida de pequenas tarefas",
            ],
            show: true,
            isHighlighted: false,
            discountPercentage: 0,
            periodicity: "Hourly",
            order: 0,
          },
          {
            id: "monthly",
            nameEn: "Monthly",
            namePt: "Mensal",
            price: 2250,
            priceSuffixEn: "/ Ex VAT",
            priceSuffixPt: "/ Sem IVA",
            descriptionEn:
              "Ideal if you need help throughout the month on new or ongoing projects.",
            descriptionPt:
              "Ideal se precisar de ajuda ao longo do mês em projetos novos ou em curso.",
            buttonTextEn: "Enquire Now",
            buttonTextPt: "Pedir Orçamento",
            servicesEn: [
              "Priority Site Support",
              "Ongoing Site Updates",
              "New Features Monthly",
            ],
            servicesPt: [
              "Suporte Prioritário",
              "Atualizações Contínuas",
              "Novas Funcionalidades",
            ],
            show: true,
            isHighlighted: true,
            discountPercentage: 0,
            periodicity: "Monthly",
            order: 1,
          },
          {
            id: "project",
            nameEn: "Project",
            namePt: "Projeto",
            price: 0,
            priceSuffixEn: "Custom",
            priceSuffixPt: "Sob Consulta",
            descriptionEn:
              "Tailored website projects designed for real business growth.",
            descriptionPt:
              "Projetos de websites personalizados criados para o crescimento real do negócio.",
            buttonTextEn: "Enquire Now",
            buttonTextPt: "Pedir Orçamento",
            servicesEn: [
              "Premium Website Build",
              "24/7 Support",
              "Strategy-Led Approach",
            ],
            servicesPt: [
              "Construção Premium",
              "Suporte 24/7",
              "Abordagem Estratégica",
            ],
            show: true,
            isHighlighted: false,
            discountPercentage: 0,
            periodicity: "One Time",
            order: 2,
          },
        ];
        setPricingPlans(defaults);
      } else {
        setPricingPlans(
          plansData.sort((a, b) => (a.order || 0) - (b.order || 0)),
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "pricing");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPricingSettings() {
    try {
      const docRef = doc(db, "settings", "pricing");
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPricingSettings({
          showSection: data.showSection ?? data.showPricing ?? true
        });
      }
    } catch (error) {
      console.error("Error fetching pricing settings:", error);
    }
  }

  async function fetchNewsletterSettings() {
    try {
      const docRef = doc(db, "settings", "newsletter");
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setNewsletterSettings(snapshot.data() as NewsletterSettings);
      }
    } catch (error) {
      console.error("Error fetching newsletter settings:", error);
    }
  }

  async function handleSavePricingSettings(newSettings: PricingSettings) {
    try {
      await setDoc(doc(db, "settings", "pricing"), {
        ...newSettings,
        updatedAt: serverTimestamp(),
      });
      setPricingSettings(newSettings);
      showAdminToast("Pricing settings saved successfully!", "success");
    } catch (error: any) {
      showAdminToast(`Failed to save pricing settings: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.WRITE, "settings/pricing");
    }
  }

  async function toggleNewsletterVisibility(currentStatus: boolean) {
    try {
      const docRef = doc(db, "settings", "newsletter");
      const newData = { showSection: !currentStatus, updatedAt: serverTimestamp() };
      await setDoc(docRef, newData, { merge: true });
      setNewsletterSettings({ showSection: !currentStatus });
      showAdminToast(`Newsletter visibility ${!currentStatus ? "enabled" : "disabled"} successfully!`, "success");
    } catch (errorBy: any) {
      showAdminToast(`Failed to toggling newsletter visibility: ${errorBy.message || errorBy}`, "error");
      handleFirestoreError(errorBy, OperationType.UPDATE, "settings/newsletter");
    }
  }

  async function toggleWhatsappButton(currentStatus: boolean) {
    try {
      const docRef = doc(db, "settings", "company-legal");
      const newData = { showWhatsappButton: !currentStatus, updatedAt: serverTimestamp() };
      await setDoc(docRef, newData, { merge: true });
      setCompanySettings(prev => ({ ...prev, showWhatsappButton: !currentStatus }));
      showAdminToast(`WhatsApp WhatsApp button ${!currentStatus ? "enabled" : "disabled"} successfully!`, "success");
    } catch (error: any) {
      showAdminToast(`Failed to toggle WhatsApp button: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.UPDATE, "settings/company-legal");
    }
  }

  async function toggleTrustWidget(currentStatus: boolean) {
    try {
      const docRef = doc(db, "settings", "company-legal");
      const newData = { showTrustWidget: !currentStatus, updatedAt: serverTimestamp() };
      await setDoc(docRef, newData, { merge: true });
      setCompanySettings(prev => ({ ...prev, showTrustWidget: !currentStatus }));
      showAdminToast(`Trust widget ${!currentStatus ? "enabled" : "disabled"} successfully!`, "success");
    } catch (error: any) {
      showAdminToast(`Failed to toggle Trust widget: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.UPDATE, "settings/company-legal");
    }
  }

  async function toggleMaintenance(currentStatus: boolean) {
    try {
      const docRef = doc(db, "settings", "company-legal");
      const newData = { showMaintenance: !currentStatus, updatedAt: serverTimestamp() };
      await setDoc(docRef, newData, { merge: true });
      setCompanySettings(prev => ({ ...prev, showMaintenance: !currentStatus }));
      showAdminToast(`Maintenance mode ${!currentStatus ? "activated" : "deactivated"} successfully!`, "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "settings/company-legal");
    }
  }

  async function handleDeletePlan(id: string) {
    try {
      console.log("Executing deleteDoc for plan:", id);
      await deleteDoc(doc(db, "pricing", id));
      
      console.log("Updating local state for deleted plan:", id);
      setPricingPlans((prev) => prev.filter((p) => p.id !== id));
      setPlanConfirmingDelete(null);
      showAdminToast("Plan deleted successfully", "success");
    } catch (error) {
      console.error("Delete error for plan:", id, error);
      handleFirestoreError(error, OperationType.DELETE, `pricing/${id}`);
    }
  }

  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPlan) return;

    setSavingPricing(true);
    try {
      const planId = editingPlan.id || `plan-${Date.now()}`;

      await setDoc(doc(db, "pricing", planId), {
        ...editingPlan,
        id: planId,
        updatedAt: serverTimestamp(),
      });

      showAdminToast("Plan saved successfully!", "success");
      fetchPricing();
      setView("pricing-list");
      setEditingPlan(null);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `pricing/${editingPlan.id}`,
      );
    } finally {
      setSavingPricing(false);
    }
  }

  function handleAddPlan() {
    setEditingPlan({
      id: `plan-${Date.now()}`,
      nameEn: "",
      namePt: "",
      price: 0,
      priceSuffixEn: "/ Ex VAT",
      priceSuffixPt: "/ Sem IVA",
      descriptionEn: "",
      descriptionPt: "",
      buttonTextEn: "Enquire Now",
      buttonTextPt: "Pedir Orçamento",
      servicesEn: [],
      servicesPt: [],
      show: true,
      isHighlighted: false,
      discountPercentage: 0,
      periodicity: "Monthly",
      order: pricingPlans.length,
    });
    setView("pricing-form");
  }

  function handleEditPlan(plan: PricingPlan) {
    setEditingPlan(plan);
    setView("pricing-form");
  }

  // --- Trash Bin Management ---
  async function fetchTrash() {
    setLoadingTrash(true);
    try {
      const q = query(collection(db, "trash"), orderBy("deletedAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrashItems(items);
    } catch (error) {
      console.error("Error fetching trash:", error);
    } finally {
      setLoadingTrash(false);
    }
  }

  async function handleRestoreTrashItem(item: any) {
    try {
      if (item.type === "subscription") {
        await updateDoc(doc(db, "clientProjects", item.originalId), {
          hasSubscription: item.data.hasSubscription ?? true,
          subscriptionTitle: item.data.subscriptionTitle || null,
          subscriptionDescription: item.data.subscriptionDescription || null,
          subscriptionInterval: item.data.subscriptionInterval || "monthly",
          subscriptionPrice: item.data.subscriptionPrice || 0,
          subscriptionEnabled: item.data.subscriptionEnabled ?? true,
          subscriptionPaid: item.data.subscriptionPaid ?? false,
          subscriptionPaidAt: item.data.subscriptionPaidAt || null,
          subscriptionCancelled: item.data.subscriptionCancelled ?? false,
          subscriptionCancelledBy: item.data.subscriptionCancelledBy || null,
          subscriptionFeatures: item.data.subscriptionFeatures || [],
          updatedAt: new Date(),
        });
      } else {
        await setDoc(doc(db, item.originalCollection, item.originalId), item.data);
      }
      await deleteDoc(doc(db, "trash", item.id));
      setTrashItems(prev => prev.filter(t => t.id !== item.id));
      
      if (item.originalCollection === "clients") {
        fetchClients();
      } else if (item.originalCollection === "projects") {
        fetchProjects();
      } else if (item.originalCollection === "clientProjects") {
        fetchClientProjects();
      } else if (item.originalCollection === "invoices") {
        fetchInvoices();
      }
      
      showAdminToast("Item restored successfully!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `restore/${item.originalCollection}/${item.originalId}`);
    }
  }

  async function handlePermanentDelete(id: string) {
    try {
      await deleteDoc(doc(db, "trash", id));
      setTrashItems(prev => prev.filter(t => t.id !== id));
      setTrashConfirmingDelete(null);
      showAdminToast("Item permanently deleted!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `trash/${id}`);
    }
  }

  // --- Clients Management ---
  async function fetchClients() {
    setLoadingClients(true);
    try {
      const q = query(collection(db, "clients"), orderBy("fullName", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Client[];
      setClients(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "clients");
    } finally {
      setLoadingClients(false);
    }
  }

  async function fetchClientProjects() {
    setLoadingClientProjects(true);
    try {
      const q = query(
        collection(db, "clientProjects"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClientProject[];
      setClientProjects(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "clientProjects");
    } finally {
      setLoadingClientProjects(false);
    }
  }

  async function handleSaveClient(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClient) return;

    setSavingClient(true);
    try {
      if (editingClient.id.startsWith("client-temp-")) {
        // Create new client
        const clientData = { ...editingClient };
        const tempId = clientData.id;
        delete (clientData as any).id;

        await addDoc(collection(db, "clients"), {
          ...clientData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showAdminToast("Client onboarded successfully!", "success");
      } else {
        // Update existing client
        const clientData = { ...editingClient };
        const clientId = clientData.id;
        delete (clientData as any).id;
        // Important: createdAt should not be updated on update
        if (clientData.createdAt) delete (clientData as any).createdAt;

        await updateDoc(doc(db, "clients", clientId), {
          ...clientData,
          updatedAt: serverTimestamp(),
        });
        showAdminToast("Profile updated successfully!", "success");
      }

      await fetchClients();
      setView("clients-list");
      setEditingClient(null);
    } catch (error) {
      console.error("Save client error:", error);
      handleFirestoreError(
        error,
        editingClient.id.startsWith("client-temp-")
          ? OperationType.CREATE
          : OperationType.UPDATE,
        "clients",
      );
    } finally {
      setSavingClient(false);
    }
  }

  async function handleDeleteClient(id: string) {
    try {
      const item = clients.find((c) => c.id === id);
      if (item) {
        await setDoc(doc(db, "trash", id), {
          originalId: id,
          type: "client",
          name: item.fullName || item.companyName || "Unnamed Client",
          details: item.email || item.companyName || "",
          deletedAt: new Date().toISOString(),
          originalCollection: "clients",
          data: item
        });
      }
      await deleteDoc(doc(db, "clients", id));
      setClients((prev) => prev.filter((c) => c.id !== id));
      setClientConfirmingDelete(null);
      showAdminToast("Client moved to Trash Bin", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
    }
  }

  function handleAddClient() {
    setEditingClient({
      id: `client-temp-${Date.now()}`,
      fullName: "",
      companyName: "",
      businessType: "",
      industry: "",
      description: "",
      websiteUrl: "",
      instagramUrl: "",
      facebookUrl: "",
      linkedinUrl: "",
      tiktokUrl: "",
      email: "",
      phone: "",
      whatsapp: "",
      otherContact: "",
      streetAddress: "",
      addressLine2: "",
      city: "",
      zipCode: "",
      country: "",
      vatNumber: "",
    });
    setView("clients-form");
  }

  function handleEditClient(client: Client) {
    setEditingClient(client);
    setView("clients-form");
  }

  function handleViewClient(client: Client) {
    setEditingClient(client);
    setView("clients-view");
  }

  function handleAddClientProject(client: Client) {
    setEditingClientProject({
      id: `client-proj-temp-${Date.now()}`,
      clientId: client.id,
      projectName: "",
      projectType: "",
      status: "Lead",
      shortDescription: "",
      fullDescription: "",
      techStack: [],
      liveUrl: "",
      otherUrls: [],
      githubUrl: "",
      figmaUrl: "",
      serviceEmail: "",
      providerUrl: "",
      domainName: "",
      domainProvider: "",
      domainExpiration: "2028-12-31",
      hostingType: "",
      isHostingFree: false,
      isClientProvided: false,
      hosts: [],
      mainImage: "",
      gallery: [],
      demoVideoUrl: "",
      startDate: new Date().toISOString().split("T")[0],
      deadline: "",
      deliveryDate: "",
      price: "",
      paidStatus: "Pending",
      maintenancePlan: false,
      internalNotes: "",
      clientFeedback: "",
      issues: "",
      shareUsername: "",
      sharePassword: "",
      isShared: false,
      projectPurpose: "",
      pagesCount: "",
      pagesList: "",
      featuresList: "",
      wireframes: "",
      budgetLines: [],
      shareLanguage: "en",
      expectedDuration: "",
      onlyShowExpected: false,
      showFullDescription: false,
      showReviewsBox: true,
      hasManualTesting: false,
      manualTestingUrl: "",
      hasAutomatedTesting: false,
      automatedTestingUrl: "",
      discountPercent: "0",
      vatPercent: "23",
      applyVat: true,
      customServices: [],
      hasSubscription: false,
      subscriptionTitle: "",
      subscriptionDescription: "",
      subscriptionInterval: "monthly",
      subscriptionPrice: "",
      subscriptionEnabled: false,
      subFeaturesSlack: true,
      subFeaturesSecurity: true,
      subFeaturesHosting: true,
      secondaryBudgetLines: [],
      secondaryCustomServices: [],
      secondaryDiscountPercent: "0",
      secondaryVatPercent: "23",
      secondaryApplyVat: true,
      secondaryPaidStatus: "Pending",
      secondaryPrice: "0",
    });
    setView("client-project-form");
  }

  function handleAddNewManagedProject() {
    setEditingClient(null);
    setEditingClientProject({
      id: `client-proj-temp-${Date.now()}`,
      clientId: "",
      projectName: "",
      projectType: "",
      status: "Lead",
      shortDescription: "",
      fullDescription: "",
      techStack: [],
      liveUrl: "",
      otherUrls: [],
      githubUrl: "",
      figmaUrl: "",
      serviceEmail: "",
      providerUrl: "",
      domainName: "",
      domainProvider: "",
      domainExpiration: "2028-12-31",
      hostingType: "",
      isHostingFree: false,
      isClientProvided: false,
      hosts: [],
      mainImage: "",
      gallery: [],
      demoVideoUrl: "",
      startDate: new Date().toISOString().split("T")[0],
      deadline: "",
      deliveryDate: "",
      price: "",
      paidStatus: "Pending",
      maintenancePlan: false,
      internalNotes: "",
      clientFeedback: "",
      issues: "",
      shareUsername: "",
      sharePassword: "",
      isShared: false,
      projectPurpose: "",
      pagesCount: "",
      pagesList: "",
      featuresList: "",
      wireframes: "",
      budgetLines: [],
      shareLanguage: "en",
      expectedDuration: "",
      onlyShowExpected: false,
      showFullDescription: false,
      showReviewsBox: true,
      hasManualTesting: false,
      manualTestingUrl: "",
      hasAutomatedTesting: false,
      automatedTestingUrl: "",
      discountPercent: "0",
      vatPercent: "23",
      applyVat: true,
      customServices: [],
      hasSubscription: false,
      subscriptionTitle: "",
      subscriptionDescription: "",
      subscriptionInterval: "monthly",
      subscriptionPrice: "",
      subscriptionEnabled: false,
      subFeaturesSlack: true,
      subFeaturesSecurity: true,
      subFeaturesHosting: true,
      secondaryBudgetLines: [],
      secondaryCustomServices: [],
      secondaryDiscountPercent: "0",
      secondaryVatPercent: "23",
      secondaryApplyVat: true,
      secondaryPaidStatus: "Pending",
      secondaryPrice: "0",
    });
    setView("client-project-form");
  }

  function handleAddNewPortfolioProject() {
    setFormData(initialProjectState);
    setEditingProject(null);
    setView("create");
  }

  const handleAddInvoice = () => {
    let nextInvoiceNumber = "";
    
    if (companySettings.autoGenerateInvoices !== false) {
      const currentYear = new Date().getFullYear();
      const prefix = `${(companySettings.invoicePrefix || "INV").trim()}-${currentYear}-`;
      
      // Calculate next available sequence number
      let nextNum = Number(companySettings.nextInvoiceNumber) || 1;
      
      // Look for the highest sequence number among existing invoices with this prefix
      const matches = invoices
        .filter(inv => inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix))
        .map(inv => {
          const numMatch = inv.invoiceNumber.match(/(\d+)$/);
          return numMatch ? parseInt(numMatch[1], 10) : 0;
        });

      if (matches.length > 0) {
        const maxSeq = Math.max(...matches);
        if (maxSeq >= nextNum) {
          nextNum = maxSeq + 1;
        }
      }
      
      nextInvoiceNumber = `${prefix}${nextNum.toString().padStart(4, "0")}`;
    }

    setEditingInvoice({
      id: `invoice-temp-${Date.now()}`,
      clientId: "",
      projectId: "",
      invoiceNumber: nextInvoiceNumber,
      subtotal: 0,
      vatRate: 23,
      vatAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      amount: 0,
      currency: "EUR",
      status: "Draft",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      description: "",
      details: "",
      items: [{ description: "", details: "", quantity: 1, unitPrice: 0, total: 0 }],
      applyVat: false,
      applyDiscount: false,
      showClientVat: true,
      showClientName: true,
      showClientCompany: true,
    });
    setView("billing-form");
  };

  const handleGenerateInvoiceFromProject = (project: ClientProject, phaseId: string = 'primary') => {
    let nextInvoiceNumber = "";
    
    if (companySettings.autoGenerateInvoices !== false) {
      const currentYear = new Date().getFullYear();
      const prefix = `${(companySettings.invoicePrefix || "INV").trim()}-${currentYear}-`;
      
      // Calculate next available sequence number
      let nextNum = Number(companySettings.nextInvoiceNumber) || 1;
      
      // Look for the highest sequence number among existing invoices with this prefix
      const matches = invoices
        .filter(inv => inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix))
        .map(inv => {
          const numMatch = inv.invoiceNumber.match(/(\d+)$/);
          return numMatch ? parseInt(numMatch[1], 10) : 0;
        });

      if (matches.length > 0) {
        const maxSeq = Math.max(...matches);
        if (maxSeq >= nextNum) {
          nextNum = maxSeq + 1;
        }
      }
      
      nextInvoiceNumber = `${prefix}${nextNum.toString().padStart(4, "0")}`;
    }

    const phases = getProjectPhases(project);
    const activePhase = phases.find(p => p.id === phaseId) || phases[0];

    const budgetLines = activePhase.budgetLines || [];
    const customServices = activePhase.customServices || [];

    // Map budget lines to invoice items
    const lineItems: InvoiceItem[] = budgetLines.map(line => ({
      description: line.item,
      details: line.description || "",
      quantity: 1,
      unitPrice: typeof line.cost === 'string' ? Number(line.cost) || 0 : line.cost,
      total: typeof line.cost === 'string' ? Number(line.cost) || 0 : line.cost,
    }));

    // Map custom services to invoice items
    const customItems: InvoiceItem[] = customServices.map(svc => ({
      description: svc.item,
      details: svc.description || "",
      quantity: svc.quantity || 1,
      unitPrice: svc.unitPrice || Number(svc.cost) || 0,
      total: Number(svc.cost) || 0,
    }));

    const allItems = [...lineItems, ...customItems];
    if (allItems.length === 0) {
      allItems.push({ description: phaseId === 'secondary' ? "Secondary Phase Services" : phaseId.startsWith('phase_') ? `${activePhase.title} Services` : "Web Development Services", details: "", quantity: 1, unitPrice: 0, total: 0 });
    }

    const bSubtotal = budgetLines.reduce((acc, line) => acc + (typeof line.cost === 'string' ? Number(line.cost) || 0 : line.cost), 0);
    const cSubtotal = customServices.reduce((acc, svc) => acc + (Number(svc.cost) || 0), 0);
    const subtotal = bSubtotal + cSubtotal;

    const discPct = Number(activePhase.discountPercent || "0") || 0;
    const discountAmount = (subtotal * discPct) / 100;
    const taxableBase = Math.max(0, subtotal - discountAmount);
    
    const applyVat = activePhase.applyVat;
    const vatPct = applyVat ? (Number(activePhase.vatPercent !== undefined ? activePhase.vatPercent : "23") || 0) : 0;
    const vatAmount = (taxableBase * vatPct) / 100;
    
    const amount = taxableBase + vatAmount;

    setEditingInvoice({
      id: `invoice-temp-${Date.now()}`,
      clientId: project.clientId || "",
      projectId: project.id || "",
      invoiceNumber: nextInvoiceNumber,
      subtotal,
      vatRate: vatPct,
      vatAmount,
      discountRate: discPct,
      discountAmount,
      amount,
      currency: "EUR",
      status: "Draft",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      description: `Billed from Project Scope (${phaseId === 'secondary' ? 'Secondary Phase/Other Services' : phaseId.startsWith('phase_') ? activePhase.title : 'Primary Scope'}): ${project.projectName}`,
      details: "",
      items: allItems,
      applyVat,
      applyDiscount: discPct > 0,
      showClientVat: true,
      showClientName: true,
      showClientCompany: true,
    });
    setView("billing-form");
  };

  const handleGenerateInvoiceFromSubscription = (project: ClientProject) => {
    let nextInvoiceNumber = "";
    
    if (companySettings.autoGenerateInvoices !== false) {
      const currentYear = new Date().getFullYear();
      const prefix = `${(companySettings.invoicePrefix || "INV").trim()}-${currentYear}-`;
      
      // Calculate next available sequence number
      let nextNum = Number(companySettings.nextInvoiceNumber) || 1;
      
      // Look for the highest sequence number among existing invoices with this prefix
      const matches = invoices
        .filter(inv => inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix))
        .map(inv => {
          const numMatch = inv.invoiceNumber.match(/(\d+)$/);
          return numMatch ? parseInt(numMatch[1], 10) : 0;
        });

      if (matches.length > 0) {
        const maxSeq = Math.max(...matches);
        if (maxSeq >= nextNum) {
          nextNum = maxSeq + 1;
        }
      }
      
      nextInvoiceNumber = `${prefix}${nextNum.toString().padStart(4, "0")}`;
    }

    const price = Number(project.subscriptionPrice || 0);
    const intervalStr = project.subscriptionInterval === "yearly" ? "Yearly Support" : "Monthly Support";
    const subtotal = price;
    const amount = price;

    const allItems: InvoiceItem[] = [{
      description: `${project.subscriptionTitle || "Recurring Subscription"} (${intervalStr})`,
      details: `Project: ${project.projectName}`,
      quantity: 1,
      unitPrice: price,
      total: price,
    }];

    setEditingInvoice({
      id: `invoice-temp-${Date.now()}`,
      clientId: project.clientId || "",
      projectId: project.id || "",
      invoiceNumber: nextInvoiceNumber,
      subtotal,
      vatRate: 0,
      vatAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      amount,
      currency: "EUR",
      status: "Draft",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      description: `Subscription billing cycle for ${project.projectName} (${project.subscriptionTitle || "Support Plan"})`,
      details: "",
      items: allItems,
      applyVat: false,
      applyDiscount: false,
      showClientVat: true,
      showClientName: true,
      showClientCompany: true,
      isSubscription: true,
      subscriptionMonth: new Date().toLocaleString("en-US", { month: "long" }),
    });
    setView("billing-form");
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setView("billing-form");
  };

  async function handleSaveInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!editingInvoice) return;

    setSavingInvoice(true);
    try {
      const { id, ...data } = editingInvoice;
      const invoiceData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (id.startsWith("invoice-temp-")) {
        const docRef = await addDoc(collection(db, "invoices"), {
          ...invoiceData,
          createdAt: serverTimestamp(),
        });
        
        // Update next sequence number in settings if auto-gen is enabled
        if (companySettings.autoGenerateInvoices !== false) {
          // Extract purely the suffix number from the invoice number used
          const numMatch = editingInvoice.invoiceNumber.match(/(\d+)$/);
          const usedSeq = numMatch ? parseInt(numMatch[1], 10) : 0;
          const currentSettingSeq = Number(companySettings.nextInvoiceNumber) || 1;
          
          if (!isNaN(usedSeq) && usedSeq >= currentSettingSeq) {
            const nextSeq = usedSeq + 1;
            // Update settings in Firestore to ensure next invoice uses the next number
            await setDoc(doc(db, "settings", "company-legal"), {
              nextInvoiceNumber: nextSeq,
              updatedAt: serverTimestamp(),
            }, { merge: true });
          }
        }

        setInvoices(prev => [
          { ...editingInvoice, id: docRef.id, createdAt: new Date() },
          ...prev,
        ]);
        showAdminToast("Invoice/Bill created successfully!", "success");
      } else {
        await setDoc(doc(db, "invoices", id), invoiceData, { merge: true });
        setInvoices(
          invoices.map((inv) => (inv.id === id ? editingInvoice : inv)),
        );
        showAdminToast("Invoice/Bill updated successfully!", "success");
      }
      setView("billing-list");
    } catch (error: any) {
      showAdminToast(`Failed to save Invoice/Bill: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.WRITE, "invoices");
    } finally {
      setSavingInvoice(false);
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    try {
      const item = invoices.find((inv) => inv.id === id);
      if (item) {
        await setDoc(doc(db, "trash", id), {
          originalId: id,
          type: "bill",
          name: item.invoiceNumber || "Unnamed Invoice",
          details: item.amount ? `€${item.amount}` : "",
          deletedAt: new Date().toISOString(),
          originalCollection: "invoices",
          data: item
        });
      }
      await deleteDoc(doc(db, "invoices", id));
      setInvoices(invoices.filter((inv) => inv.id !== id));
      setInvoiceConfirmingDelete(null);
      showAdminToast("Invoice/Bill moved to Trash Bin", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `invoices/${id}`);
    }
  };

  const [pdfStates, setPdfStates] = useState<Record<string, string>>({});
  const [pdfLangs, setPdfLangs] = useState<Record<string, "en" | "pt">>({});

  const [analyticsYear, setAnalyticsYear] = useState<string>(new Date().getFullYear().toString());
  const [analyticsMonth, setAnalyticsMonth] = useState<string>("All");

  const handleGeneratePDF = async (invoice: Invoice) => {
    let status = pdfStates[invoice.id];
    if (status === undefined) {
      status = normalizeStatus(invoice.status);
    }
    if (status === "DRAFT") {
      status = "";
    }
    const lang = pdfLangs[invoice.id] || "en";

    const formatPrice = (val: number) => {
      const formatted = Number(val).toFixed(2);
      const isEur = invoice.currency === "EUR" || !invoice.currency;
      return isEur ? `${formatted}€` : `${formatted} ${invoice.currency}`;
    };

    // Helper to load images for PDF
    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
      });
    };

    const st = {
      en: {
        PAID: "PAID",
        UNPAID: "UNPAID",
        PENDING: "PENDING",
        DUPLICATE: "DUPLICATE",
        VOID: "VOID"
      },
      pt: {
        PAID: "PAGO",
        UNPAID: "NÃO PAGO",
        PENDING: "PENDENTE",
        DUPLICATE: "DUPLICADO",
        VOID: "ANULADO"
      }
    }[lang];

    const t = {
      en: {
        from: "FROM:",
        billTo: "BILL TO:",
        invoice: "INVOICE:",
        issueDate: "ISSUE DATE:",
        dueDate: "DUE DATE:",
        description: "Description",
        quantity: "Quantity",
        unitPrice: "Unit Price",
        total: "Total",
        subtotal: "Subtotal:",
        discount: "Discount",
        vat: "VAT",
        totalAmount: "TOTAL AMOUNT",
        paymentInfo: "PAYMENT INFORMATION",
        bankTransfer: "BANK TRANSFER:",
        thankYou: "Thank you for choosing Zarco Studios. We appreciate your business.",
      },
      pt: {
        from: "EMISSOR:",
        billTo: "FATURAR A:",
        invoice: "FATURA:",
        issueDate: "DATA DE EMISSÃO:",
        dueDate: "DATA DE VENCIMENTO:",
        description: "Descrição",
        quantity: "Qtd",
        unitPrice: "Preço Unitário",
        total: "Total",
        subtotal: "Subtotal:",
        discount: "Desconto",
        vat: "IVA",
        totalAmount: "VALOR TOTAL",
        paymentInfo: "INFORMAÇÕES DE PAGAMENTO",
        bankTransfer: "TRANSFERÊNCIA BANCÁRIA:",
        thankYou: "Obrigado por escolher a Zarco Studios. Agradecemos a sua preferência.",
      }
    }[lang];

    const client = clients.find((c) => c.id === invoice.clientId);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 0. Background
    doc.setFillColor(254, 254, 254); // #fefefe
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Watermark
    const watermarkLogo = "/images/logos/zarco_studios_webdevelopement_logo.png";
    try {
      const wmImg = await loadImage(watermarkLogo);
      const wmWidth = 68;
      const wmHeight = (wmImg.height * wmWidth) / wmImg.width;
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
      doc.addImage(wmImg, 'PNG', pageWidth - wmWidth - 20, pageHeight - wmHeight - 20, wmWidth, wmHeight);
      doc.restoreGraphicsState();
    } catch (e) {
      console.warn("Watermark with custom logo failed, trying company logo", e);
      if (companySettings.logoUrl) {
        try {
          const wmImg = await loadImage(companySettings.logoUrl);
          const wmWidth = 68;
          const wmHeight = (wmImg.height * wmWidth) / wmImg.width;
          doc.saveGraphicsState();
          doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
          doc.addImage(wmImg, 'PNG', pageWidth - wmWidth - 20, pageHeight - wmHeight - 20, wmWidth, wmHeight);
          doc.restoreGraphicsState();
        } catch (e2) {
          console.error("Watermark failed entirely", e2);
        }
      }
    }


    // Helper to draw a "Stamp"
    const drawStamp = (text: string, x: number, y: number, color: [number, number, number]) => {
      doc.saveGraphicsState();
      doc.setTextColor(...color);
      doc.setFontSize(35);
      doc.setFont("helvetica", "bold");
      
      // Lower opacity for the stamp
      doc.setGState(new (doc as any).GState({ opacity: 0.4 }));
      
      // Draw text without border
      doc.text(text, x, y, { angle: -15 });
      doc.restoreGraphicsState();
    };

    // 1. Header & Logo
    let headerY = 20;
    if (companySettings.logoUrl) {
      try {
        const logoImg = await loadImage(companySettings.logoUrl);
        const logoWidth = 49; // Increased by 10% more from 44
        const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
        doc.addImage(logoImg, 'PNG', 15, 15, logoWidth, logoHeight);
        headerY = 15 + logoHeight + 10;
      } catch (e) {
        doc.setFontSize(22);
        doc.setTextColor(79, 209, 220); // Zarco Cyan
        doc.text(companySettings.companyName.toUpperCase(), 20, 30);
        headerY = 40;
      }
    } else {
      doc.setFontSize(22);
      doc.setTextColor(79, 209, 220); // Zarco Cyan
      doc.text(companySettings.companyName.toUpperCase() || "ZARCO STUDIO", 20, 30);
      headerY = 40;
    }

    // 2. Agency Info (Left)
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.setFont("helvetica", "bold");
    doc.text(t.from, 20, headerY);
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(companySettings.freelancerName || companySettings.companyName, 20, headerY + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let companyInfoY = headerY + 10;
    if (companySettings.addressLine1) {
      doc.text(companySettings.addressLine1, 20, companyInfoY);
      companyInfoY += 4;
    }
    if (companySettings.addressLine2) {
      doc.text(companySettings.addressLine2, 20, companyInfoY);
      companyInfoY += 4;
    }
    if (companySettings.zipCode) {
      doc.text(companySettings.zipCode, 20, companyInfoY);
      companyInfoY += 4;
    }
    if (companySettings.email) {
      doc.text(companySettings.email, 20, companyInfoY);
      companyInfoY += 4;
    }
    if (companySettings.vatNumber) {
      doc.text(`VAT: ${companySettings.vatNumber}`, 20, companyInfoY);
      companyInfoY += 4;
    }
    if (companySettings.croNumber) doc.text(`CRO: ${companySettings.croNumber}`, 20, companyInfoY);

    // 3. Client Info (Right)
    const clientX = pageWidth - 80;
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.setFont("helvetica", "bold");
    doc.text(t.billTo, clientX, headerY);
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    
    let currentClientY = headerY + 5;
    if (invoice.showClientName !== false) {
      doc.text(client?.fullName || "Valued Client", clientX, currentClientY);
      currentClientY += 5;
    } else if (invoice.showClientCompany === false) {
      // If both are hidden, show placeholder
      doc.text("Valued Client", clientX, currentClientY);
      currentClientY += 5;
    }

    if (invoice.showClientCompany !== false && client?.companyName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(client.companyName, clientX, currentClientY);
      currentClientY += 4;
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let clientInfoY = currentClientY;
    if (client?.streetAddress) {
      doc.text(client.streetAddress, clientX, clientInfoY);
      clientInfoY += 4;
    }
    if (client?.addressLine2) {
      doc.text(client.addressLine2, clientX, clientInfoY);
      clientInfoY += 4;
    }
    if (client?.zipCode || client?.city || client?.country) {
      const cityLine = [client?.zipCode, client?.city, client?.country].filter(Boolean).join(", ");
      doc.text(cityLine, clientX, clientInfoY);
      clientInfoY += 4;
    }
    if (client?.email) {
      doc.text(client.email, clientX, clientInfoY);
      clientInfoY += 4;
    }
    if (client?.vatNumber && invoice.showClientVat !== false) {
      doc.text(`VAT: ${client.vatNumber}`, clientX, clientInfoY);
    }

    // 4. Invoice Metadata
    const metaY = Math.max(companyInfoY, clientInfoY) + 15;
    doc.setDrawColor(240, 240, 240);
    doc.line(20, metaY - 5, pageWidth - 20, metaY - 5);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${t.invoice} ${invoice.invoiceNumber}`, 20, metaY + 10);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${t.issueDate} ${invoice.issueDate}`, clientX, metaY + 5);
    
    // Only add due date if invoice is not paid
    const isPaid = status === "PAID" || normalizeStatus(invoice.status) === "PAID";
    if (!isPaid) {
      doc.text(`${t.dueDate} ${invoice.dueDate}`, clientX, metaY + 10);
    }

    // 5. Items Table
    autoTable(doc, {
      startY: metaY + 25,
      head: [[t.description, t.quantity, t.unitPrice, t.total]],
      body: invoice.items.map((item) => {
        const desc = item.details 
          ? `${item.description}\n${item.details}`
          : item.description;
        return [
          desc,
          item.quantity,
          formatPrice(item.unitPrice || 0),
          formatPrice(item.total || 0),
        ];
      }),
      headStyles: { fillColor: [79, 209, 220], textColor: [0, 0, 0], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 80 }, // Description column wider
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
      styles: {
        fontSize: 9,
        lineColor: [240, 240, 240],
        lineWidth: 0.1,
      },
      margin: { left: 20, right: 20 },
    });

    // 6. Summary
    let currentY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 20;

    // Notes block (Left Side) - displayed beautifully before payment info
    if (invoice.notes && invoice.notes.trim()) {
      doc.saveGraphicsState();
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(140);
      const notesLabel = lang === "pt" ? "NOTAS / CONDIÇÕES:" : "NOTES / TERMS:";
      doc.text(notesLabel, 20, currentY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80);
      const notesLines = doc.splitTextToSize(invoice.notes, 100);
      doc.text(notesLines, 20, currentY + 5);
      doc.restoreGraphicsState();
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.setTextColor(100);
    doc.text(t.subtotal, summaryX - 50, currentY);
    doc.setTextColor(0);
    doc.text(formatPrice(invoice.subtotal || invoice.amount), summaryX, currentY, { align: 'right' });
    
    if (invoice.applyDiscount) {
      currentY += 7;
      doc.setTextColor(100);
      doc.text(`${t.discount} (${invoice.discountRate}%):`, summaryX - 50, currentY);
      doc.setTextColor(0);
      doc.text(`- ${formatPrice(invoice.discountAmount || 0)}`, summaryX, currentY, { align: 'right' });
    }
    
    if (invoice.applyVat) {
      currentY += 7;
      doc.setTextColor(100);
      doc.text(`${t.vat} (${invoice.vatRate}%):`, summaryX - 50, currentY);
      doc.setTextColor(0);
      doc.text(`+ ${formatPrice(invoice.vatAmount || 0)}`, summaryX, currentY, { align: 'right' });
    }
    
    currentY += 12;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(140);
    doc.text(t.totalAmount, summaryX, currentY, { align: 'right' });
    
    currentY += 8; // THE GAP
    doc.setFontSize(18);
    doc.setTextColor(79, 209, 220);
    doc.text(formatPrice(invoice.amount || 0), summaryX, currentY, { align: 'right' });

    // 6.5. Payment Information (Bottom)
    if (companySettings.showBankDetails || companySettings.showRevolutDetails || (companySettings.customPayments && companySettings.customPayments.some(p => p.show))) {
      let paymentY = (doc.internal.pageSize.getHeight() - 85); 
      
      // Add HR before payment methods
      doc.setDrawColor(240, 240, 240);
      doc.line(20, paymentY - 5, pageWidth - 20, paymentY - 5);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100);
      doc.text(t.paymentInfo, 20, paymentY);
      paymentY += 8;
      
      const colWidth = (pageWidth - 40) / 3;
      let colIdx = 0;
      let rowY = paymentY;

      const advancePos = () => {
        colIdx++;
        if (colIdx >= 3) {
          colIdx = 0;
          rowY += 30; // Move to next Row
        }
      };

      const getX = () => 20 + (colIdx * colWidth);

      // Bank Transfer Col
      if (companySettings.showBankDetails && companySettings.bankTransferDetails) {
        const x = getX();
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50);
        doc.text(t.bankTransfer, x, rowY);
        
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(companySettings.bankTransferDetails, colWidth - 5);
        doc.text(lines, x, rowY + 4);
        advancePos();
      }

      // Revolut Col
      if (companySettings.showRevolutDetails) {
        const x = getX();
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50);
        doc.text("REVOLUT:", x, rowY);
        
        let subY = rowY + 4;
        doc.setFont("helvetica", "normal");
        if (companySettings.revolutDetails) {
          const lines = doc.splitTextToSize(companySettings.revolutDetails, colWidth - 5);
          doc.text(lines, x, subY);
          subY += (lines.length * 4);
        }

        if (companySettings.revolutLink) {
          doc.setTextColor(79, 209, 220);
          doc.text(companySettings.revolutLink, x, subY);
          doc.setTextColor(50);
          subY += 5;
        }

        if (companySettings.revolutQrCodeUrl) {
          try {
            const qrImg = await loadImage(companySettings.revolutQrCodeUrl);
            doc.addImage(qrImg, 'PNG', x, subY, 15, 15);
          } catch (e) {
            console.error("Failed to add QR code", e);
          }
        }
        advancePos();
      }

      // Custom Payments
      if (companySettings.customPayments) {
        for (const payment of companySettings.customPayments) {
          if (payment.show) {
            const x = getX();
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(50);
            doc.text(`${payment.name.toUpperCase()}:`, x, rowY);
            
            let subY = rowY + 4;
            doc.setFont("helvetica", "normal");
            if (payment.details) {
              const lines = doc.splitTextToSize(payment.details, colWidth - 5);
              doc.text(lines, x, subY);
              subY += (lines.length * 4);
            }

            if (payment.link) {
              doc.setTextColor(79, 209, 220);
              doc.text(payment.link, x, subY);
              doc.setTextColor(50);
              subY += 5;
            }

            if (payment.qrCodeUrl) {
              try {
                const qrImg = await loadImage(payment.qrCodeUrl);
                doc.addImage(qrImg, 'PNG', x, subY, 12, 12);
              } catch (e) {
                console.error("Failed to add QR code", e);
              }
            }
            advancePos();
          }
        }
      }
    }

    // 7. Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(t.thankYou, 20, doc.internal.pageSize.getHeight() - 20);

    // 8. Stamp (If status selected)
    if (status) {
      let color: [number, number, number] = [100, 100, 100];
      if (status === "PAID") color = [34, 197, 94]; // Green
      if (status === "VOID") color = [239, 68, 68]; // Red
      if (status === "UNPAID") color = [249, 115, 22]; // Orange
      if (status === "PENDING") color = [79, 209, 220]; // Cyan
      if (status === "DUPLICATE") color = [168, 85, 247]; // Purple

      // Positioned next to payment methods at bottom right (pushed up and left)
      drawStamp((st as any)[status] || status, pageWidth - 90, pageHeight - 65, color);
    }

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  function handleViewClientProject(project: ClientProject) {
    const client = clients.find((c) => c.id === project.clientId);
    if (client) setEditingClient(client);
    setEditingClientProject(project);
    setView("client-project-view");
  }

  function handleEditClientProject(project: ClientProject) {
    const client = clients.find((c) => c.id === project.clientId);
    if (client) setEditingClient(client);
    setEditingClientProject(project);
    setView("client-project-form");
  }

  function handleUnsubscribeClientProject(project: ClientProject) {
    setEditingClientProject(project);
    setShowAdminUnsubscribeModal(true);
  }

  function handleViewInvoiceDetails(inv: Invoice) {
    handleGeneratePDF(inv);
  }

  function addHost() {
    if (!editingClientProject) return;
    const currentHosts = editingClientProject.hosts || [];
    setEditingClientProject({
      ...editingClientProject,
      hosts: [
        ...currentHosts,
        {
          domainName: "",
          providerUrl: "",
          domainProvider: "",
          domainExpiration: "2028-12-31",
          hostingType: "",
          isHostingFree: false,
          isClientProvided: false,
        },
      ],
    });
  }

  function updateHost(index: number, field: keyof Host | Partial<Host>, value?: any) {
    setEditingClientProject((prev) => {
      if (!prev || !prev.hosts) return prev;
      const newHosts = [...prev.hosts];
      if (typeof field === "object") {
        newHosts[index] = { ...newHosts[index], ...field };
      } else {
        newHosts[index] = { ...newHosts[index], [field as string]: value };
      }
      return { ...prev, hosts: newHosts };
    });
  }

  function removeHost(index: number) {
    if (!editingClientProject || !editingClientProject.hosts) return;
    const newHosts = editingClientProject.hosts.filter((_, i) => i !== index);
    setEditingClientProject({ ...editingClientProject, hosts: newHosts });
  }

  function addBudgetLine() {
    if (!editingClientProject) return;
    const currentLines = editingClientProject.budgetLines || [];
    setEditingClientProject({
      ...editingClientProject,
      budgetLines: [
        ...currentLines,
        { item: "", description: "", cost: "", isOptional: false }
      ]
    });
  }

  function updateBudgetLine(index: number, field: string, value: any) {
    if (!editingClientProject || !editingClientProject.budgetLines) return;
    const newLines = [...editingClientProject.budgetLines];
    newLines[index] = { ...newLines[index], [field]: value };
    setEditingClientProject({ ...editingClientProject, budgetLines: newLines });
  }

  function removeBudgetLine(index: number) {
    if (!editingClientProject || !editingClientProject.budgetLines) return;
    const newLines = editingClientProject.budgetLines.filter((_, i) => i !== index);
    setEditingClientProject({ ...editingClientProject, budgetLines: newLines });
  }

  const PRESET_PAGES = [
    "Homepage",
    "About Us",
    "Services",
    "Portfolio",
    "Pricing",
    "FAQ",
    "Contact Us",
    "Blog",
    "Careers",
    "Privacy Policy",
    "Terms & Conditions",
    "Cookie Policy",
  ];

  function togglePagePreset(page: string) {
    if (!editingClientProject) return;
    const currentPages = (editingClientProject.pagesList || "")
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p !== "");
    
    let updatedPages: string[];
    if (currentPages.includes(page)) {
      updatedPages = currentPages.filter((p) => p !== page);
    } else {
      updatedPages = [...currentPages, page];
    }
    
    const newPagesList = updatedPages.join("\n");
    const totalPages = updatedPages.length;
    const newPagesCount = totalPages > 0 ? `${totalPages} Page${totalPages > 1 ? "s" : ""}` : "";
    
    setEditingClientProject({
      ...editingClientProject,
      pagesList: newPagesList,
      pagesCount: newPagesCount,
    });
  }

  const PRESET_FEATURES = [
    "Database Integration",
    "Server & Backend API",
    "Testimonials & Reviews",
    "User Authentication & Roles",
    "Multilingual Support (i18n)",
    "Secure Client Portal",
    "Tailwind Visual Styling",
    "Admin Content Controls",
    "Custom Analytics Logs",
    "High-Speed Host Config",
    "Newsletter & Contact Form",
    "Dynamic Search & Filters",
  ];

  function toggleFeaturePreset(feature: string) {
    if (!editingClientProject) return;
    const currentFeatures = (editingClientProject.featuresList || "")
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f !== "");
    
    let updatedFeatures: string[];
    if (currentFeatures.includes(feature)) {
      updatedFeatures = currentFeatures.filter((f) => f !== feature);
    } else {
      updatedFeatures = [...currentFeatures, feature];
    }
    
    const newFeaturesList = updatedFeatures.join("\n");
    
    setEditingClientProject({
      ...editingClientProject,
      featuresList: newFeaturesList,
    });
  }

  async function handleSaveClientProject(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClientProject) return;

    setSavingClientProject(true);
    try {
      const projectData = { ...editingClientProject };
      const isNew = projectData.id.startsWith("client-proj-temp-");
      const projectId = projectData.id;
      delete (projectData as any).id;

      // Clean up any undefined properties to prevent Firestore serialization errors
      Object.keys(projectData).forEach((key) => {
        if ((projectData as any)[key] === undefined) {
          delete (projectData as any)[key];
        }
      });

      if (isNew) {
        await addDoc(collection(db, "clientProjects"), {
          ...projectData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showAdminToast("Internal project created successfully!", "success");
      } else {
        await updateDoc(doc(db, "clientProjects", projectId), {
          ...projectData,
          updatedAt: serverTimestamp(),
        });
        showAdminToast("Internal project updated successfully!", "success");
      }

      await fetchClientProjects();
      setView("managed-projects-list");
    } catch (error: any) {
      showAdminToast(`Failed to save project: ${error.message || error}`, "error");
      handleFirestoreError(
        error,
        editingClientProject.id.startsWith("client-proj-temp-")
          ? OperationType.CREATE
          : OperationType.UPDATE,
        "clientProjects",
      );
    } finally {
      setSavingClientProject(false);
    }
  }

  async function handleFileUpload(file: File, type: "main" | "gallery") {
    if (!auth.currentUser) {
      showAdminToast("You must be logged in to upload files", "error");
      return;
    }

    setUploading(type);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      // Determine folder name from the active project title:
      let folderName = "portfolio";
      if (formData.title) {
        const slug = formData.title
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // remove accents
          .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
          .replace(/(^-|-$)/g, ""); // remove leading/trailing hyphens
        folderName = `portfolio/${slug}`;
      } else {
        folderName = `portfolio/untitled-project`;
      }
      formDataUpload.append("folder", folderName);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const { url } = await response.json();

      if (type === "main") {
        setFormData((prev) => ({ ...prev, image: url }));
      } else {
        setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
      }
      showAdminToast("Upload successful!", "success");
    } catch (error: any) {
      console.error("Upload Error:", error);
      showAdminToast("Upload error: " + error.message, "error");
    } finally {
      setUploading(null);
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const addGalleryUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, url],
      }));
    }
  };

  const techStackOptions = TECH_STACK_OPTIONS;

  const categories = ["Portfolio", "College"];

  const institutions = ["Code Institute", "Harvard University", "none"];

  useEffect(() => {
    // Initial fetch is now handled by the auth state observer
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "projects");
    }
    setLoading(false);
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (view === "create") {
        const docRef = await addDoc(collection(db, "projects"), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(), // Add updatedAt for consistency
        });
        setProjects([{ id: docRef.id, ...formData }, ...projects]);
      } else if (view === "edit" && editingProject) {
        const projectRef = doc(db, "projects", editingProject.id);
        await updateDoc(projectRef, {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        setProjects(
          projects.map((p) =>
            p.id === editingProject.id ? { ...p, ...formData } : p,
          ),
        );
      }
      showAdminToast("Project saved successfully!", "success");
      resetForm();
      setView("portfolio-list");
    } catch (error: any) {
      console.error("Save error:", error);
      showAdminToast(`Failed to save project: ${error.message || error}`, "error");
      handleFirestoreError(
        error,
        view === "create" ? OperationType.CREATE : OperationType.UPDATE,
        "projects",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveReview(review: Partial<Review>) {
    setSavingReview(true);
    try {
      const data = {
        ...review,
        updatedAt: serverTimestamp(),
      };

      if (editingReview) {
        const reviewRef = doc(db, "reviews", editingReview.id);
        await updateDoc(reviewRef, data);
        setReviews(prev => prev.map(r => r.id === editingReview.id ? { ...r, ...data } as Review : r));
      } else {
        const docRef = await addDoc(collection(db, "reviews"), {
          ...data,
          order: reviews.length,
          show: true
        });
        setReviews(prev => [...prev, { id: docRef.id, ...data } as Review]);
      }
      setView("reviews-list");
      setEditingReview(null);
      showAdminToast(editingReview ? "Review updated successfully!" : "Review saved successfully!", "success");
    } catch (error: any) {
      showAdminToast(`Failed to save review: ${error.message || error}`, "error");
      handleFirestoreError(error, editingReview ? OperationType.UPDATE : OperationType.CREATE, "reviews");
    } finally {
      setSavingReview(false);
    }
  }

  async function handleDeleteReview(id: string) {
    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews(prev => prev.filter(r => r.id !== id));
      setReviewConfirmingDelete(null);
      showAdminToast("Review deleted successfully!", "success");
    } catch (error: any) {
      showAdminToast(`Failed to delete review: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.DELETE, `reviews/${id}`);
    }
  }

  async function toggleReviewStatus(id: string, currentStatus: boolean) {
    try {
      await updateDoc(doc(db, "reviews", id), { show: !currentStatus });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, show: !currentStatus } : r));
      showAdminToast(`Review visibility updated to ${!currentStatus ? 'Visible' : 'Hidden'}!`, "success");
    } catch (error: any) {
      showAdminToast(`Failed to update review visibility: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.UPDATE, `reviews/${id}`);
    }
  }

  async function toggleTestimonialsSection(currentStatus: boolean) {
    try {
      const docRef = doc(db, "settings", "testimonials");
      const newData = { ...testimonialsSettings, showSection: !currentStatus, updatedAt: serverTimestamp() };
      await setDoc(docRef, newData, { merge: true });
      setTestimonialsSettings(prev => ({ ...prev, showSection: !currentStatus }));
      showAdminToast(`Testimonials section ${!currentStatus ? 'enabled' : 'disabled'} successfully!`, "success");
    } catch (error: any) {
      showAdminToast(`Failed to toggle testimonials section: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.UPDATE, "settings/testimonials");
    }
  }

  async function togglePricingSection(currentStatus: boolean) {
    try {
      const docRef = doc(db, "settings", "pricing");
      const newData = { ...pricingSettings, showSection: !currentStatus, updatedAt: serverTimestamp() };
      await setDoc(docRef, newData, { merge: true });
      setPricingSettings(prev => ({ ...prev, showSection: !currentStatus }));
      showAdminToast(`Pricing section ${!currentStatus ? 'enabled' : 'disabled'} successfully!`, "success");
    } catch (error: any) {
      showAdminToast(`Failed to toggle pricing section: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.UPDATE, "settings/pricing");
    }
  }

  async function toggleNewsletterSection(currentStatus: boolean) {
    try {
      const docRef = doc(db, "settings", "newsletter");
      const newData = { ...newsletterSettings, showSection: !currentStatus, updatedAt: serverTimestamp() };
      await setDoc(docRef, newData, { merge: true });
      setNewsletterSettings(prev => ({ ...prev, showSection: !currentStatus }));
      showAdminToast(`Newsletter section ${!currentStatus ? 'enabled' : 'disabled'} successfully!`, "success");
    } catch (error: any) {
      showAdminToast(`Failed to toggle newsletter section: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.UPDATE, "settings/newsletter");
    }
  }

  async function toggleTestimonialsDisplayMode(currentMode: "grid" | "carousel") {
    const newMode = currentMode === "grid" ? "carousel" : "grid";
    try {
      const docRef = doc(db, "settings", "testimonials");
      const newData = { ...testimonialsSettings, displayMode: newMode, updatedAt: serverTimestamp() };
      await setDoc(docRef, newData, { merge: true });
      setTestimonialsSettings(prev => ({ ...prev, displayMode: newMode }));
      showAdminToast(`Testimonials display layout changed to ${newMode}!`, "success");
    } catch (error: any) {
      showAdminToast(`Failed to toggle display mode: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.UPDATE, "settings/testimonials");
    }
  }

  function resetForm() {
    setFormData(initialProjectState);
    setEditingProject(null);
    setView("portfolio-list");
  }

  function handleEdit(project: Project) {
    setEditingProject(project);
    setFormData({
      title: project.title || "",
      titlePt: project.titlePt || "",
      category: project.category || "",
      institution: project.institution || "none",
      year: project.year || "",
      image: project.image || "",
      shortDescription: project.shortDescription || "",
      shortDescriptionPt: project.shortDescriptionPt || "",
      fullDescription: project.fullDescription || "",
      fullDescriptionPt: project.fullDescriptionPt || "",
      goals: project.goals || "",
      goalsPt: project.goalsPt || "",
      liveUrl: project.liveUrl || "",
      repoUrl: project.repoUrl || "",
      techStack: project.techStack || [],
      gallery: project.gallery || [],
      isFeatured: project.isFeatured || false,
      isActive: project.isActive ?? true,
    });
    setView("edit");
  }

  async function handleDeleteProject(id: string) {
    try {
      const item = projects.find((p) => p.id === id);
      if (item) {
        await setDoc(doc(db, "trash", id), {
          originalId: id,
          type: "project",
          name: item.title || item.titlePt || "Unnamed Project",
          details: item.category || "",
          deletedAt: new Date().toISOString(),
          originalCollection: "projects",
          data: item
        });
      }
      await deleteDoc(doc(db, "projects", id));
      setProjects(projects.filter((p) => p.id !== id));
      setProjectConfirmingDelete(null);
      showAdminToast("Portfolio project moved to Trash Bin", "success");
    } catch (error: any) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  }

  async function handleDeleteClientProject(id: string) {
    try {
      const item = clientProjects.find((p) => p.id === id);
      if (item) {
        await setDoc(doc(db, "trash", id), {
          originalId: id,
          type: "project",
          name: item.projectName || "Unnamed Project",
          details: item.status || "",
          deletedAt: new Date().toISOString(),
          originalCollection: "clientProjects",
          data: item
        });
      }
      await deleteDoc(doc(db, "clientProjects", id));
      setClientProjects((prev) => prev.filter((p) => p.id !== id));
      setClientProjectConfirmingDelete(null);
      fetchClientProjects();
      showAdminToast("Client project moved to Trash Bin", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clientProjects/${id}`);
    }
  }

  async function toggleStatusUpdate(
    id: string,
    field: "isActive" | "isFeatured",
    currentVal: boolean,
  ) {
    try {
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, {
        [field]: !currentVal,
      });
      setProjects(
        projects.map((p) => (p.id === id ? { ...p, [field]: !currentVal } : p)),
      );
      showAdminToast(`Project status updated successfully!`, "success");
    } catch (error: any) {
      showAdminToast(`Failed to update project status: ${error.message || error}`, "error");
      handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
    }
  }

  const toggleTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }));
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#060b0d] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-zarco-cyan animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.hash = "";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Calculation of unread counts
  const unreadReviews = reviews.filter(r => !r.show && !seenReviewIds.includes(r.id));
  const unreadFeedbacks = clientProjects.flatMap(proj => 
    (proj.feedbacksList || []).map(fb => ({ ...fb, project: proj }))
  ).filter(fb => !seenFeedbackIds.includes(fb.id));

  // Find all assets/domains expiring within 30 days
  const expiringAssets = clientProjects.flatMap(proj => {
    const list: {
      projectId: string;
      projectName: string;
      assetName: string;
      provider: string;
      expirationDate: string;
      isHost: boolean;
      daysRemaining: number;
    }[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkExpiring = (name: string, expDate: string, _isFree: boolean | string | undefined, _showExp?: boolean | string | undefined, isHost = false) => {
      if (!expDate) return;
      
      const exp = parseFlexibleDate(expDate);
      if (!exp || isNaN(exp.getTime())) return;

      const diffTime = exp.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {
        list.push({
          projectId: proj.id,
          projectName: proj.projectName,
          assetName: name || "Custom Domain",
          provider: (isHost ? "" : proj.domainProvider) || "Unknown Provider",
          expirationDate: expDate,
          isHost,
          daysRemaining: diffDays,
        });
      }
    };

    if (proj.domainName || proj.domainExpiration) {
      checkExpiring(proj.domainName || "Primary Domain", proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration, false);
    }

    if (proj.hosts) {
      proj.hosts.forEach((h) => {
        if (h.domainName || h.domainExpiration) {
          checkExpiring(h.domainName || "Host Asset", h.domainExpiration, h.isHostingFree, h.showDomainExpiration, true);
        }
      });
    }

    return list;
  });

  const unreadExpiringAssets = expiringAssets.filter(asset => {
    const assetId = `${asset.projectId}-${asset.assetName}`;
    return !seenExpiringAssetIds.includes(assetId);
  });

  const unreadSubscriptions = clientProjects.filter(p => {
    if (!p.hasSubscription) return false;
    if (!p.subscriptionPaid && !p.subscriptionCancelled) return false;
    const signature = `${p.id}_${p.subscriptionPaid ? 'paid' : 'unpaid'}_${p.subscriptionCancelled ? 'cancelled' : 'active'}`;
    return !seenSubscriptionSignatures.includes(signature);
  });

  const newReviewsCount = unreadReviews.length;
  const newFeedbackCount = unreadFeedbacks.length;
  const expiringAssetsCount = unreadExpiringAssets.length;
  const newSubscriptionsCount = unreadSubscriptions.length;
  const hasExpiringSoonAsset = expiringAssets.length > 0;
  const hasAlerts = newReviewsCount > 0 || newFeedbackCount > 0 || expiringAssetsCount > 0 || newSubscriptionsCount > 0;

  const filteredProjects = projects.filter((project) => {
    if (!adminProjectSearch.trim()) return true;
    const queryStr = adminProjectSearch.toLowerCase().trim();
    return (
      (project.title || "").toLowerCase().includes(queryStr) ||
      (project.titlePt || "").toLowerCase().includes(queryStr) ||
      (project.year || "").toLowerCase().includes(queryStr) ||
      (project.institution || "").toLowerCase().includes(queryStr) ||
      (project.category || "").toLowerCase().includes(queryStr) ||
      (project.techStack || []).some(tech => tech.toLowerCase().includes(queryStr))
    );
  });

  const filteredInvoices = invoices.filter((invoice) => {
    if (billingTypeFilter === "subscription" && !invoice.isSubscription) return false;
    if (billingTypeFilter === "project" && invoice.isSubscription) return false;

    if (!adminBillingSearch.trim()) return true;
    const queryStr = adminBillingSearch.toLowerCase().trim();
    const client = clients.find((c) => c.id === invoice.clientId);
    const companyName = client?.companyName || "";
    const clientName = client?.fullName || "";
    const project = clientProjects.find((p) => p.id === invoice.projectId);
    const projectName = project?.projectName || "";
    const year = invoice.issueDate ? invoice.issueDate.split("-")[0] : "";
    return (
      (invoice.invoiceNumber || "").toLowerCase().includes(queryStr) ||
      companyName.toLowerCase().includes(queryStr) ||
      clientName.toLowerCase().includes(queryStr) ||
      projectName.toLowerCase().includes(queryStr) ||
      year.toLowerCase().includes(queryStr) ||
      (invoice.description || "").toLowerCase().includes(queryStr) ||
      (invoice.issueDate || "").toLowerCase().includes(queryStr)
    );
  });

  const filteredClientProjects = clientProjects.filter((proj) => {
    if (!adminClientProjectSearch.trim()) return true;
    const queryStr = adminClientProjectSearch.toLowerCase().trim();
    const client = clients.find((c) => c.id === proj.clientId);
    const clientName = client?.fullName || "";
    const companyName = client?.companyName || "";
    const year = proj.startDate ? proj.startDate.split("-")[0] : "";
    return (
      (proj.projectName || "").toLowerCase().includes(queryStr) ||
      (proj.projectType || "").toLowerCase().includes(queryStr) ||
      (proj.status || "").toLowerCase().includes(queryStr) ||
      (proj.techStack || []).some((tech) => tech.toLowerCase().includes(queryStr)) ||
      clientName.toLowerCase().includes(queryStr) ||
      companyName.toLowerCase().includes(queryStr) ||
      year.toLowerCase().includes(queryStr)
    );
  });

  const filteredAnalyticsInvoices = invoices.filter((inv) => {
    const d = new Date(inv.issueDate);
    const matchesYear = d.getFullYear().toString() === analyticsYear;
    const matchesMonth =
      analyticsMonth === "All" ||
      d.toLocaleString("en-US", { month: "long" }) === analyticsMonth;

    if (!matchesYear || !matchesMonth) return false;
    if (billingTypeFilter === "subscription" && !inv.isSubscription) return false;
    if (billingTypeFilter === "project" && inv.isSubscription) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#060b0d] text-white flex relative">
      {/* Admin Toasts */}
      <div className="fixed top-24 md:top-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 md:px-0">
        <AnimatePresence>
          {adminToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`p-4 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)] border flex items-start gap-3 backdrop-blur-md pointer-events-auto cursor-pointer ${
                toast.type === "success"
                  ? "bg-[#061813]/95 border-emerald-500/20 text-emerald-100"
                  : toast.type === "error"
                  ? "bg-[#18060a]/95 border-rose-500/20 text-rose-100"
                  : "bg-[#1a1105]/95 border-amber-500/20 text-amber-100"
              }`}
              onClick={() => setAdminToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            >
              {toast.type === "success" && <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === "error" && <X className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              
              <div className="flex-1 min-w-0">
                <div className="font-black uppercase tracking-widest text-[9px] opacity-60 mb-1">
                  {toast.type === "success" ? "Success" : toast.type === "error" ? "Failure" : "Notice"}
                </div>
                <div className="text-xs font-semibold leading-relaxed break-words">{toast.message}</div>
              </div>
              <button className="text-white/20 hover:text-white/60 transition-colors cursor-pointer self-start">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Backdrop overlay for <= 900px screen sizes */}
      {isSidebarOpen && (
        <div 
          className="hidden max-[900px]:block fixed inset-0 bg-black/60 backdrop-blur-xs z-35 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`border-r border-white/5 flex flex-col bg-[#040809] transition-all duration-300 z-40
        w-64 p-8
        max-[900px]:fixed max-[900px]:right-0 max-[900px]:left-auto max-[900px]:top-0 max-[900px]:h-full max-[900px]:border-l max-[900px]:border-r-0
        ${isSidebarOpen 
          ? "max-[900px]:w-64 max-[900px]:p-6" 
          : "max-[900px]:w-16 max-[900px]:p-3 max-[900px]:items-center"
        }
      `}>
        {/* Toggler button for <= 900px */}
        <div className="hidden max-[900px]:flex items-center justify-between w-full mb-6">
          {isSidebarOpen ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black uppercase tracking-widest text-[#4fd1dc]">Menu</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-all cursor-pointer"
                title="Collapse"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-zarco-cyan rounded-lg transition-all w-full flex items-center justify-center cursor-pointer"
              title="Expand"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Logo Section */}
        <div className={`mb-12 flex flex-col gap-1 transition-all ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>
          <img 
            src="/images/logos/zarco_logo_web_developmet_no_bg300px.jpg" 
            alt="Zarco Studios" 
            className="h-10 w-auto object-contain self-start hover:brightness-110 transition-all cursor-pointer rounded"
            referrerPolicy="no-referrer"
          />
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1 pl-1">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 space-y-2 w-full">
          <button
            onClick={() => { setView("list"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view === "list" ? "bg-white/5 text-zarco-cyan shadow-sm border border-white/5" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Dashboard</span>
            {hasAlerts && (
              <span className={`ml-auto relative ${isSidebarOpen ? 'flex h-2.5 w-2.5' : 'max-[900px]:absolute max-[900px]:top-1 max-[900px]:right-1 flex h-2 w-2'}`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
              </span>
            )}
          </button>
          <button
            onClick={() => { setView("portfolio-list"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view === "portfolio-list" || view === "create" || view === "edit" ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <FolderRoot className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Portfolio</span>
          </button>
          <button
            onClick={() => { setView("managed-projects-list"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view === "managed-projects-list" || view === "client-project-form" ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Projects</span>
            {(hasExpiringSoonAsset || newFeedbackCount > 0 || expiringAssetsCount > 0) && (
              <span className={`ml-auto relative ${isSidebarOpen ? 'flex h-2.5 w-2.5' : 'max-[900px]:absolute max-[900px]:top-1 max-[900px]:right-1 flex h-2 w-2'}`} title="Has assets expiring in less than 30 days or unread items">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
              </span>
            )}
          </button>
          <button
            onClick={() => { setView("pricing-list"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view.includes("pricing") ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Pricing</span>
          </button>
          <button
            onClick={() => { setView("clients-list"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view.includes("clients") ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Clients</span>
          </button>
          <button
            onClick={() => { setView("billing-list"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view === "billing-list" || view === "billing-form" || view === "billing-view" ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <Receipt className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Billing</span>
          </button>
          <button
            onClick={() => { setView("billing-summary"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view === "billing-summary" ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Financials</span>
          </button>
          <button
            onClick={() => {
              setView("subscriptions-view");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view === "subscriptions-view" ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <CreditCard className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Subscriptions</span>
            {newSubscriptionsCount > 0 && (
              <span className={`ml-auto relative ${isSidebarOpen ? 'flex h-2.5 w-2.5' : 'max-[900px]:absolute max-[900px]:top-1 max-[900px]:right-1 flex h-2 w-2'}`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setView("subscribers");
              fetchSubscribers();
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view === "subscribers" ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Subscribers</span>
          </button>
          <button
            onClick={() => {
              setView("reviews-list");
              fetchReviews();
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view.includes("reviews") ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <Star className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Reviews</span>
            {newReviewsCount > 0 && (
              <span className={`ml-auto relative ${isSidebarOpen ? 'flex h-2.5 w-2.5' : 'max-[900px]:absolute max-[900px]:top-1 max-[900px]:right-1 flex h-2 w-2'}`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
              </span>
            )}
          </button>
          <button
            onClick={() => { setView("settings"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view === "settings" ? "bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Settings</span>
          </button>
          <button
            onClick={() => {
              setView("trash-bin");
              fetchTrash();
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'} ${view === "trash-bin" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-white/40 hover:text-red-400/80 hover:bg-white/5"}`}
          >
            <Trash2 className="w-5 h-5 text-red-400/80 flex-shrink-0" />
            <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Trash Bin</span>
          </button>
        </nav>

        <button
          onClick={() => {
            window.location.hash = "";
            setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-left max-[900px]:gap-0 max-[900px]:justify-center ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'}`}
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Back to Site</span>
        </button>
        <button
          onClick={handleLogout}
          className={`mt-auto flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 transition-all text-left max-[900px]:gap-0 max-[900px]:justify-center max-[900px]:mt-4 ${isSidebarOpen ? 'max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:justify-start' : 'max-[900px]:px-0'}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={`text-[13px] font-bold ${isSidebarOpen ? '' : 'max-[900px]:hidden'}`}>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto max-[900px]:p-6 max-[900px]:pr-20">
        {view === "list" ? (
          <div className="space-y-16">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-6xl font-black uppercase tracking-tighter text-white">
                  Dashboard <span className="text-zarco-cyan">HQ</span>
                </h1>
                <p className="text-white/40 font-bold uppercase tracking-[0.2em] mt-4 flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zarco-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-zarco-cyan"></span>
                  </span>
                  Elite Command Center <span className="text-white/10 mx-2">|</span> v1.4.2
                </p>
              </div>
              <div className="hidden lg:flex gap-4">
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-end">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Database Latency</span>
                  <span className="text-xs font-bold text-zarco-cyan tracking-tight">24ms <span className="text-white/20 font-normal ml-1">Stable</span></span>
                </div>
              </div>
            </header>

            <AdminAttentionRequired
              newReviewsCount={newReviewsCount}
              newFeedbackCount={newFeedbackCount}
              expiringAssetsCount={expiringAssetsCount}
              unreadReviews={unreadReviews}
              unreadFeedbacks={unreadFeedbacks}
              unreadExpiringAssets={unreadExpiringAssets}
              seenReviewIds={seenReviewIds}
              setSeenReviewIds={setSeenReviewIds}
              seenFeedbackIds={seenFeedbackIds}
              setSeenFeedbackIds={setSeenFeedbackIds}
              seenExpiringAssetIds={seenExpiringAssetIds}
              setSeenExpiringAssetIds={setSeenExpiringAssetIds}
              clientProjects={clientProjects}
              setView={setView}
              setEditingClientProject={setEditingClientProject}
            />

            <AdminStatsGrid
              projectsCount={clientProjects.length}
              clientProjectsCount={clientProjects.filter((p) => !p.status || (p.status.toLowerCase() !== 'completed' && p.status.toLowerCase() !== 'cancelled')).length}
              clientsCount={clients.length}
              invoicesCount={invoices.length}
            />

            <AdminQuickNav
              setView={setView}
              pricingSettings={pricingSettings}
              newsletterSettings={newsletterSettings}
              testimonialsSettings={testimonialsSettings}
              togglePricingSection={togglePricingSection}
              toggleNewsletterSection={toggleNewsletterSection}
              toggleTestimonialsSection={toggleTestimonialsSection}
            />
          </div>
        ) : view === "subscriptions-view" ? (
          <AdminSubscriptions
            clientProjects={clientProjects}
            setClientProjects={setClientProjects}
            clients={clients}
            subSearchQuery={subSearchQuery}
            setSubSearchQuery={setSubSearchQuery}
            subFilterStatus={subFilterStatus}
            setSubFilterStatus={setSubFilterStatus}
            setEditingClientProject={setEditingClientProject}
            setView={setView}
            handleGenerateInvoiceFromSubscription={handleGenerateInvoiceFromSubscription}
            handleDeleteClientProject={handleDeleteClientProject}
            showAdminToast={showAdminToast}
            db={db}
            updateDoc={updateDoc}
            doc={doc}
          />
        ) : view === "subscribers" ? (
          <AdminSubscribers
            newsletterSettings={newsletterSettings}
            toggleNewsletterSection={toggleNewsletterSection}
            newsletterTab={newsletterTab}
            setNewsletterTab={setNewsletterTab}
            subscribers={subscribers}
            archivedNewsletters={archivedNewsletters}
            fetchArchives={fetchArchives}
            setNewsletterForm={setNewsletterForm}
            setEditingNewsletterId={setEditingNewsletterId}
            setIsComposing={setIsComposing}
            fetchSubscribers={fetchSubscribers}
            loadingSubscribers={loadingSubscribers}
            selectedEmails={selectedEmails}
            setSelectedEmails={setSelectedEmails}
            toggleSubscriberStatus={toggleSubscriberStatus}
            deleteConfirm={deleteConfirm}
            setDeleteConfirm={setDeleteConfirm}
            isDeletingSubscriber={isDeletingSubscriber}
            deleteSubscriber={deleteSubscriber}
            deleteNewsletter={deleteNewsletter}
            isComposing={isComposing}
            newsletterForm={newsletterForm}
            sendNewsletter={sendNewsletter}
            saveNewsletter={saveNewsletter}
            savingNewsletter={savingNewsletter}
            sendingNewsletter={sendingNewsletter}
            isPreviewing={isPreviewing}
            setIsPreviewing={setIsPreviewing}
            companySettings={companySettings}
            loadDraft={loadDraft}
            loadingArchives={loadingArchives}
          />
        ) : view === "reviews-list" || view === "reviews-form" ? (
          <AdminReviews
            view={view}
            setView={setView}
            reviews={reviews}
            editingReview={editingReview}
            setEditingReview={setEditingReview}
            loadingReviews={loadingReviews}
            savingReview={savingReview}
            testimonialsSettings={testimonialsSettings}
            toggleTestimonialsSection={toggleTestimonialsSection}
            toggleTestimonialsDisplayMode={toggleTestimonialsDisplayMode}
            toggleReviewStatus={toggleReviewStatus}
            handleSaveReview={handleSaveReview}
            handleDeleteReview={handleDeleteReview}
            uploadToCloudinary={uploadToCloudinary}
            showAdminToast={showAdminToast}
          />
        ) : view === "trash-bin" ? (
          <AdminTrashBin
            trashItems={trashItems}
            setTrashItems={setTrashItems}
            loadingTrash={loadingTrash}
            handleRestoreTrashItem={handleRestoreTrashItem}
            handlePermanentDelete={handlePermanentDelete}
            showAdminToast={showAdminToast}
          />
        ) : view === "settings" ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                  Agency Configuration
                </h2>
                <p className="text-white/40 text-sm italic uppercase tracking-widest">
                  Manage your agency's legal details and billing information.
                </p>
              </div>
              <Button
                form="settings-form"
                type="submit"
                disabled={savingSettings || uploading !== null}
                className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none"
              >
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>

            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
              <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-8">
                <div className="flex flex-col items-center justify-center mb-10 pb-10 border-b border-white/5">
                  <div className="relative group">
                    <label className="cursor-pointer block">
                      <div className="w-32 h-32 rounded-3xl bg-[#0c1417] border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-zarco-cyan/50">
                        {companySettings.logoUrl ? (
                          <img 
                            src={companySettings.logoUrl} 
                            alt="Company Logo" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-white/10 group-hover:text-zarco-cyan/50 transition-colors" />
                        )}
                        {uploading === "logo" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-zarco-cyan animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-zarco-cyan rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Upload className="w-4 h-4 text-black" />
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </div>
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-6">
                    Company Logo
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Company Name
                    </label>
                    <Input
                      required
                      value={companySettings.companyName || ""}
                      onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      placeholder="Zarco Studios"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      CRO Number
                    </label>
                    <Input
                      value={companySettings.croNumber || ""}
                      onChange={(e) => setCompanySettings({...companySettings, croNumber: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      placeholder="Agency Registration ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Freelancer Name
                    </label>
                    <Input
                      value={companySettings.freelancerName || ""}
                      onChange={(e) => setCompanySettings({...companySettings, freelancerName: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      placeholder="Professional Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Business Type
                    </label>
                    <Input
                      value={companySettings.businessType || ""}
                      onChange={(e) => setCompanySettings({...companySettings, businessType: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      placeholder="Limited Company / Freelance"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Address Line 1
                    </label>
                    <Input
                      value={companySettings.addressLine1 || ""}
                      onChange={(e) => setCompanySettings({...companySettings, addressLine1: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      placeholder="123 Creative St, Design Quarter"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Address Line 2
                    </label>
                    <Input
                      value={companySettings.addressLine2 || ""}
                      onChange={(e) => setCompanySettings({...companySettings, addressLine2: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      placeholder="Suite 4B, 3rd Floor"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Zip Code
                    </label>
                    <Input
                      value={companySettings.zipCode || ""}
                      onChange={(e) => setCompanySettings({...companySettings, zipCode: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      placeholder="1234-567"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Billing Email
                    </label>
                    <Input
                      type="email"
                      value={companySettings.email || ""}
                      onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      placeholder="billing@zarco.studio"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      VAT Number / Tax ID
                    </label>
                    <Input
                      value={companySettings.vatNumber || ""}
                      onChange={(e) => setCompanySettings({...companySettings, vatNumber: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      placeholder="GB 123456789"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        WhatsApp Number (EN)
                      </label>
                      <Input
                        value={companySettings.whatsappNumber || ""}
                        onChange={(e) => setCompanySettings({...companySettings, whatsappNumber: e.target.value})}
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        placeholder="+44 7000 000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        WhatsApp Number (PT)
                      </label>
                      <Input
                        value={companySettings.whatsappNumberPT || ""}
                        onChange={(e) => setCompanySettings({...companySettings, whatsappNumberPT: e.target.value})}
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        placeholder="+351 900 000 000"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Invoice Numbering
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sequential Auto-Generation</h4>
                      <p className="text-[10px] text-white/40 uppercase font-medium tracking-tight">System automatically assigns the next sequential number</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setCompanySettings({...companySettings, autoGenerateInvoices: !companySettings.autoGenerateInvoices})}
                      className={`h-10 px-6 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                        companySettings.autoGenerateInvoices 
                          ? "bg-zarco-cyan text-black shadow-lg shadow-zarco-cyan/20" 
                          : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {companySettings.autoGenerateInvoices ? "Active" : "Manual"}
                    </Button>
                  </div>

                  <div className={`grid grid-cols-2 gap-8 transition-all duration-300 ${!companySettings.autoGenerateInvoices ? "opacity-50 scale-98" : ""}`}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Invoice Prefix
                      </label>
                      <Input
                        value={companySettings.invoicePrefix || "INV"}
                        onChange={(e) => setCompanySettings({...companySettings, invoicePrefix: e.target.value})}
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        placeholder="INV"
                      />
                      <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest mt-1">
                        Applied as: {companySettings.invoicePrefix || "INV"}-{new Date().getFullYear()}-0001
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Next Sequence Number
                        </label>
                        <button
                          type="button"
                          onClick={() => setCompanySettings({...companySettings, nextInvoiceNumber: 1})}
                          className="text-[9px] font-bold text-zarco-cyan uppercase tracking-widest hover:underline"
                        >
                          Reset to 0001
                        </button>
                      </div>
                      <Input
                        type="number"
                        value={companySettings.nextInvoiceNumber || 1}
                        onChange={(e) => setCompanySettings({...companySettings, nextInvoiceNumber: Number(e.target.value)})}
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        placeholder="1"
                      />
                      <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest mt-1">
                        The next sequential number to be assigned
                      </p>
                    </div>
                  </div>
                  {!companySettings.autoGenerateInvoices && (
                    <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                      <p className="text-[10px] text-orange-400 uppercase font-bold tracking-widest text-center">
                        Manual Mode: You will need to enter the Invoice ID for each invoice manually.
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Methods Section */}
                <div className="pt-10 border-t border-white/5 space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">💳</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">Payment Methods</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Bank Transfer */}
                    <Card className="bg-[#0c1417] border-white/10 p-8 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <span className="text-lg">🏦</span>
                          </div>
                          <label className="text-xs font-bold text-white uppercase tracking-widest">Bank Transfer</label>
                        </div>
                        <input 
                          type="checkbox"
                          checked={companySettings.showBankDetails}
                          onChange={(e) => setCompanySettings({...companySettings, showBankDetails: e.target.checked})}
                          className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                        />
                      </div>
                      <div className="space-y-4 pt-2">
                        <textarea
                          value={companySettings.bankTransferDetails}
                          onChange={(e) => setCompanySettings({...companySettings, bankTransferDetails: e.target.value})}
                          placeholder="Bank Name: Zarco Bank
IBAN: GB00 0000 0000 0000
SWIFT: ABCDEFGH"
                          className="w-full bg-black/20 border border-white/10 rounded-xl p-4 h-32 focus:outline-none focus:border-zarco-cyan text-sm text-white/70"
                        />
                        <p className="text-[9px] text-white/20 uppercase font-medium">Include IBAN, SWIFT, and Account Name</p>
                      </div>
                    </Card>

                    {/* Revolut */}
                    <Card className="bg-[#0c1417] border-white/10 p-8 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <span className="text-xl">💸</span>
                          </div>
                          <label className="text-xs font-bold text-white uppercase tracking-widest">Revolut</label>
                        </div>
                        <input 
                          type="checkbox"
                          checked={companySettings.showRevolutDetails}
                          onChange={(e) => setCompanySettings({...companySettings, showRevolutDetails: e.target.checked})}
                          className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                        />
                      </div>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Revolut Tag / Details</label>
                          <textarea
                            value={companySettings.revolutDetails}
                            onChange={(e) => setCompanySettings({...companySettings, revolutDetails: e.target.value})}
                            placeholder="Revolut Tag: @zarco.studio"
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 h-24 focus:outline-none focus:border-zarco-cyan text-sm text-white/70"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Payment Link</label>
                          <Input 
                            value={companySettings.revolutLink}
                            onChange={(e) => setCompanySettings({...companySettings, revolutLink: e.target.value})}
                            placeholder="e.g. revolut.me/zarco"
                            className="bg-black/20 border-white/10 h-12 text-sm"
                          />
                        </div>

                        <div className="pt-2">
                          <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest block mb-2">
                            Revolut QR Code
                          </label>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                              {companySettings.revolutQrCodeUrl ? (
                                <img src={companySettings.revolutQrCodeUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-xl opacity-20">🔲</span>
                              )}
                            </div>
                            <label className="h-10 px-4 bg-zarco-cyan/10 border border-zarco-cyan/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-zarco-cyan/20 transition-all">
                              <Upload className="w-3 h-3 mr-2 text-zarco-cyan" />
                              <span className="text-[10px] font-black uppercase text-zarco-cyan tracking-widest">
                                {uploading === "qrcode" ? "Uploading..." : "Upload QR"}
                              </span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleQrCodeUpload(e, "revolut")}
                                disabled={uploading !== null}
                              />
                            </label>
                            {companySettings.revolutQrCodeUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setCompanySettings({...companySettings, revolutQrCodeUrl: ""})}
                                className="text-red-500/40 hover:text-red-500 text-[8px] uppercase font-bold"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-[9px] text-white/20 uppercase font-medium">Revolut Business Tag, Link or QR Code</p>
                      </div>
                    </Card>

                    {/* Custom Payment Providers */}
                    {(companySettings.customPayments || []).map((payment, idx) => (
                      <Card key={payment.id} className="bg-[#0c1417] border-white/10 p-8 rounded-3xl space-y-4 relative">
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newPayments = (companySettings.customPayments || []).filter(p => p.id !== payment.id);
                              setCompanySettings({...companySettings, customPayments: newPayments});
                            }}
                            className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                              <span className="text-xl">🛠️</span>
                            </div>
                            <div className="space-y-1">
                              <Input 
                                value={payment.name}
                                onChange={(e) => {
                                  const newPayments = companySettings.customPayments?.map(p => 
                                    p.id === payment.id ? { ...p, name: e.target.value } : p
                                  );
                                  setCompanySettings({...companySettings, customPayments: newPayments});
                                }}
                                placeholder="Provider Name (e.g. Stripe)"
                                className="bg-transparent border-none p-0 h-auto text-xs font-bold text-white uppercase tracking-widest focus-visible:ring-0"
                              />
                            </div>
                          </div>
                          <input 
                            type="checkbox"
                            checked={payment.show}
                            onChange={(e) => {
                              const newPayments = companySettings.customPayments?.map(p => 
                                p.id === payment.id ? { ...p, show: e.target.checked } : p
                              );
                              setCompanySettings({...companySettings, customPayments: newPayments});
                            }}
                            className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                          />
                        </div>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Payment Details</label>
                            <textarea
                              value={payment.details}
                              onChange={(e) => {
                                const newPayments = companySettings.customPayments?.map(p => 
                                  p.id === payment.id ? { ...p, details: e.target.value } : p
                                );
                                setCompanySettings({...companySettings, customPayments: newPayments});
                              }}
                              placeholder="e.g. Account Number or Instructions"
                              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 h-24 focus:outline-none focus:border-zarco-cyan text-sm text-white/70"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">External Link</label>
                            <Input 
                              value={payment.link}
                              onChange={(e) => {
                                const newPayments = companySettings.customPayments?.map(p => 
                                  p.id === payment.id ? { ...p, link: e.target.value } : p
                                );
                                setCompanySettings({...companySettings, customPayments: newPayments});
                              }}
                              placeholder="e.g. stripe.com/pay/xyz"
                              className="bg-black/20 border-white/10 h-12 text-sm"
                            />
                          </div>

                          <div className="pt-2">
                            <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest block mb-2">
                              Provider QR Code
                            </label>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                                {payment.qrCodeUrl ? (
                                  <img src={payment.qrCodeUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  <span className="text-xl opacity-20">🔲</span>
                                )}
                              </div>
                              <label className="h-10 px-4 bg-zarco-cyan/10 border border-zarco-cyan/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-zarco-cyan/20 transition-all">
                                <Upload className="w-3 h-3 mr-2 text-zarco-cyan" />
                                <span className="text-[10px] font-black uppercase text-zarco-cyan tracking-widest">
                                  {uploading === `custom_qrcode_${payment.id}` ? "Uploading..." : "Upload QR"}
                                </span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleQrCodeUpload(e, "custom", payment.id)}
                                  disabled={uploading !== null}
                                />
                              </label>
                              {payment.qrCodeUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPayments = companySettings.customPayments?.map(p => 
                                      p.id === payment.id ? { ...p, qrCodeUrl: "" } : p
                                    );
                                    setCompanySettings({...companySettings, customPayments: newPayments});
                                  }}
                                  className="text-red-500/40 hover:text-red-500 text-[8px] uppercase font-bold"
                                >
                                  Remove QR
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Add Another Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newPayment = {
                          id: Date.now().toString(),
                          name: "Custom Provider",
                          details: "",
                          link: "",
                          qrCodeUrl: "",
                          show: true
                        };
                        setCompanySettings({
                          ...companySettings,
                          customPayments: [...(companySettings.customPayments || []), newPayment]
                        });
                      }}
                      className="border-2 border-dashed border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-zarco-cyan/20 hover:bg-zarco-cyan/5 transition-all text-white/20 hover:text-zarco-cyan group"
                    >
                      <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Another Provider</span>
                    </button>
                  </div>
                </div>

                {/* Trust Integrations */}
                <div className="space-y-6 pt-10 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">⭐</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">Trust Integrations</h3>
                  </div>

                  <Card className="bg-[#0c1417] border-white/10 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <span className="text-lg">📈</span>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-white uppercase tracking-widest block">Trust Widget Script / HTML Code</label>
                          <p className="text-[9px] text-white/30 uppercase font-medium mt-0.5">Embed Google, Trustpilot, or custom rating HTML/script code</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Show on Home Page</span>
                        <input 
                          type="checkbox"
                          checked={companySettings.showTrustWidget}
                          onChange={(e) => setCompanySettings({...companySettings, showTrustWidget: e.target.checked})}
                          className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        value={companySettings.trustWidgetCode}
                        onChange={(e) => setCompanySettings({...companySettings, trustWidgetCode: e.target.value})}
                        placeholder={`e.g. <div class="trustpilot-widget" data-locale="en-GB" data-template-id="...">...</div>`}
                        className="w-full bg-black/25 border border-white/10 rounded-2xl p-6 h-40 focus:outline-none focus:border-zarco-cyan text-xs text-white/70 font-mono leading-relaxed"
                      />
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        Copy and paste the raw HTML or embed script code provided by Trustpilot, Google Reviews, or any other platform here. It will render cleanly right after the Hero section on your landing page.
                      </p>
                    </div>
                  </Card>
                </div>
              </form>
            </Card>

            <div className="mt-16 mb-8">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">System Configuration</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mt-2 italic">Live Environment & Section Visibility Controls</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-10 space-y-10">
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-zarco-cyan/10 flex items-center justify-center">
                      <Eye className="w-7 h-7 text-zarco-cyan" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Public Visibility</h3>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Toggle key homepage sections results in real-time</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Pricing</h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Control visibility of investment plans</p>
                    </div>
                    <Button
                      onClick={() => togglePricingSection(pricingSettings.showSection)}
                      className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        pricingSettings.showSection 
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {pricingSettings.showSection ? "Visible" : "Hidden"}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Newsletter</h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Toggle subscriber active features</p>
                    </div>
                    <Button
                      onClick={() => toggleNewsletterSection(newsletterSettings.showSection)}
                      className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        newsletterSettings.showSection 
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {newsletterSettings.showSection ? "Visible" : "Hidden"}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Reviews</h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Manage client review visibility</p>
                    </div>
                    <Button
                      onClick={() => toggleTestimonialsSection(testimonialsSettings.showSection)}
                      className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        testimonialsSettings.showSection 
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {testimonialsSettings.showSection ? "Visible" : "Hidden"}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">WhatsApp</h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Toggle live support widget</p>
                    </div>
                    <Button
                      onClick={() => toggleWhatsappButton(companySettings.showWhatsappButton || false)}
                      className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        companySettings.showWhatsappButton 
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {companySettings.showWhatsappButton ? "Visible" : "Hidden"}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Trust Widget</h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Toggle trust badges section</p>
                    </div>
                    <Button
                      onClick={() => toggleTrustWidget(companySettings.showTrustWidget || false)}
                      className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        companySettings.showTrustWidget 
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {companySettings.showTrustWidget ? "Visible" : "Hidden"}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Maintenance</h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Toggle maintenance landing page</p>
                    </div>
                    <Button
                      onClick={() => toggleMaintenance(companySettings.showMaintenance || false)}
                      className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        companySettings.showMaintenance 
                          ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 font-black" 
                          : "bg-green-500/10 text-green-500 border border-green-500/20"
                      }`}
                    >
                      {companySettings.showMaintenance ? "Maintenance ON" : "Normal Mode"}
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zarco-cyan/5 border border-zarco-cyan/10 rounded-[2rem] p-8">
                  <h4 className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest mb-4">Branding Integrity</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed italic">
                    This information will be automatically reflected on all generated invoices. Ensure accuracy to maintain professional standards.
                  </p>
                </Card>
                <Card className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Tax Compliance</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed italic">
                    VAT and Tax IDs are required for European and International transactions. Updates are logged for financial auditing.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        ) : view === "portfolio-list" || view === "create" || view === "edit" ? (
          <AdminPortfolio
            view={view}
            setView={setView}
            projects={projects}
            filteredProjects={filteredProjects}
            adminProjectSearch={adminProjectSearch}
            setAdminProjectSearch={setAdminProjectSearch}
            projectConfirmingDelete={projectConfirmingDelete}
            setProjectConfirmingDelete={setProjectConfirmingDelete}
            formData={formData}
            setFormData={setFormData}
            uploading={uploading}
            handleAddNewPortfolioProject={handleAddNewPortfolioProject}
            handleEdit={handleEdit}
            handleDeleteProject={handleDeleteProject}
            handleSaveProject={handleSaveProject}
            toggleStatusUpdate={toggleStatusUpdate}
            handleFileUpload={handleFileUpload}
            addGalleryUrl={addGalleryUrl}
            removeGalleryImage={removeGalleryImage}
            toggleTech={toggleTech}
            resetForm={resetForm}
          />
        ) : view === "pricing-list" ? (
          <div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                  Pricing Management
                </h2>
                <p className="text-white/40 text-sm">
                  Review and manage your service tiers and pricing visibility.
                </p>
              </div>
              <Button
                onClick={handleAddPlan}
                className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none"
              >
                Create New Plan
              </Button>
            </div>

            <div className="bg-[#0a1114] border border-white/5 rounded-[2rem] p-6 mb-12 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${pricingSettings.showSection ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {pricingSettings.showSection ? (
                    <Eye className="w-6 h-6 text-green-500" />
                  ) : (
                    <EyeOff className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Homepage Visibility</p>
                  <p className={`text-base font-black uppercase tracking-widest ${pricingSettings.showSection ? "text-green-500" : "text-red-500"}`}>
                    Section is {pricingSettings.showSection ? "Currently Live" : "Now Hidden"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => togglePricingSection(pricingSettings.showSection)}
                className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${
                  pricingSettings.showSection 
                    ? "bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" 
                    : "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
                }`}
              >
                {pricingSettings.showSection ? "Disable Component" : "Enable Component"}
              </Button>
            </div>

            <div className="grid gap-6">
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                  <Loader2 className="w-12 h-12 text-zarco-cyan animate-spin mb-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 italic">
                    Syncing Pricing Data...
                  </h3>
                </div>
              ) : pricingPlans.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                  <Settings className="w-12 h-12 text-white/10 mb-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 mb-6">
                    No plans configured
                  </h3>
                  <Button
                    onClick={async () => {
                      const { setDoc, doc } =
                        await import("firebase/firestore");
                      const defaults = [
                        {
                          id: "hourly",
                          nameEn: "Hourly",
                          namePt: "Por Hora",
                          price: 65,
                          priceSuffixEn: "/ Ex VAT",
                          priceSuffixPt: "/ Sem IVA",
                          descriptionEn:
                            "Pay only for the time you need— no long-term commitment.",
                          descriptionPt:
                            "Pague apenas pelo tempo que necessita— sem compromissos a longo prazo.",
                          buttonTextEn: "Enquire Now",
                          buttonTextPt: "Pedir Orçamento",
                          servicesEn: [
                            "Website updates or fixes",
                            "No ongoing commitment",
                            "Fast turnaround on small tasks",
                          ],
                          servicesPt: [
                            "Atualizações ou correções",
                            "Sem compromisso contínuo",
                            "Entrega rápida de pequenas tarefas",
                          ],
                          show: true,
                          isHighlighted: false,
                          discountPercentage: 0,
                          periodicity: "Hourly",
                          order: 0,
                        },
                        {
                          id: "monthly",
                          nameEn: "Monthly",
                          namePt: "Mensal",
                          price: 2250,
                          priceSuffixEn: "/ Ex VAT",
                          priceSuffixPt: "/ Sem IVA",
                          descriptionEn:
                            "Ideal if you need help throughout the month on new or ongoing projects.",
                          descriptionPt:
                            "Ideal se precisar de ajuda ao longo do mês em projetos novos ou em curso.",
                          buttonTextEn: "Enquire Now",
                          buttonTextPt: "Pedir Orçamento",
                          servicesEn: [
                            "Priority Site Support",
                            "Ongoing Site Updates",
                            "New Features Monthly",
                          ],
                          servicesPt: [
                            "Suporte Prioritário",
                            "Atualizações Contínuas",
                            "Novas Funcionalidades",
                          ],
                          show: true,
                          isHighlighted: true,
                          discountPercentage: 0,
                          periodicity: "Monthly",
                          order: 1,
                        },
                        {
                          id: "project",
                          nameEn: "Project",
                          namePt: "Projeto",
                          price: 0,
                          priceSuffixEn: "Custom",
                          priceSuffixPt: "Sob Consulta",
                          descriptionEn:
                            "Tailored website projects designed for real business growth.",
                          descriptionPt:
                            "Projetos de websites personalizados criados para o crescimento real do negócio.",
                          buttonTextEn: "Enquire Now",
                          buttonTextPt: "Pedir Orçamento",
                          servicesEn: [
                            "Premium Website Build",
                            "24/7 Support",
                            "Strategy-Led Approach",
                          ],
                          servicesPt: [
                            "Construção Premium",
                            "Suporte 24/7",
                            "Abordagem Estratégica",
                          ],
                          show: true,
                          isHighlighted: false,
                          discountPercentage: 0,
                          periodicity: "One Time",
                          order: 2,
                        },
                      ];
                      setLoading(true);
                      try {
                        for (const d of defaults) {
                          await setDoc(doc(db, "pricing", d.id), {
                            ...d,
                            updatedAt: serverTimestamp(),
                          });
                        }
                        showAdminToast("Default plans seeded to database!", "success");
                        fetchPricing();
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-zarco-cyan/20"
                  >
                    Seed Default Plans to Database
                  </Button>
                </div>
              ) : (
                pricingPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`bg-[#0a1114] border-white/5 rounded-[2rem] p-8 group hover:border-zarco-cyan/20 transition-all ${!plan.show ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-10 flex-1">
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest mb-1">
                            {plan.periodicity}
                          </span>
                          <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                            {plan.nameEn}
                          </h3>
                          <p className="text-xs text-white/40 line-clamp-2 leading-relaxed max-w-sm mb-3">
                            {plan.descriptionEn}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {plan.servicesEn.slice(0, 3).map((s, i) => (
                              <span
                                key={i}
                                className="text-[9px] font-bold text-white/20 uppercase tracking-tighter border border-white/5 px-2 py-0.5 rounded-md"
                              >
                                {s}
                              </span>
                            ))}
                            {plan.servicesEn.length > 3 && (
                              <span className="text-[9px] font-bold text-white/20 uppercase">
                                +{plan.servicesEn.length - 3} More
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-16 w-px bg-white/5" />
                        <div className="flex flex-col min-w-[120px]">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
                            Base Price
                          </span>
                          <span className="text-xl font-bold">
                            €{plan.price}
                          </span>
                          <span className="text-[10px] text-white/30 font-medium">
                            {plan.priceSuffixEn}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          {plan.discountPercentage > 0 && (
                            <div className="px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                                -{plan.discountPercentage}% OFF
                              </span>
                            </div>
                          )}
                          {plan.isHighlighted && (
                            <div className="px-3 py-1 bg-zarco-cyan/10 rounded-full border border-zarco-cyan/20">
                              <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest">
                                Featured
                              </span>
                            </div>
                          )}
                          {!plan.show && (
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                                Hidden
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Button
                          variant="ghost"
                          onClick={() => handleEditPlan(plan)}
                          className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-zarco-cyan hover:text-white hover:bg-zarco-cyan/10"
                        >
                          Manage Plan
                        </Button>
                        
                        {planConfirmingDelete === plan.id ? (
                          <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeletePlan(plan.id);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 h-10 rounded-xl transition-all active:scale-95"
                            >
                              Confirm
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPlanConfirmingDelete(null);
                              }}
                              className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 h-10 rounded-xl transition-all"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              console.log("Delete button clicked for pricing plan:", plan.id);
                              e.preventDefault();
                              e.stopPropagation();
                              setPlanConfirmingDelete(plan.id);
                            }}
                            className="text-white/30 hover:text-white hover:bg-red-500 h-10 w-10 flex items-center justify-center transition-all rounded-xl border border-white/5 active:scale-95"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : view === "pricing-form" && editingPlan ? (
          <form onSubmit={handleSavePlan} className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                  {editingPlan.id.startsWith("plan-") &&
                  !pricingPlans.find((p) => p.id === editingPlan.id)
                    ? "Create Pricing Plan"
                    : "Edit Pricing Plan"}
                </h2>
                <p className="text-white/40 text-sm">
                  Configure your plan details, features, and multi-language
                  support.
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setView("pricing-list")}
                  variant="outline"
                  className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={savingPricing}
                  className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
                >
                  {savingPricing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Plan"
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-white/60">
                      Display plan publicly
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPlan({
                          ...editingPlan,
                          show: !editingPlan.show,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingPlan.show ? "bg-zarco-cyan" : "bg-white/10"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingPlan.show ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-white/60">
                      Highlight as featured
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPlan({
                          ...editingPlan,
                          isHighlighted: !editingPlan.isHighlighted,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingPlan.isHighlighted ? "bg-zarco-cyan" : "bg-white/10"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingPlan.isHighlighted ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* EN Column */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-zarco-cyan" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zarco-cyan">
                        English Content
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase">
                            Plan Name
                          </label>
                          <Input
                            required
                            value={editingPlan.nameEn}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                nameEn: e.target.value,
                              })
                            }
                            className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase">
                            Price Suffix
                          </label>
                          <Input
                            value={editingPlan.priceSuffixEn}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                priceSuffixEn: e.target.value,
                              })
                            }
                            placeholder="/ Ex VAT"
                            className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase">
                          Description
                        </label>
                        <textarea
                          value={editingPlan.descriptionEn}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              descriptionEn: e.target.value,
                            })
                          }
                          className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[80px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase">
                          Button Text
                        </label>
                        <Input
                          value={editingPlan.buttonTextEn}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              buttonTextEn: e.target.value,
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-white/30 uppercase">
                            Services / Features
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingPlan({
                                ...editingPlan,
                                servicesEn: [...editingPlan.servicesEn, ""],
                              })
                            }
                            className="text-zarco-cyan text-[10px] font-black uppercase hover:underline"
                          >
                            + Add Service
                          </button>
                        </div>
                        <div className="space-y-2">
                          {editingPlan.servicesEn.map((service, sIndex) => (
                            <div key={sIndex} className="flex gap-2">
                              <Input
                                value={service}
                                onChange={(e) => {
                                  const newServices = [
                                    ...editingPlan.servicesEn,
                                  ];
                                  newServices[sIndex] = e.target.value;
                                  setEditingPlan({
                                    ...editingPlan,
                                    servicesEn: newServices,
                                  });
                                }}
                                className="bg-[#0c1417] border-white/10 rounded-xl h-10 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingPlan({
                                    ...editingPlan,
                                    servicesEn: editingPlan.servicesEn.filter(
                                      (_, i) => i !== sIndex,
                                    ),
                                  })
                                }
                                className="p-2 text-white/20 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PT Column */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Portuguese Content
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase">
                            Nome do Plano
                          </label>
                          <Input
                            value={editingPlan.namePt}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                namePt: e.target.value,
                              })
                            }
                            className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase">
                            Sufixo de Preço
                          </label>
                          <Input
                            value={editingPlan.priceSuffixPt}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                priceSuffixPt: e.target.value,
                              })
                            }
                            placeholder="/ Sem IVA"
                            className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase">
                          Descrição
                        </label>
                        <textarea
                          value={editingPlan.descriptionPt}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              descriptionPt: e.target.value,
                            })
                          }
                          className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[80px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase">
                          Texto do Botão
                        </label>
                        <Input
                          value={editingPlan.buttonTextPt}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              buttonTextPt: e.target.value,
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-white/30 uppercase">
                            Serviços / Funcionalidades
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingPlan({
                                ...editingPlan,
                                servicesPt: [...editingPlan.servicesPt, ""],
                              })
                            }
                            className="text-white/40 text-[10px] font-black uppercase hover:underline"
                          >
                            + Adicionar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {editingPlan.servicesPt.map((service, sIndex) => (
                            <div key={sIndex} className="flex gap-2">
                              <Input
                                value={service}
                                onChange={(e) => {
                                  const newServices = [
                                    ...editingPlan.servicesPt,
                                  ];
                                  newServices[sIndex] = e.target.value;
                                  setEditingPlan({
                                    ...editingPlan,
                                    servicesPt: newServices,
                                  });
                                }}
                                className="bg-[#0c1417] border-white/10 rounded-xl h-10 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingPlan({
                                    ...editingPlan,
                                    servicesPt: editingPlan.servicesPt.filter(
                                      (_, i) => i !== sIndex,
                                    ),
                                  })
                                }
                                className="p-2 text-white/20 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-end mt-12 pt-8 border-t border-white/5">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase">
                          Base Price (€)
                        </label>
                        <Input
                          type="number"
                          required
                          value={editingPlan.price}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              price: Number(e.target.value),
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase">
                          Discount (%)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editingPlan.discountPercentage}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              discountPercentage: Number(e.target.value),
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase">
                          Periodicity
                        </label>
                        <div className="relative">
                          <select
                            value={editingPlan.periodicity}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                periodicity: e.target.value,
                              })
                            }
                            className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-xs"
                          >
                            {[
                              "Hourly",
                              "Monthly",
                              "Yearly",
                              "One Time",
                              "2 Years",
                              "One Time Purchase",
                            ].map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase">
                          Display Order
                        </label>
                        <Input
                          type="number"
                          value={editingPlan.order}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              order: Number(e.target.value),
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-64 p-6 bg-zarco-cyan/5 rounded-2xl border border-zarco-cyan/10">
                    <p className="text-[10px] font-bold text-white/40 uppercase mb-2">
                      Preview Final Price
                    </p>
                    <p className="text-3xl font-black text-white leading-none">
                      €
                      {(
                        editingPlan.price *
                        (1 - editingPlan.discountPercentage / 100)
                      ).toFixed(0)}
                      <span className="text-xs text-white/30 ml-2">
                        {editingPlan.priceSuffixEn}
                      </span>
                    </p>
                    {editingPlan.discountPercentage > 0 && (
                      <p className="text-[10px] font-bold text-zarco-cyan uppercase mt-2">
                        -{editingPlan.discountPercentage}% APPLIED
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </form>
        ) : ["clients-list", "clients-view", "clients-form"].includes(view) ? (
          <AdminClients
            view={view}
            setView={setView}
            clients={clients}
            loadingClients={loadingClients}
            savingClient={savingClient}
            editingClient={editingClient}
            setEditingClient={setEditingClient}
            clientProjects={clientProjects}
            invoices={invoices}
            clientConfirmingDelete={clientConfirmingDelete}
            setClientConfirmingDelete={setClientConfirmingDelete}
            handleViewClient={handleViewClient}
            handleEditClient={handleEditClient}
            handleAddClient={handleAddClient}
            handleDeleteClient={handleDeleteClient}
            handleSaveClient={handleSaveClient}
            handleAddClientProject={handleAddClientProject}
            INDUSTRIES={INDUSTRIES}
            BUSINESS_TYPES={BUSINESS_TYPES}
          />
        ) : ["managed-projects-list", "client-project-view", "client-project-form"].includes(view) ? (
          <AdminProjects
            view={view}
            setView={setView}
            clientProjects={clientProjects}
            setClientProjects={setClientProjects}
            clients={clients}
            invoices={invoices}
            loadingClientProjects={loadingClientProjects}
            savingClientProject={savingClientProject}
            editingClientProject={editingClientProject}
            setEditingClientProject={setEditingClientProject}
            editingClient={editingClient}
            setEditingClient={setEditingClient}
            adminClientProjectSearch={adminClientProjectSearch}
            setAdminClientProjectSearch={setAdminClientProjectSearch}
            clientProjectConfirmingDelete={clientProjectConfirmingDelete}
            setClientProjectConfirmingDelete={setClientProjectConfirmingDelete}
            handleAddNewManagedProject={handleAddNewManagedProject}
            handleViewClientProject={handleViewClientProject}
            handleEditClientProject={handleEditClientProject}
            handleDeleteClientProject={handleDeleteClientProject}
            handleSaveClientProject={handleSaveClientProject}
            handleUnsubscribeClientProject={handleUnsubscribeClientProject}
            uploadToCloudinary={uploadToCloudinary}
            setShowFullDescModal={setShowFullDescModal}
          />
        ) : ["billing-summary", "billing-list", "billing-form"].includes(view) ? (
          <AdminBilling
            view={view}
            setView={setView}
            clients={clients}
            invoices={invoices}
            setInvoices={setInvoices}
            loadingInvoices={loadingInvoices}
            savingInvoice={savingInvoice}
            editingInvoice={editingInvoice}
            setEditingInvoice={setEditingInvoice}
            analyticsYear={analyticsYear}
            setAnalyticsYear={setAnalyticsYear}
            analyticsMonth={analyticsMonth}
            setAnalyticsMonth={setAnalyticsMonth}
            billingTypeFilter={billingTypeFilter}
            setBillingTypeFilter={setBillingTypeFilter}
            invoiceSearchQuery={invoiceSearchQuery}
            setInvoiceSearchQuery={setInvoiceSearchQuery}
            invoiceStatusFilter={invoiceStatusFilter}
            setInvoiceStatusFilter={setInvoiceStatusFilter}
            invoiceConfirmingDelete={invoiceConfirmingDelete}
            setInvoiceConfirmingDelete={setInvoiceConfirmingDelete}
            handleAddInvoice={handleAddInvoice}
            handleEditInvoice={handleEditInvoice}
            handleDeleteInvoice={handleDeleteInvoice}
            handleSaveInvoice={handleSaveInvoice}
            handleGeneratePDF={handleGeneratePDF}
            handleViewInvoiceDetails={handleViewInvoiceDetails}
          />
        ) : null}

        {showAdminUnsubscribeModal && editingClientProject && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="bg-[#0a1114] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
            
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  Are you sure you wanna unsubscribe it?
                </h3>
                <p className="text-white/50 text-xs leading-relaxed font-bold uppercase tracking-wider">
                  You are about to turn off recurring subscription billing for this project. If there is an active subscriber or subscription record, it will be deactivated.
                </p>
              </div>

              <div className="flex gap-4 w-full pt-4">
                <Button
                  type="button"
                  onClick={() => setShowAdminUnsubscribeModal(false)}
                  className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-heavy h-12 rounded-xl uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setEditingClientProject({
                      ...editingClientProject,
                      hasSubscription: false,
                      subscriptionPaid: false,
                    });
                    setShowAdminUnsubscribeModal(false);
                    showAdminToast("Subscription feature deactivated (Click Save Changes to apply)", "warning");
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-heavy h-12 rounded-xl border-none uppercase tracking-widest text-[10px]"
                >
                  Unsubscribe
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      </main>
    </div>
  );
}

function ReviewForm({ review, onSave, onCancel, saving, uploadToCloudinary, showAdminToast }: { 
  review: Review | null, 
  onSave: (data: Partial<Review>) => void, 
  onCancel: () => void,
  saving: boolean,
  uploadToCloudinary: (file: File, folderName?: string) => Promise<string>,
  showAdminToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}) {
  const [formData, setFormData] = useState<Partial<Review>>(
    review || {
      name: "",
      companyName: "",
      avatar: "",
      reviewTextEn: "",
      reviewTextPt: "",
      lang: "both",
      show: true,
      rating: 5,
      linkedInUsername: ""
    }
  );
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, "portfolio/reviews");
      setFormData(prev => ({ ...prev, avatar: url }));
    } catch (error) {
      showAdminToast("Avatar upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            {review ? "Edit" : "Add"} <span className="text-zarco-cyan text-glow">Review</span>
          </h2>
          <p className="text-white/40 text-sm italic uppercase tracking-widest">
            {review ? "Modify the existing client testimonial." : "Add a new client review to build trust and social proof."}
          </p>
        </div>
      </div>

      <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
               <div className="flex flex-col items-center justify-center p-8 bg-[#0c1417] rounded-3xl border border-white/5">
                <div className="relative group">
                  <label className="cursor-pointer block">
                    <div className="w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-zarco-cyan/50 ring-4 ring-white/5">
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Plus className="w-8 h-8 text-white/20" />
                      )}
                      
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-zarco-cyan animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-zarco-cyan rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Upload className="w-3 h-3 text-black" />
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-4">
                  Client Avatar
                </h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-[#0c1417] border border-white/5 rounded-2xl">
                  <div>
                    <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">Public Visibility</h4>
                    <p className={`text-xs font-black uppercase tracking-widest ${formData.show ? "text-green-500" : "text-red-500"}`}>
                      {formData.show ? "Currently Active" : "Currently Hidden"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setFormData({...formData, show: !formData.show})}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      formData.show 
                        ? "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white" 
                        : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    {formData.show ? "Disable" : "Enable"}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Avatar URL (Manual)</label>
                  <Input 
                    value={formData.avatar} 
                    onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">LinkedIn Username</label>
                  <div className="relative">
                    <Input 
                      value={formData.linkedInUsername || ""} 
                      onChange={(e) => setFormData({...formData, linkedInUsername: e.target.value})}
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14 pl-12"
                      placeholder="e.g. johnsmith"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                      <Linkedin className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[9px] text-white/20 mt-1 italic">Username only, e.g. 'pedrocristo' from linkedin.com/in/pedrocristo</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Order</label>
                  <Input 
                    type="number"
                    value={formData.order || 0} 
                    onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                    placeholder="0"
                  />
                  <p className="text-[9px] text-white/20 mt-1 italic">Lower numbers show first on the homepage.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Rating</label>
                  <div className="flex gap-2 p-2 bg-[#0c1417] rounded-xl border border-white/10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({...formData, rating: star})}
                        className="p-2 transition-all hover:scale-110"
                      >
                        <Star 
                          className={`w-6 h-6 ${formData.rating && formData.rating >= star ? 'text-zarco-cyan fill-zarco-cyan' : 'text-white/10'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Client Name</label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                    placeholder="e.g. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Company Name</label>
                  <Input 
                    value={formData.companyName} 
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                    placeholder="e.g. TechFlow Solutions"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Display Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {['en', 'pt', 'both'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setFormData({...formData, lang: l as any})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        formData.lang === l 
                          ? 'bg-zarco-cyan/20 border-zarco-cyan/50 text-zarco-cyan' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {l === 'both' ? 'Hybrid' : l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Review Text (English)</label>
                <textarea 
                  required
                  value={formData.reviewTextEn}
                  onChange={(e) => setFormData({...formData, reviewTextEn: e.target.value})}
                  className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 text-white text-sm focus:ring-1 focus:ring-zarco-cyan focus:outline-none min-h-[120px] resize-none"
                  placeholder="The international version of the testimonial..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Texto da Avaliação (Português)</label>
                <textarea 
                  value={formData.reviewTextPt}
                  onChange={(e) => setFormData({...formData, reviewTextPt: e.target.value})}
                  className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 text-white text-sm focus:ring-1 focus:ring-zarco-cyan focus:outline-none min-h-[120px] resize-none"
                  placeholder="A versão em português do testemunho..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-12 py-6 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-12 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (review ? "Update Review" : "Save Review")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
