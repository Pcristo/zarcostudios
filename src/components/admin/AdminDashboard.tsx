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

import { AdminTrashBin } from "./components/Settings/AdminTrashBin";
import { AdminSettings } from "./components/Settings/AdminSettings";
import { AdminReviews } from "./components/Reviews/AdminReviews";
import { AdminPricing } from "./components/Settings/AdminPricing";
import { AdminPortfolio } from "./components/Projects/AdminPortfolio";
import { AdminSubscriptions } from "./components/Billing/AdminSubscriptions";
import { AdminSubscribers } from "./components/Newsletter/AdminSubscribers";
import { AdminAttentionRequired } from "./components/Projects/AdminAttentionRequired";
import { AdminStatsGrid } from "./components/AdminStatsGrid";
import { AdminQuickNav } from "./components/AdminQuickNav";
import { ReviewForm } from "./components/Reviews/ReviewForm";

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
          const detailSuffix = data.errors && data.errors.length > 0 
            ? ` (Reason: ${data.errors[0].error?.message || "Unknown error"})` 
            : "";
          if (data.sentCount > 0 && data.failCount === 0) {
            feedbackMessage = isPt
              ? `Campanha enviada com sucesso para ${data.sentCount} destinatários.`
              : `Newsletter sent successfully to ${data.sentCount} recipients.`;
            toastType = "success";
          } else if (data.sentCount === 0 && data.failCount > 0) {
            feedbackMessage = isPt
              ? `Falha ao enviar campanha para os ${data.failCount} destinatários.${detailSuffix}`
              : `Failed to send newsletter email to all ${data.failCount} recipients.${detailSuffix}`;
            toastType = "error";
          } else if (data.failCount > 0) {
            feedbackMessage = isPt
              ? `Campanha parcialmente enviada. Sucesso: ${data.sentCount}, Falhas: ${data.failCount}.${detailSuffix}`
              : `Newsletter partially sent. Successfully sent to ${data.sentCount}, but ${data.failCount} failed.${detailSuffix}`;
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
        ) : view === "managed-projects-list" ? (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                  Project Management
                </h2>
                <p className="text-white/40 text-sm italic uppercase tracking-widest">
                  Global oversight of all active client projects and
                  deliverables.
                </p>
              </div>
              <Button
                onClick={handleAddNewManagedProject}
                className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Start New Project
              </Button>
            </div>

            {/* Admin Projects / Client Spaces Search Bar */}
            {clientProjects.length > 0 && !loadingClientProjects && (
              <div className="relative mb-8 max-w-md animate-fade-in">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={adminClientProjectSearch}
                  onChange={(e) => setAdminClientProjectSearch(e.target.value)}
                  placeholder="Search projects by name, status, client or year..."
                  className="w-full h-11 pl-12 pr-10 bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-zarco-cyan/50 focus:bg-white/[0.04] transition-all rounded-2xl text-[11px] font-bold uppercase tracking-wider text-white placeholder-white/20 outline-none"
                />
                {adminClientProjectSearch && (
                  <button
                    onClick={() => setAdminClientProjectSearch('')}
                    className="absolute inset-y-0 right-4 flex items-center text-white/30 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="grid gap-6">
              {loadingClientProjects ? (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                  <Loader2 className="w-12 h-12 text-zarco-cyan animate-spin mb-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 italic">
                    Syncing Project Data...
                  </h3>
                </div>
              ) : clientProjects.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                  <LayoutDashboard className="w-12 h-12 text-white/10 mb-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 mb-6">
                    No projects found in database
                  </h3>
                  <Button
                    onClick={() => setView("clients-list")}
                    className="bg-white/5 border border-white/10 text-white/60 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10"
                  >
                    Select Client to Start Project
                  </Button>
                </div>
              ) : filteredClientProjects.length === 0 ? (
                <div className="py-20 text-center border border-white/5 rounded-[2.5rem] bg-white/[0.01] flex flex-col items-center justify-center gap-4 animate-fade-in">
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">
                    No projects match your search criteria.
                  </p>
                  <button
                    onClick={() => setAdminClientProjectSearch('')}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredClientProjects.map((proj) => {
                  const client = clients.find((c) => c.id === proj.clientId);
                  const providers = Array.from(
                    new Set([
                      proj.domainProvider,
                      ...(proj.hosts?.map((h) => h.domainProvider) || []),
                    ]),
                  ).filter(Boolean);
                  return (
                    <Card
                      key={proj.id}
                      onClick={() => handleViewClientProject(proj)}
                      className="bg-[#0a1114] border-white/5 rounded-[2rem] p-8 group hover:border-zarco-cyan/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-10 flex-1">
                          <div className="flex flex-col min-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                  proj.status === "Completed"
                                    ? "bg-green-500/20 text-green-500"
                                    : proj.status === "Development"
                                      ? "bg-zarco-cyan/20 text-zarco-cyan"
                                      : "bg-white/10 text-white/40"
                                }`}
                              >
                                {proj.status}
                              </span>
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                {proj.projectType}
                              </span>
                              {proj.hasSubscription && (
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${
                                  proj.subscriptionPaid 
                                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                }`}>
                                  {proj.subscriptionPaid ? "⚡ Sub Active" : "⚡ Sub Enabled"}
                                </span>
                              )}
                              {((proj.domainName || proj.providerUrl ? 1 : 0) + (proj.hosts?.length || 0)) > 0 && (
                                <span className="px-2 py-0.5 bg-zarco-cyan/10 border border-zarco-cyan/20 rounded text-[8px] font-black text-zarco-cyan uppercase tracking-tighter">
                                  {(proj.domainName || proj.providerUrl ? 1 : 0) + (proj.hosts?.length || 0)} {(proj.domainName || proj.providerUrl ? 1 : 0) + (proj.hosts?.length || 0) === 1 ? 'Asset' : 'Assets'}
                                </span>
                              )}
                              {getProjectExpiringAssetsCount(proj) > 0 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-black text-red-500 uppercase tracking-tighter animate-pulse">
                                  <span className="relative flex h-1 w-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1 w-1 bg-red-500"></span>
                                  </span>
                                  {getProjectExpiringAssetsCount(proj)} Expiring Asset alerts
                                </span>
                              )}
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                              {proj.projectName}
                              {getProjectExpiringAssetsCount(proj) > 0 && (
                                <span className="flex h-2.5 w-2.5 relative flex-shrink-0 animate-pulse" title="Asset domain is expiring or expired (less than 1 month remaining!)">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                              )}
                            </h3>
                            <div className="flex flex-col mt-1">
                              {client?.fullName && (
                                <span className="text-sm font-black text-zarco-cyan uppercase tracking-widest">
                                  {client.fullName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="h-16 w-px bg-white/5" />
                          <div className="flex flex-col min-w-[150px]">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                              Timeline
                            </span>
                            <span className="text-xs font-medium text-white/40">
                              Deadline: {proj.deadline || "Not Set"}
                            </span>
                          </div>
                          <div className="flex-1 max-w-sm">
                            <div className="flex items-center gap-3 mb-2 text-white/20">
                              <span className="text-[10px] font-bold uppercase tracking-widest block">
                                Tech Stack
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(proj.techStack || []).slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="px-2.5 py-0.5 bg-white/5 border border-white/5 rounded text-[9px] font-black text-white/40 uppercase tracking-tight"
                                >
                                  {t}
                                </span>
                              ))}
                              {(proj.techStack || []).length > 3 && (
                                <span className="px-2.5 py-0.5 bg-white/5 border border-white/5 rounded text-[9px] font-black text-white/20 uppercase tracking-tight">
                                  +{proj.techStack.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="h-16 w-px bg-white/5" />

                          <div className="flex flex-col min-w-[220px]">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Archive className="w-3 h-3" />
                              Managed Assets
                            </span>
                            <div className="flex flex-col gap-3">
                              {(proj.domainName || proj.providerUrl) && (
                                <div className="flex flex-col gap-1 group/asset">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-white/80 uppercase tracking-tighter truncate max-w-[150px]">
                                      {proj.domainProvider || "Unknown Host"}
                                    </span>
                                    {proj.isHostingFree ? (
                                      <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded-[2px] text-[6px] font-black uppercase tracking-widest border border-green-500/20">
                                        Free
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded-[2px] text-[6px] font-black uppercase tracking-widest border border-red-500/20">
                                        Pay
                                      </span>
                                    )}
                                    {proj.isPaymentManagedByCustomer && (
                                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded-[2px] text-[6px] font-black uppercase tracking-widest border border-amber-500/20">
                                        Cust. Pay
                                      </span>
                                    )}
                                  </div>
                                  {proj.domainExpiration && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <Calendar className={`w-3 h-3 ${
                                        isAssetExpiringSoon(proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration)
                                          ? "text-red-500/50 animate-pulse" 
                                          : "text-yellow-400/50"
                                      }`} />
                                      <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                        isAssetExpiringSoon(proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration)
                                          ? "text-red-500 font-extrabold" 
                                          : "text-yellow-400"
                                      }`}>
                                        Renewal: {(() => {
                                          const parsed = parseFlexibleDate(proj.domainExpiration);
                                          return parsed ? parsed.toLocaleDateString() : proj.domainExpiration;
                                        })()}
                                        {isAssetExpiringSoon(proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration) && (
                                          <span className="flex h-1.5 w-1.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {(proj.hosts || []).map((h, i) => (
                                <div key={i} className={`flex flex-col gap-1 group/asset ${i === 0 && !(proj.domainName || proj.providerUrl) ? '' : 'border-t border-white/5 pt-2'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-white/60 uppercase tracking-tighter truncate max-w-[150px]">
                                      {h.domainProvider || "Unknown Host"}
                                    </span>
                                    {h.isHostingFree ? (
                                      <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded-[2px] text-[6px] font-black uppercase tracking-widest border border-green-500/20">
                                        Free
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded-[2px] text-[6px] font-black uppercase tracking-widest border border-red-500/20">
                                        Pay
                                      </span>
                                    )}
                                    {h.isPaymentManagedByCustomer && (
                                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded-[2px] text-[6px] font-black uppercase tracking-widest border border-amber-500/20">
                                        Cust. Pay
                                      </span>
                                    )}
                                  </div>
                                  {h.domainExpiration && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <Calendar className={`w-3 h-3 ${
                                        isAssetExpiringSoon(h.domainExpiration, h.isHostingFree, h.showDomainExpiration)
                                          ? "text-red-500/50 animate-pulse" 
                                          : "text-yellow-400/50"
                                      }`} />
                                      <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                        isAssetExpiringSoon(h.domainExpiration, h.isHostingFree, h.showDomainExpiration)
                                          ? "text-red-500 font-extrabold" 
                                          : "text-yellow-400"
                                      }`}>
                                        Renewal: {(() => {
                                          const parsed = parseFlexibleDate(h.domainExpiration);
                                          return parsed ? parsed.toLocaleDateString() : h.domainExpiration;
                                        })()}
                                        {isAssetExpiringSoon(h.domainExpiration, h.isHostingFree, h.showDomainExpiration) && (
                                          <span className="flex h-1.5 w-1.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {!proj.domainName && !proj.providerUrl &&
                                (!proj.hosts || proj.hosts.length === 0) && (
                                  <span className="text-[10px] font-black text-white/10 uppercase tracking-tighter italic">
                                    No Assets Recorded
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-center w-full">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (client) setEditingClient(client);
                              setEditingClientProject(proj);
                              setView("client-project-form");
                            }}
                            className="w-full py-4 text-[11px] font-black uppercase tracking-widest text-zarco-cyan hover:text-white hover:bg-zarco-cyan/10 border border-white/5 rounded-xl flex items-center justify-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Edit Details
                          </Button>
                          
                          {clientProjectConfirmingDelete === proj.id ? (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
                              <Button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteClientProject(proj.id);
                                }}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest h-11 rounded-xl transition-all active:scale-95"
                              >
                                Confirm
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setClientProjectConfirmingDelete(null);
                                }}
                                className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 h-11 border border-white/5 rounded-xl transition-all"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClientProjectConfirmingDelete(proj.id);
                              }}
                              className="text-white/10 hover:text-red-500 hover:bg-red-500/5 px-4 h-8 text-[9px] uppercase tracking-widest font-bold flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ) : view === "clients-list" ? (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                  Client Relations
                </h2>
                <p className="text-white/40 text-sm italic uppercase tracking-widest">
                  Manage your elite clientele and business identity database.
                </p>
              </div>
              <Button
                onClick={handleAddClient}
                className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none"
              >
                Add New Client
              </Button>
            </div>

            <div className="grid gap-6">
              {loadingClients ? (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                  <Loader2 className="w-12 h-12 text-zarco-cyan animate-spin mb-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 italic">
                    Retrieving Client Database...
                  </h3>
                </div>
              ) : clients.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                  <Users className="w-12 h-12 text-white/10 mb-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 mb-6">
                    No clients registered
                  </h3>
                  <Button
                    onClick={handleAddClient}
                    className="bg-white/5 border border-white/10 text-white/60 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10"
                  >
                    Onboard First Client
                  </Button>
                </div>
              ) : (
                clients.map((client) => (
                  <Card
                    key={client.id}
                    onClick={() => handleViewClient(client)}
                    className="bg-[#0a1114] border-white/5 rounded-[2rem] p-8 group hover:border-zarco-cyan/20 transition-all cursor-pointer relative overflow-hidden"
                  >
                    {(() => {
                      const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
                      if (clientInvoices.length > 0) {
                        const isOverdue = clientInvoices.some(inv => normalizeStatus(inv.status) === 'UNPAID');
                        const isPending = clientInvoices.some(inv => {
                          const s = normalizeStatus(inv.status);
                          return s !== 'PAID' && s !== 'VOID' && s !== 'DRAFT';
                        });
                        const isAllPaid = clientInvoices.every(inv => {
                          const s = normalizeStatus(inv.status);
                          return s === 'PAID' || s === 'VOID';
                        });
                        
                        if (isOverdue) return (
                          <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-500 text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                            Overdue Payment
                          </div>
                        );
                        if (isPending) return (
                          <div className="absolute top-0 right-0 px-4 py-1.5 bg-zarco-cyan text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                            Financial Pending
                          </div>
                        );
                        if (isAllPaid) return (
                          <div className="absolute top-0 right-0 px-4 py-1.5 bg-green-500 text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                            All Paid
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-10 flex-1">
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest mb-1">
                            {client.industry || "General"}
                          </span>
                          <h3 className="text-2xl font-black uppercase tracking-tight mb-1">
                            {client.fullName}
                          </h3>
                          <p className="text-sm font-bold text-white/30 uppercase tracking-tighter">
                            {client.companyName}
                          </p>
                          <div
                            className="flex gap-3 mt-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {client.websiteUrl && (
                              <a
                                href={
                                  client.websiteUrl.startsWith("http")
                                    ? client.websiteUrl
                                    : `https://${client.websiteUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all"
                              >
                                <LinkIcon className="w-4 h-4" />
                              </a>
                            )}
                            {client.instagramUrl && (
                              <a
                                href={
                                  client.instagramUrl.startsWith("http")
                                    ? client.instagramUrl
                                    : `https://instagram.com/${client.instagramUrl.replace("@", "")}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all"
                              >
                                <Instagram className="w-4 h-4" />
                              </a>
                            )}
                            {client.facebookUrl && (
                              <a
                                href={
                                  client.facebookUrl.startsWith("http")
                                    ? client.facebookUrl
                                    : `https://facebook.com/${client.facebookUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all"
                              >
                                <Facebook className="w-4 h-4" />
                              </a>
                            )}
                            {client.linkedinUrl && (
                              <a
                                href={
                                  client.linkedinUrl.startsWith("http")
                                    ? client.linkedinUrl
                                    : `https://linkedin.com/in/${client.linkedinUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                          <div className="h-16 w-px bg-white/5" />
                        <div className="flex flex-col min-w-[150px]">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                            Financial Yield
                          </span>
                          {(() => {
                            const paidInvoices = invoices.filter(inv => inv.clientId === client.id && normalizeStatus(inv.status) === 'PAID');
                            const totalSpent = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                            const totalTax = paidInvoices.reduce((sum, inv) => sum + (inv.vatAmount || 0), 0);
                            const netTotal = totalSpent - totalTax;
                            
                            return (
                              <div className="space-y-1">
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-zarco-cyan leading-none">
                                    € {totalSpent.toLocaleString()}
                                  </span>
                                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Gross</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-white/60 leading-none">
                                    € {netTotal.toLocaleString()}
                                  </span>
                                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Tax Off</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-purple-400/60 leading-none">
                                    € {totalTax.toLocaleString()}
                                  </span>
                                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Tax</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="h-16 w-px bg-white/5" />
                        <div className="flex flex-col min-w-[150px]">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                            Contact Details
                          </span>
                          <span className="text-xs font-medium text-white/60 mb-1">
                            {client.email}
                          </span>
                          <span className="text-xs font-medium text-white/40 mb-1">
                            {client.phone}
                          </span>
                          {client.whatsapp && (
                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                              WhatsApp Active
                            </span>
                          )}
                        </div>
                        <div className="h-16 w-px bg-white/5" />
                        <div className="flex-1 max-w-[300px]">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                            Business Description
                          </span>
                          <p className="text-[11px] text-white/40 line-clamp-3 leading-relaxed mb-3">
                            {client.description || "No description provided."}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-0.5 bg-white/5 rounded text-[9px] font-black text-white/30 uppercase tracking-widest border border-white/5">
                              {client.businessType}
                            </span>
                            {client.city && (
                              <span className="px-2.5 py-0.5 bg-white/5 rounded text-[9px] font-black text-white/30 uppercase tracking-widest border border-white/5">
                                {client.city}
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                      <div
                        className="flex flex-col gap-3 items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="ghost"
                            onClick={() => handleEditClient(client)}
                            className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest text-zarco-cyan hover:text-white hover:bg-zarco-cyan/10 border border-white/5 rounded-xl flex items-center justify-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Manage Profile
                          </Button>
                          
                          {clientConfirmingDelete === client.id ? (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                              <Button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteClient(client.id);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 h-11 rounded-xl transition-all active:scale-95"
                              >
                                Confirm
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setClientConfirmingDelete(null);
                                }}
                                className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest px-3 h-11 border border-white/5 rounded-xl transition-all"
                              >
                                X
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClientConfirmingDelete(client.id);
                              }}
                              className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-white/5 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : view === "clients-view" && editingClient ? (
          <div className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                  Client Profile
                </h2>
                <p className="text-white/40 text-sm italic uppercase tracking-widest">
                  A comprehensive view of the high-end business identity.
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => setView("clients-list")}
                  variant="outline"
                  className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
                >
                  Back to List
                </Button>
                <Button
                  onClick={() => handleAddClientProject(editingClient)}
                  className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Start New Project
                </Button>
                <Button
                  onClick={() => setView("clients-form")}
                  className="bg-white/5 text-white/60 font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/10 border border-white/5 transition-all"
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 lg:col-span-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-3xl bg-zarco-cyan/10 flex items-center justify-center text-4xl mb-6 border border-zarco-cyan/20">
                    👤
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                    {editingClient.fullName}
                  </h3>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                    {editingClient.companyName}
                  </p>

                  <div className="w-full space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between text-left">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        Industry
                      </span>
                      <span className="text-xs font-bold text-zarco-cyan uppercase">
                        {editingClient.industry || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between text-left">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        Type
                      </span>
                      <span className="text-xs font-bold text-white/60 uppercase">
                        {editingClient.businessType || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    {editingClient.websiteUrl && (
                      <a
                        href={
                          editingClient.websiteUrl.startsWith("http")
                            ? editingClient.websiteUrl
                            : `https://${editingClient.websiteUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all border border-white/5"
                      >
                        <LinkIcon className="w-5 h-5" />
                      </a>
                    )}
                    {editingClient.instagramUrl && (
                      <a
                        href={
                          editingClient.instagramUrl.startsWith("http")
                            ? editingClient.instagramUrl
                            : `https://instagram.com/${editingClient.instagramUrl.replace("@", "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all border border-white/5"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {editingClient.facebookUrl && (
                      <a
                        href={
                          editingClient.facebookUrl.startsWith("http")
                            ? editingClient.facebookUrl
                            : `https://facebook.com/${editingClient.facebookUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all border border-white/5"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {editingClient.linkedinUrl && (
                      <a
                        href={
                          editingClient.linkedinUrl.startsWith("http")
                            ? editingClient.linkedinUrl
                            : `https://linkedin.com/in/${editingClient.linkedinUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all border border-white/5"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>

              {/* Details Column */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">🏢</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Business Intelligence
                    </h3>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                        Business Description
                      </label>
                      <p className="text-sm text-white/60 leading-relaxed font-medium">
                        {editingClient.description ||
                          "No description provided for this business profile."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                      <div>
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                          Location
                        </label>
                        <p className="text-sm font-bold text-white/80">
                          {editingClient.city}
                          {editingClient.country
                            ? `, ${editingClient.country}`
                            : ""}
                        </p>
                        {editingClient.streetAddress && (
                          <p className="text-xs text-white/40 mt-1">
                            {editingClient.streetAddress}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                          Digital Presence
                        </label>
                        <p className="text-sm font-bold text-white/80 break-all">
                          {editingClient.websiteUrl || "No website established"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">📞</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Communication Channels
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                          Primary Email
                        </label>
                        <p className="text-sm font-black text-zarco-cyan uppercase">
                          {editingClient.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                          Phone Line
                        </label>
                        <p className="text-sm font-bold text-white/80">
                          {editingClient.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                          Direct WhatsApp
                        </label>
                        <p className="text-sm font-bold text-white/80">
                          {editingClient.whatsapp || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                          Other Contacts
                        </label>
                        <p className="text-xs text-white/40 leading-relaxed italic">
                          {editingClient.otherContact ||
                            "No alternative contact methods listed."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Client Projects List */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                    Client Portfolio
                  </h3>
                  <div className="h-px flex-1 bg-white/5 mx-8" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clientProjects.filter((p) => p.clientId === editingClient.id)
                    .length === 0 ? (
                    <div className="col-span-full py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20">
                      <span className="text-4xl mb-4">📂</span>
                      <p className="text-xs font-black uppercase tracking-widest">
                        No projects managed yet
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => handleAddClientProject(editingClient)}
                        className="mt-4 text-zarco-cyan hover:bg-zarco-cyan/10"
                      >
                        Add First Project
                      </Button>
                    </div>
                  ) : (
                    clientProjects
                      .filter((p) => p.clientId === editingClient.id)
                      .map((proj) => (
                        <Card
                          key={proj.id}
                          onClick={() => handleViewClientProject(proj)}
                          className="bg-[#080d0f] border-white/5 rounded-[2rem] p-8 hover:border-zarco-cyan/20 transition-all group relative overflow-hidden cursor-pointer"
                        >
                          <div
                            className={`absolute top-0 right-0 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-bl-xl ${
                              proj.status === "Completed"
                                ? "bg-green-500 text-black"
                                : proj.status === "Development"
                                  ? "bg-zarco-cyan text-black"
                                  : "bg-white/10 text-white/60"
                            }`}
                          >
                            {proj.status}
                          </div>

                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest">
                              {proj.projectType || "Standard"}
                            </span>
                            {proj.hasSubscription && (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${
                                proj.subscriptionPaid 
                                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                              }`}>
                                {proj.subscriptionPaid ? "⚡ Sub Active" : "⚡ Sub Enabled"}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xl font-bold uppercase tracking-tight mb-6 leading-tight flex items-center justify-between gap-2">
                            <span>{proj.projectName}</span>
                            {getProjectExpiringAssetsCount(proj) > 0 && (
                              <span className="flex h-2.5 w-2.5 relative flex-shrink-0" title="Asset domain is expiring or expired (less than 1 month remaining!)">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-white/40 line-clamp-2 mb-6">
                            {proj.shortDescription ||
                              "No description provided."}
                          </p>

                          <div className="flex items-center justify-between gap-3 mb-6">
                            <div className="flex-1">
                              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                                Tech Stack
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {(proj.techStack || []).slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="px-2.5 py-0.5 bg-white/5 rounded text-[9px] font-bold text-white/30 uppercase tracking-tighter border border-white/5"
                                  >
                                    {t}
                                  </span>
                                ))}
                                {(proj.techStack || []).length > 3 && (
                                  <span className="px-2.5 py-0.5 bg-white/5 rounded text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                                    +{proj.techStack.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mb-6 pt-6 border-t border-white/5">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Archive className="w-3 h-3" />
                              Managed Assets
                            </span>
                            <div className="flex flex-col gap-3">
                              {(proj.domainName || proj.providerUrl) && (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-white/80 uppercase tracking-tighter">
                                      {proj.domainProvider || "Unknown Host"}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded-[2px] text-[6px] font-black uppercase tracking-widest border ${
                                      proj.isHostingFree 
                                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                    }`}>
                                      {proj.isHostingFree ? "Free" : "Pay"}
                                    </span>
                                    {proj.isPaymentManagedByCustomer && (
                                      <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-500 rounded-[2px] text-[6px] font-black uppercase tracking-widest border border-amber-500/30">
                                        Cust. Pay
                                      </span>
                                    )}
                                  </div>
                                  {proj.domainExpiration && (
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className={`w-3 h-3 ${
                                        isAssetExpiringSoon(proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration)
                                          ? "text-red-500/50" 
                                          : "text-yellow-400/50"
                                      }`} />
                                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                                        isAssetExpiringSoon(proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration)
                                          ? "text-red-500" 
                                          : "text-yellow-400"
                                      }`}>
                                        Renewal: {(() => {
                                          const parsed = parseFlexibleDate(proj.domainExpiration);
                                          return parsed ? parsed.toLocaleDateString() : proj.domainExpiration;
                                        })()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {(proj.hosts || []).map((h, i) => (
                                <div key={i} className="flex flex-col gap-1 border-t border-white/5 pt-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-white/60 uppercase tracking-tighter">
                                      {h.domainProvider || "Unknown Host"}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded-[2px] text-[6px] font-black uppercase tracking-widest border ${
                                      h.isHostingFree 
                                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                    }`}>
                                      {h.isHostingFree ? "Free" : "Pay"}
                                    </span>
                                    {h.isPaymentManagedByCustomer && (
                                      <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-500 rounded-[2px] text-[6px] font-black uppercase tracking-widest border border-amber-500/30">
                                        Cust. Pay
                                      </span>
                                    )}
                                  </div>
                                  {h.domainExpiration && (
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className={`w-3 h-3 ${
                                        isAssetExpiringSoon(h.domainExpiration, h.isHostingFree, h.showDomainExpiration)
                                          ? "text-red-500/50" 
                                          : "text-yellow-400/50"
                                      }`} />
                                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                                        isAssetExpiringSoon(h.domainExpiration, h.isHostingFree, h.showDomainExpiration)
                                          ? "text-red-500" 
                                          : "text-yellow-400"
                                      }`}>
                                        Renewal: {(() => {
                                          const parsed = parseFlexibleDate(h.domainExpiration);
                                          return parsed ? parsed.toLocaleDateString() : h.domainExpiration;
                                        })()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {!proj.domainName && !proj.providerUrl &&
                                (!proj.hosts || proj.hosts.length === 0) && (
                                  <span className="text-[10px] font-black text-white/10 uppercase tracking-tighter italic">
                                    No Assets Recorded
                                  </span>
                                )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 items-center justify-end pt-6 border-t border-white/5">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setEditingClientProject(proj);
                                setView("client-project-form");
                              }}
                              className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-zarco-cyan hover:text-white hover:bg-zarco-cyan/10"
                            >
                              Edit Details
                            </Button>
                            
                            {clientProjectConfirmingDelete === proj.id ? (
                              <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteClientProject(proj.id);
                                  }}
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-3 h-8 rounded-lg transition-all active:scale-95"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setClientProjectConfirmingDelete(null);
                                  }}
                                  className="text-white/40 hover:text-white text-[8px] font-black uppercase tracking-widest px-2 h-8 rounded-lg transition-all"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setClientProjectConfirmingDelete(proj.id);
                                }}
                                className="text-white/10 hover:text-red-500 hover:bg-red-500/5 px-4 h-7 text-[8px] uppercase tracking-widest font-bold"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete Project
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : view === "client-project-view" &&
          editingClientProject &&
          editingClient ? (
          <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-start mb-12">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-zarco-cyan/5 border border-zarco-cyan/10 flex items-center justify-center text-3xl">
                  📁
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        editingClientProject.status === "Completed"
                          ? "bg-green-500/20 text-green-500"
                          : editingClientProject.status === "Development"
                            ? "bg-zarco-cyan/20 text-zarco-cyan"
                            : "bg-white/10 text-white/40"
                      }`}
                    >
                      {editingClientProject.status}
                    </span>
                    <span className="text-white/20 text-xs font-bold uppercase tracking-widest">
                      {editingClientProject.projectType}
                    </span>
                    {getProjectUnreadExpiringAssetsCount(editingClientProject) > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-black text-red-500 uppercase tracking-tighter animate-pulse">
                        <span className="relative flex h-1 w-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1 w-1 bg-red-500"></span>
                        </span>
                        {getProjectUnreadExpiringAssetsCount(editingClientProject)} Expiring Assets
                      </span>
                    )}
                  </div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4 flex items-center gap-3">
                    {editingClientProject.projectName}
                    {getProjectUnreadExpiringAssetsCount(editingClientProject) > 0 && (
                      <span className="flex h-3 w-3 relative flex-shrink-0 animate-pulse" title="Asset domain is expiring or expired (less than 1 month remaining!)">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Client:</span>
                    <span className="text-sm font-black text-zarco-cyan uppercase tracking-widest">
                      {editingClient.fullName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => setView("managed-projects-list")}
                  variant="outline"
                  className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setView("client-project-form")}
                  className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
                >
                  Manage Project
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info Column */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex flex-col gap-1 mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5 text-zarco-cyan" />
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        Project Overview
                      </h3>
                    </div>
                    {editingClientProject.liveUrl && (
                      <a
                        href={editingClientProject.liveUrl.startsWith("http") ? editingClientProject.liveUrl : `https://${editingClientProject.liveUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-zarco-cyan/60 hover:text-zarco-cyan font-bold uppercase tracking-widest ml-8 flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Live Implementation
                      </a>
                    )}
                  </div>

                  <div className="space-y-10">
                    <div>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-4">
                        Executive Summary
                      </span>
                      <p className="text-2xl font-medium text-white/80 leading-snug">
                        {editingClientProject.shortDescription ||
                          "Elevating digital presence through bespoke architectural design and precision engineering."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
                      <div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                          Budget Allocation
                        </span>
                        <span className="text-2xl font-black text-zarco-cyan">
                          €{Number(editingClientProject.price).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                          Financial Status
                        </span>
                        <span
                          className={`text-sm font-black uppercase tracking-widest ${editingClientProject.paidStatus === "Paid" ? "text-green-500" : "text-orange-500"}`}
                        >
                          {editingClientProject.paidStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                          Maintenance
                        </span>
                        <span
                          className={`text-sm font-black uppercase tracking-widest ${editingClientProject.maintenancePlan ? "text-green-500 animate-pulse" : "text-white/40"}`}
                        >
                          {editingClientProject.maintenancePlan ? "Active SLA" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                          Expected Duration
                        </span>
                        <span className="text-sm font-black text-white/80 uppercase tracking-widest">
                          {editingClientProject.expectedDuration || "Not Set"}
                          {editingClientProject.onlyShowExpected && (
                            <span className="block text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                              (Force-show default)
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                          Architecture
                        </span>
                        <span className="text-sm font-black text-white/80 uppercase tracking-widest">
                          {editingClientProject.hostingType || "Not Specified"}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-3 lg:col-span-5">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-2">
                          Tech Stack
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(editingClientProject.techStack || []).map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-1 bg-white/5 rounded-lg text-[10px] font-extrabold text-white/60 uppercase tracking-tight border border-white/5"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border border-white/5 rounded-2xl bg-[#030708] overflow-hidden transition-all duration-300">
                      <button
                        onClick={() => setIsDetailedScopeOpen(!isDetailedScopeOpen)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors focus:outline-none focus:ring-1 focus:ring-zarco-cyan/30 cursor-pointer"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
                            Detailed Architecture & Scope
                          </span>
                          <span className="text-[9px] text-[#4fd1dc]/50 uppercase font-semibold tracking-widest">
                            {isDetailedScopeOpen ? "Click to collapse specifications" : "Click to view specifications"}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#4fd1dc] transition-transform duration-300 ${
                            isDetailedScopeOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isDetailedScopeOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 pt-0 text-white/60 text-sm leading-relaxed whitespace-pre-line bg-[#040809] select-text">
                              <div className="border-t border-white/5 pt-4">
                                {editingClientProject.fullDescription ||
                                  "No detailed description provided for this architectural build."}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                    <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                      <span className="text-xl">📅</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        Critical Milestones
                      </h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-xs text-white/30 font-medium uppercase tracking-widest">
                          Build Start
                        </span>
                        <span className="text-xs text-white font-bold">
                          {editingClientProject.startDate || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-xs text-white/30 font-medium uppercase tracking-widest">
                          Estimated Deadline
                        </span>
                        <span className="text-xs text-white font-bold">
                          {editingClientProject.deadline || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-xs text-white/30 font-medium uppercase tracking-widest">
                          Final Delivery
                        </span>
                        <span className="text-xs text-zarco-cyan font-black">
                          {editingClientProject.deliveryDate || "IN PROGRESS"}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                    <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                      <span className="text-xl">🌐</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        Digital Infrastructure
                      </h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                          Live Platform
                        </span>
                        {editingClientProject.liveUrl ? (
                          <a
                            href={editingClientProject.liveUrl.startsWith("http") ? editingClientProject.liveUrl : `https://${editingClientProject.liveUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zarco-cyan font-bold hover:underline truncate"
                          >
                            {editingClientProject.liveUrl}
                          </a>
                        ) : (
                          <span className="text-xs text-white/20 italic">
                            Not Deployed
                          </span>
                        )}
                      </div>

                      {(editingClientProject.otherUrls || []).map((link, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            {link.label || "Additional Link"}
                          </span>
                          <a
                            href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zarco-cyan font-bold hover:underline truncate"
                          >
                            {link.url}
                          </a>
                        </div>
                      ))}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            Repository (Git)
                          </span>
                          {editingClientProject.githubUrl ? (
                            <a
                              href={editingClientProject.githubUrl.startsWith("http") ? editingClientProject.githubUrl : `https://${editingClientProject.githubUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-white/70 font-medium hover:text-zarco-cyan transition-colors truncate"
                            >
                              View Source
                            </a>
                          ) : (
                            <span className="text-xs text-white/20 italic">No Repo</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            Design Platform
                          </span>
                          {editingClientProject.figmaUrl ? (
                            <a
                              href={editingClientProject.figmaUrl.startsWith("http") ? editingClientProject.figmaUrl : `https://${editingClientProject.figmaUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-white/70 font-medium hover:text-zarco-cyan transition-colors truncate"
                            >
                              View Figma
                            </a>
                          ) : (
                            <span className="text-xs text-white/20 italic">No Design</span>
                          )}
                        </div>
                      </div>

                      {editingClientProject.serviceEmail && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            Project Service Email
                          </span>
                          <a
                            href={`mailto:${editingClientProject.serviceEmail}`}
                            className="text-xs text-zarco-cyan font-bold hover:underline"
                          >
                            {editingClientProject.serviceEmail}
                          </a>
                        </div>
                      )}

                      <div className="h-px bg-white/5 my-2" />
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            Provider Asset
                          </span>
                          <div className="flex items-center gap-2">
                            {editingClientProject.isClientProvided && (
                              <span className="px-2.5 py-0.5 bg-zarco-cyan/10 text-zarco-cyan rounded text-[9px] font-black uppercase tracking-widest border border-zarco-cyan/30">
                                Client Provided
                              </span>
                            )}
                            {editingClientProject.isPaymentManagedByCustomer && (
                              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[9px] font-black uppercase tracking-widest border border-amber-500/30">
                                Customer Payment
                              </span>
                            )}
                            {editingClientProject.isHostingFree ? (
                              <span className="px-2.5 py-0.5 bg-green-500/20 text-green-500 rounded text-[9px] font-black uppercase tracking-widest border border-green-500/30">
                                Free Tier
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-red-500/20 text-red-500 rounded text-[9px] font-black uppercase tracking-widest border border-red-500/30">
                                Paid Asset
                              </span>
                            )}
                          </div>
                        </div>
                        {editingClientProject.domainProvider && (
                          <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] mb-1">
                            {editingClientProject.domainProvider}
                          </span>
                        )}
                        {editingClientProject.providerUrl ? (
                          <a
                            href={
                              editingClientProject.providerUrl.startsWith("http")
                                ? editingClientProject.providerUrl
                                : `https://${editingClientProject.providerUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white/70 font-medium hover:text-zarco-cyan hover:underline transition-colors truncate"
                          >
                            {editingClientProject.providerUrl}
                          </a>
                        ) : (
                          <span className="text-xs text-white/70 font-medium">
                            —
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                          Custom Domain
                        </span>
                        {editingClientProject.domainName ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={
                                editingClientProject.domainName.startsWith("http")
                                  ? editingClientProject.domainName
                                  : `https://${editingClientProject.domainName}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-white font-bold hover:text-zarco-cyan hover:underline transition-colors truncate"
                            >
                              {editingClientProject.domainName}
                            </a>
                            {isAssetExpiringSoon(editingClientProject.domainExpiration, editingClientProject.isHostingFree, editingClientProject.showDomainExpiration) && (
                              <span className="flex h-1.5 w-1.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-white font-bold">
                            —
                          </span>
                        )}
                        {editingClientProject.domainExpiration && (
                          <span
                            className={`text-[11px] italic mt-1 inline-block ${getRenewalTheme(editingClientProject.domainExpiration)}`}
                          >
                            Renewal: {(() => {
                              const parsed = parseFlexibleDate(editingClientProject.domainExpiration);
                              return parsed ? parsed.toLocaleDateString() : editingClientProject.domainExpiration;
                            })()}
                          </span>
                        )}
                      </div>
                      <div className="h-px bg-white/5 my-2" />
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            Primary Architecture
                          </span>
                          <span className="text-xs text-white font-bold">
                            {editingClientProject.hostingType ||
                              "Not Specified"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-right">
                            Provider
                          </span>
                          <span className="text-xs text-white/60 font-medium text-right">
                            {editingClientProject.domainProvider || "—"}
                          </span>
                        </div>
                      </div>

                      {(editingClientProject.hosts || []).map((host, idx) => (
                        <div
                          key={idx}
                          className="mt-8 pt-8 border-t border-white/5 space-y-6"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zarco-cyan font-black uppercase tracking-widest">
                              Additional Asset #{idx + 1}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                Provider Asset
                              </span>
                              <div className="flex items-center gap-2">
                                {host.isClientProvided && (
                                  <span className="px-2 py-0.5 bg-zarco-cyan/10 text-zarco-cyan rounded text-[8px] font-black uppercase tracking-widest border border-zarco-cyan/30">
                                    Client Provided
                                  </span>
                                )}
                                {host.isPaymentManagedByCustomer && (
                                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[8px] font-black uppercase tracking-widest border border-amber-500/30">
                                    Customer Payment
                                  </span>
                                )}
                                {host.isHostingFree ? (
                                  <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-[8px] font-black uppercase tracking-widest border border-green-500/30">
                                    Free Tier
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-red-500/20 text-red-500 rounded text-[8px] font-black uppercase tracking-widest border border-red-500/30">
                                    Paid Asset
                                  </span>
                                )}
                              </div>
                            </div>
                            {host.domainProvider && (
                              <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] mb-1">
                                {host.domainProvider}
                              </span>
                            )}
                            {host.providerUrl ? (
                              <a
                                href={
                                  host.providerUrl.startsWith("http")
                                    ? host.providerUrl
                                    : `https://${host.providerUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-white/70 font-medium hover:text-zarco-cyan hover:underline transition-colors truncate"
                              >
                                {host.providerUrl}
                              </a>
                            ) : (
                              <span className="text-xs text-white/70 font-medium">
                                —
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                              Custom Domain
                            </span>
                            {host.domainName ? (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={
                                    host.domainName.startsWith("http")
                                      ? host.domainName
                                      : `https://${host.domainName}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-white font-bold hover:text-zarco-cyan hover:underline transition-colors truncate"
                                >
                                  {host.domainName}
                                </a>
                                {isAssetExpiringSoon(host.domainExpiration, host.isHostingFree, host.showDomainExpiration) && (
                                  <span className="flex h-1.5 w-1.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-white font-bold">
                                —
                              </span>
                            )}
                            {host.domainExpiration && (
                              <span
                                className={`text-[11px] italic mt-1 inline-block ${getRenewalTheme(host.domainExpiration)}`}
                              >
                                Renewal: {(() => {
                                  const parsed = parseFlexibleDate(host.domainExpiration);
                                  return parsed ? parsed.toLocaleDateString() : host.domainExpiration;
                                })()}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                Architecture
                              </span>
                              <span className="text-xs text-white font-bold">
                                {host.hostingType || "Not Specified"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-right">
                                Provider
                              </span>
                              <span className="text-xs text-white/60 font-medium text-right">
                                {host.domainProvider || "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-6">
                    Client Identity
                  </span>
                  <button
                    onClick={() => setView("clients-view")}
                    className="w-full text-left p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-zarco-cyan/30 transition-all group"
                  >
                    <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest mb-1 block group-hover:translate-x-1 transition-transform">
                      View Profile
                    </span>
                    <h4 className="text-xl font-bold text-white uppercase tracking-tight leading-tight mb-1">
                      {editingClient.companyName}
                    </h4>
                    <span className="text-xs text-white/40 font-medium">
                      {editingClient.fullName}
                    </span>
                  </button>
                  <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-sm">📧</span>
                      <span className="text-[11px] text-white/60 font-medium truncate">
                        {editingClient.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-sm">📞</span>
                      <span className="text-[11px] text-white/60 font-medium">
                        {editingClient.phone || "No Phone"}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 border-l-4 border-l-zarco-cyan">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xl">📝</span>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">
                      Internal Insights & Logs
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-2">
                        Dev Intelligence
                      </span>
                      <p className="text-[11px] text-white/50 leading-relaxed italic bg-white/[0.01] p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                        {editingClientProject.internalNotes ||
                          "No internal developer logs for this sprint."}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-2">
                        Client Feedback Summary
                      </span>
                      <p className="text-[11px] text-white/50 leading-relaxed italic bg-white/[0.01] p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                        {editingClientProject.clientFeedback ||
                          "No client feedback synthesis has been recorded."}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-2">
                        Active Issues
                      </span>
                      {editingClientProject.issues ? (
                        <p className="text-[11px] text-red-400/70 font-medium leading-relaxed bg-red-400/5 p-3 rounded-lg border border-red-400/10">
                          {editingClientProject.issues}
                        </p>
                      ) : (
                        <span className="text-[11px] text-green-500/50 italic block bg-green-500/5 p-3 border border-green-500/10 rounded-lg">
                          Zero known vulnerabilities.
                        </span>
                      )}
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowFeedbackModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-zarco-cyan/10 hover:bg-zarco-cyan/20 border border-zarco-cyan/20 text-zarco-cyan text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Client Workspace Logs ({(editingClientProject.feedbacksList || []).length})</span>
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Secure Client Sharing Card */}
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 border-t-4 border-t-zarco-cyan relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xl">🚀</span>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">
                      Customer Space Sharing
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl">
                      <input
                        type="checkbox"
                        id="view-isShared"
                        checked={editingClientProject.isShared || false}
                        onChange={async (e) => {
                          const updatedVal = e.target.checked;
                          const updatedProj = { ...editingClientProject, isShared: updatedVal };
                          setEditingClientProject(updatedProj);
                          await updateDoc(doc(db, "clientProjects", editingClientProject.id), { isShared: updatedVal });
                        }}
                        className="w-4 h-4 rounded text-zarco-cyan bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-cyan cursor-pointer"
                      />
                      <label htmlFor="view-isShared" className="text-[10px] font-black uppercase tracking-widest text-white/70 select-none cursor-pointer">
                        Enable Customer Space
                      </label>
                    </div>

                    <div className="flex items-center gap-3 py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl">
                      <input
                        type="checkbox"
                        id="view-showFullDescription"
                        checked={editingClientProject.showFullDescription || false}
                        onChange={async (e) => {
                          const updatedVal = e.target.checked;
                          const updatedProj = { ...editingClientProject, showFullDescription: updatedVal };
                          setEditingClientProject(updatedProj);
                          await updateDoc(doc(db, "clientProjects", editingClientProject.id), { showFullDescription: updatedVal });
                        }}
                        className="w-4 h-4 rounded text-zarco-cyan bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-cyan cursor-pointer"
                      />
                      <label htmlFor="view-showFullDescription" className="text-[10px] font-black uppercase tracking-widest text-white/70 select-none cursor-pointer">
                        Display Full Description button
                      </label>
                    </div>

                    <div className="flex items-center gap-3 py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl">
                      <input
                        type="checkbox"
                        id="view-showReviewsBox"
                        checked={editingClientProject.showReviewsBox !== false}
                        onChange={async (e) => {
                          const updatedVal = e.target.checked;
                          const updatedProj = { ...editingClientProject, showReviewsBox: updatedVal };
                          setEditingClientProject(updatedProj);
                          await updateDoc(doc(db, "clientProjects", editingClientProject.id), { showReviewsBox: updatedVal });
                        }}
                        className="w-4 h-4 rounded text-zarco-cyan bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-cyan cursor-pointer"
                      />
                      <label htmlFor="view-showReviewsBox" className="text-[10px] font-black uppercase tracking-widest text-white/70 select-none cursor-pointer">
                        Display Customer Reviews Box
                      </label>
                    </div>

                    {/* Share Language Selector */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[9px] font-extrabold text-white/30 uppercase tracking-widest block">
                        Space Display Language
                      </label>
                      <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShareLanguage("en");
                            setEditingClientProject({
                              ...editingClientProject,
                              shareLanguage: "en"
                            });
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            (editingClientProject.shareLanguage || shareLanguage) === "en"
                              ? "bg-zarco-cyan/20 text-zarco-cyan border border-zarco-cyan/30"
                              : "text-white/40 border border-transparent hover:text-white"
                          }`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShareLanguage("pt");
                            setEditingClientProject({
                              ...editingClientProject,
                              shareLanguage: "pt"
                            });
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            (editingClientProject.shareLanguage || shareLanguage) === "pt"
                              ? "bg-zarco-cyan/20 text-zarco-cyan border border-zarco-cyan/30"
                              : "text-white/40 border border-transparent hover:text-white"
                          }`}
                        >
                          Português
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-white/30 uppercase tracking-widest">
                          Customer Username
                        </label>
                        <Input
                          value={editingClientProject.shareUsername || ""}
                          onChange={(e) => {
                            setEditingClientProject({
                              ...editingClientProject,
                              shareUsername: e.target.value
                            });
                          }}
                          placeholder="Username"
                          className="bg-[#0c1417] border-white/10 h-10 text-xs text-white rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-white/30 uppercase tracking-widest">
                          Customer Password
                        </label>
                        <div className="relative">
                          <Input
                            value={editingClientProject.sharePassword || ""}
                            onChange={(e) => {
                              setEditingClientProject({
                                ...editingClientProject,
                                sharePassword: e.target.value
                              });
                            }}
                            type={showCustomerPassword ? "text" : "password"}
                            placeholder="Password"
                            className="bg-[#0c1417] border-white/10 h-10 text-xs text-white rounded-lg pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                          >
                            {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateDoc(doc(db, "clientProjects", editingClientProject.id), {
                              shareUsername: editingClientProject.shareUsername || "",
                              sharePassword: editingClientProject.sharePassword || "",
                              isShared: editingClientProject.isShared || false,
                              shareLanguage: editingClientProject.shareLanguage || shareLanguage,
                              showFullDescription: editingClientProject.showFullDescription || false,
                              showReviewsBox: editingClientProject.showReviewsBox !== false,
                            });
                            // Refresh cache
                            setClientProjects(prev => prev.map(p => p.id === editingClientProject.id ? { ...editingClientProject, shareLanguage: editingClientProject.shareLanguage || shareLanguage, showReviewsBox: editingClientProject.showReviewsBox !== false } : p));
                            showAdminToast("Sharing details committed successfully!", "success");
                          } catch (err) {
                            console.error(err);
                            showAdminToast("Failed to commit sharing details.", "error");
                          }
                        }}
                        className="w-full bg-[#0c1417] hover:bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] py-2 h-9 rounded-lg"
                      >
                        Save Details
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          const currentLang = editingClientProject.shareLanguage || shareLanguage;
                          const langQuery = currentLang === "pt" ? "?lng=pt" : "?lng=en";
                          const url = `${window.location.origin}/#project-hub/${editingClientProject.id}${langQuery}`;
                          navigator.clipboard.writeText(url);
                          showAdminToast(`Client Space Link Copied (${currentLang === "pt" ? "Portuguese" : "English"})`, "success");
                        }}
                        className="w-full bg-zarco-cyan hover:bg-zarco-cyan/90 text-black font-black uppercase tracking-widest text-[9px] py-2 h-9 rounded-lg"
                      >
                        Copy URL Link
                      </Button>
                    </div>

                    {editingClientProject.isShared && (
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                        <span className="text-[8px] font-black text-zarco-cyan uppercase tracking-widest block">
                          Generated Link Preview
                        </span>
                        <div className="text-[9px] font-bold text-white/50 bg-black/40 p-2 rounded border border-white/5 break-all font-mono">
                          {`${window.location.origin}/#project-hub/${editingClientProject.id}${(editingClientProject.shareLanguage || shareLanguage) === "pt" ? "?lng=pt" : "?lng=en"}`}
                        </div>
                      </div>
                    )}

                    {(editingClientProject.isShared || (editingClientProject.shareUsername && editingClientProject.sharePassword)) && (
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center text-[10px] text-zinc-400 font-bold block">
                        Space is actively shared. Share credentials above for protected access.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : view === "client-project-form" && editingClientProject ? (
          <form
            onSubmit={handleSaveClientProject}
            className="max-w-5xl mx-auto pb-20"
          >
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                  📁{" "}
                  {editingClientProject.id.startsWith("client-proj-temp-")
                    ? "New Project"
                    : "Edit Project"}
                </h2>
                <p className="text-white/40 text-sm italic uppercase tracking-widest">
                  Creating a bespoke digital solution for{" "}
                  <span className="text-zarco-cyan font-bold">
                    {editingClient?.companyName || "a new context"}
                  </span>
                  .
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setView(editingClient ? "clients-view" : "managed-projects-list")}
                  variant="outline"
                  className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={savingClientProject}
                  className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
                >
                  {savingClientProject ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Complete Project"
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-8">
              {/* Basic Info & Client Link */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">🧠</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Basic Information
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Project Name
                      </label>
                      <Input
                        required
                        value={editingClientProject.projectName}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            projectName: e.target.value,
                          })
                        }
                        placeholder="E.g. Neo Vision Platform"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Linked Client
                      </label>
                      <select
                        required
                        value={editingClientProject.clientId}
                        onChange={(e) => {
                          const selectedClient = clients.find(c => c.id === e.target.value);
                          setEditingClientProject({ ...editingClientProject, clientId: e.target.value });
                          if (selectedClient) setEditingClient(selectedClient);
                        }}
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                      >
                        <option value="">Select Client</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.companyName} ({c.fullName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Project Type
                      </label>
                      <select
                        value={editingClientProject.projectType}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            projectType: e.target.value,
                          })
                        }
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                      >
                        <option value="">Select Type</option>
                        <option value="Website">Website</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Booking System">Booking System</option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="Web Application">Web Application</option>
                        <option value="CRM">CRM</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Project Architecture
                      </label>
                      <select
                        value={editingClientProject.hostingType}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            hostingType: e.target.value as any,
                          })
                        }
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                      >
                        <option value="">Select Architecture</option>
                        <option value="Frontend">Frontend (FRNT)</option>
                        <option value="Backend">Backend (BACK)</option>
                        <option value="Fullstack">Fullstack / Full (FULL)</option>
                        <option value="Database">Database (DATA)</option>
                        <option value="Other">Other Architecture</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Short Description
                      </label>
                      <Input
                        value={editingClientProject.shortDescription}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            shortDescription: e.target.value,
                          })
                        }
                        placeholder="Bespoke luxury tech platform."
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">👤</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Client Link
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Client Name
                      </label>
                      <div className="bg-[#0c1417] border border-white/5 rounded-xl px-4 h-14 flex items-center text-sm font-black text-zarco-cyan/50 uppercase">
                        {editingClient?.fullName || "Unlinked"} ({editingClient?.companyName || "No Client"})
                      </div>
                      <p className="text-[9px] text-white/20 italic mt-1">
                        This project is permanently linked to this client
                        identity.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Full Description
                        </label>
                        <Button
                          type="button"
                          onClick={() => setShowFullDescModal(true)}
                          className="bg-zarco-cyan/10 hover:bg-zarco-cyan/20 border border-zarco-cyan/30 text-[9px] font-black uppercase tracking-widest text-zarco-cyan rounded-lg px-3 py-1.5 h-auto transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 animate-pulse" />
                          Edit in Modal
                        </Button>
                      </div>
                      <textarea
                        value={editingClientProject.fullDescription}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            fullDescription: e.target.value,
                          })
                        }
                        placeholder="Detailed brief and scope of the project..."
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[140px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan resize-none"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Technical Stack & Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">⚙️</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Technical Stack
                    </h3>
                  </div>
                  <div className="space-y-6 text-left">
                    {Object.entries(TECHNICAL_STACK).map(([category, techs]) => (
                      <div key={category} className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#4fd1dc] block mb-2 opacity-80">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {techs.map((tech) => {
                            const current = editingClientProject.techStack || [];
                            const isSelected = current.includes(tech);
                            return (
                              <button
                                key={tech}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setEditingClientProject({
                                      ...editingClientProject,
                                      techStack: current.filter((t) => t !== tech),
                                    });
                                  } else {
                                    setEditingClientProject({
                                      ...editingClientProject,
                                      techStack: [...current, tech],
                                    });
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                  isSelected
                                    ? "bg-zarco-cyan text-black"
                                    : "bg-white/5 text-white/40 hover:bg-white/10"
                                }`}
                              >
                                {tech}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">📊</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Project Status
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Current Status
                      </label>
                      <div className="relative">
                        <select
                          value={editingClientProject.status}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              status: e.target.value as any,
                            })
                          }
                          className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm font-bold"
                        >
                          {PROJECT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Paid Status
                        </label>
                        <select
                          value={editingClientProject.paidStatus}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              paidStatus: e.target.value as any,
                            })
                          }
                          className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                        >
                          {PAID_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Maintenance Plan
                        </label>
                        <div
                          onClick={() =>
                            setEditingClientProject({
                              ...editingClientProject,
                              maintenancePlan:
                                !editingClientProject.maintenancePlan,
                            })
                          }
                          className={`h-14 border rounded-xl flex items-center justify-center cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest ${editingClientProject.maintenancePlan ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-white/5 border-white/10 text-white/20"}`}
                        >
                          {editingClientProject.maintenancePlan
                            ? "Active"
                            : "Inactive"}
                        </div>
                      </div>
                    </div>

                    {/* Add Subscription Section */}
                    <div className="border-t border-white/5 pt-6 mt-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold uppercase tracking-tight text-white flex items-center gap-2">
                            <span>💳</span> Recurring Subscription
                          </h4>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                            Manage support or secondary plans billing configurations
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            if (editingClientProject.hasSubscription) {
                              setShowAdminUnsubscribeModal(true);
                            } else {
                              setEditingClientProject({
                                ...editingClientProject,
                                hasSubscription: true,
                              });
                            }
                          }}
                          className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            editingClientProject.hasSubscription
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                              : "bg-zarco-cyan text-black"
                          }`}
                        >
                          {editingClientProject.hasSubscription ? "Remove Subscription" : "Add Subscription"}
                        </Button>
                      </div>

                      {editingClientProject.hasSubscription && (
                        <div className="space-y-4 p-5 bg-white/[0.01] border border-white/5 rounded-2xl animate-fade-in text-left">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                Subscription Title
                              </label>
                              <Input
                                value={editingClientProject.subscriptionTitle || ""}
                                onChange={(e) =>
                                  setEditingClientProject({
                                    ...editingClientProject,
                                    subscriptionTitle: e.target.value,
                                  })
                                }
                                placeholder="E.g. Monthly Maintenance & Hosting"
                                className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                Price (€) & Cycle
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  value={editingClientProject.subscriptionPrice || ""}
                                  onChange={(e) =>
                                    setEditingClientProject({
                                      ...editingClientProject,
                                      subscriptionPrice: e.target.value,
                                    })
                                  }
                                  placeholder="E.g. 150"
                                  className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                                />
                                <select
                                  value={editingClientProject.subscriptionInterval || "monthly"}
                                  onChange={(e) =>
                                    setEditingClientProject({
                                      ...editingClientProject,
                                      subscriptionInterval: e.target.value as any,
                                    })
                                  }
                                  className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-12 focus:outline-none focus:border-zarco-cyan text-white/70 text-xs font-bold"
                                >
                                  <option value="monthly">Monthly</option>
                                  <option value="yearly">Yearly</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 max-w-sm">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                              Times Paid (Before Cancellation / Active)
                            </label>
                            <Input
                              type="number"
                              min="0"
                              value={editingClientProject.subscriptionPaidCountPriorCancellation ?? ""}
                              onChange={(e) =>
                                setEditingClientProject({
                                  ...editingClientProject,
                                  subscriptionPaidCountPriorCancellation: e.target.value === "" ? "" : Number(e.target.value),
                                })
                              }
                              placeholder="E.g. 5"
                              className="bg-[#0c1417] border-white/10 rounded-xl h-12 w-full"
                            />
                            <p className="text-[9px] text-white/30 lowercase tracking-normal font-semibold">
                              Used to calculate money charged so far for active & cancelled subscriptions.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Subscription Description
                            </label>
                            <textarea
                              value={editingClientProject.subscriptionDescription || ""}
                              onChange={(e) =>
                                setEditingClientProject({
                                  ...editingClientProject,
                                  subscriptionDescription: e.target.value,
                                })
                              }
                              placeholder="Describe what is included in this plan..."
                              className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 h-24 focus:outline-none focus:border-zarco-cyan text-sm text-white/70"
                            />
                          </div>

                          {/* Plan Coverage Layout: Dynamic Feature Benefit List */}
                          <div className="space-y-4 p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-zarco-cyan uppercase tracking-widest block">
                                Subscription Included Benefits & SLA List
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  const defaults = [
                                    "Suporte Dedicado via Slack",
                                    "Auditorias de Segurança Proativas",
                                    "Servidor de Produção Optimizado"
                                  ];
                                  setEditingClientProject({
                                    ...editingClientProject,
                                    subscriptionFeatures: [
                                      ...(editingClientProject.subscriptionFeatures || []),
                                      ...defaults.filter(d => !(editingClientProject.subscriptionFeatures || []).includes(d))
                                    ]
                                  });
                                }}
                                className="bg-zarco-cyan/10 hover:bg-zarco-cyan/20 text-[#4fd1dc] text-[8px] font-black tracking-wider px-3 h-7 rounded-lg border-none"
                              >
                                ⚡ Load Defaults
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {/* Add Feature input group */}
                              <div className="flex gap-2">
                                <Input
                                  value={newSubscriptionFeature}
                                  onChange={(e) => setNewSubscriptionFeature(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      if (newSubscriptionFeature.trim()) {
                                        const currentFeatures = editingClientProject.subscriptionFeatures || [];
                                        setEditingClientProject({
                                          ...editingClientProject,
                                          subscriptionFeatures: [...currentFeatures, newSubscriptionFeature.trim()]
                                        });
                                        setNewSubscriptionFeature("");
                                      }
                                    }
                                  }}
                                  placeholder="E.g. Daily Backup Strategy..."
                                  className="bg-[#0c1417] border-white/10 rounded-xl h-10 flex-1 text-xs"
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (newSubscriptionFeature.trim()) {
                                      const currentFeatures = editingClientProject.subscriptionFeatures || [];
                                      setEditingClientProject({
                                        ...editingClientProject,
                                        subscriptionFeatures: [...currentFeatures, newSubscriptionFeature.trim()]
                                      });
                                      setNewSubscriptionFeature("");
                                    }
                                  }}
                                  className="bg-zarco-cyan text-black px-4 h-10 rounded-xl"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Features List */}
                              <div className="space-y-1.5 pt-2 max-h-48 overflow-y-auto">
                                {!editingClientProject.subscriptionFeatures || editingClientProject.subscriptionFeatures.length === 0 ? (
                                  <p className="text-[10px] text-white/30 italic uppercase font-bold tracking-wider py-1">
                                    No custom benefits configured yet. Load defaults or type above to add.
                                  </p>
                                ) : (
                                  editingClientProject.subscriptionFeatures.map((feat, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-2.5 bg-[#0c1417]/50 rounded-xl border border-white/5 group hover:border-white/10 transition-all"
                                    >
                                      <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">
                                        {feat}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const filtered = (editingClientProject.subscriptionFeatures || []).filter((_, i) => i !== index);
                                          setEditingClientProject({
                                            ...editingClientProject,
                                            subscriptionFeatures: filtered
                                          });
                                        }}
                                        className="text-white/30 hover:text-red-400 p-1 rounded transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider block">
                                Show on Customer Portal
                              </span>
                              <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest block">
                                Allow consumer to checkout via Stripe directly
                              </span>
                            </div>
                            <Button
                              type="button"
                              onClick={() =>
                                setEditingClientProject({
                                  ...editingClientProject,
                                  subscriptionEnabled: !editingClientProject.subscriptionEnabled,
                                })
                              }
                              className={`h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                editingClientProject.subscriptionEnabled
                                  ? "bg-green-500/10 border border-green-500/20 text-green-500"
                                  : "bg-white/5 border border-white/10 text-white/30"
                              }`}
                            >
                              {editingClientProject.subscriptionEnabled ? "Shown / Enabled" : "Hidden / Inactive"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Links & Domain */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">🌐</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Project Links
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Live Website URL
                      </label>
                      <Input
                        value={editingClientProject.liveUrl}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            liveUrl: e.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Other Website URLs
                        </label>
                        <Button
                          type="button"
                          onClick={() => {
                            const current = editingClientProject.otherUrls || [];
                            setEditingClientProject({
                              ...editingClientProject,
                              otherUrls: [...current, { label: "", url: "" }],
                            });
                          }}
                          className="text-[9px] font-black uppercase tracking-widest h-7 bg-white/5 hover:bg-white/10 border border-white/10"
                        >
                          Add URL
                        </Button>
                      </div>
                      {(editingClientProject.otherUrls || []).map((link, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-white/5 p-4 rounded-xl border border-white/5">
                          <div className="col-span-4 space-y-1">
                            <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Label</label>
                            <Input
                              value={link.label}
                              onChange={(e) => {
                                const newUrls = [...(editingClientProject.otherUrls || [])];
                                newUrls[idx].label = e.target.value;
                                setEditingClientProject({ ...editingClientProject, otherUrls: newUrls });
                              }}
                              placeholder="e.g. Staging"
                              className="bg-[#0c1417] border-white/5 h-10 text-xs"
                            />
                          </div>
                          <div className="col-span-7 space-y-1">
                            <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">URL</label>
                            <Input
                              value={link.url}
                              onChange={(e) => {
                                const newUrls = [...(editingClientProject.otherUrls || [])];
                                newUrls[idx].url = e.target.value;
                                setEditingClientProject({ ...editingClientProject, otherUrls: newUrls });
                              }}
                              placeholder="https://..."
                              className="bg-[#0c1417] border-white/5 h-10 text-xs"
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                const newUrls = (editingClientProject.otherUrls || []).filter((_, i) => i !== idx);
                                setEditingClientProject({ ...editingClientProject, otherUrls: newUrls });
                              }}
                              className="h-10 w-full p-0 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          GitHub Repo
                        </label>
                        <Input
                          value={editingClientProject.githubUrl}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              githubUrl: e.target.value,
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Figma Design
                        </label>
                        <Input
                          value={editingClientProject.figmaUrl}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              figmaUrl: e.target.value,
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Service Email
                      </label>
                      <Input
                        type="email"
                        value={editingClientProject.serviceEmail}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            serviceEmail: e.target.value,
                          })
                        }
                        placeholder="service@example.com"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌍</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        Project Infrastructure
                      </h3>
                    </div>
                    <Button
                      type="button"
                      onClick={addHost}
                      className="bg-white/5 hover:bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest h-8 px-4 rounded-lg border border-white/10"
                    >
                      Add Hosting Asset
                    </Button>
                  </div>
                  <div className="space-y-12">
                    {/* Primary Host (Backward Compatibility) */}
                    <div className="space-y-6 relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest block">
                          Primary Asset
                        </span>
                        {(editingClientProject.domainName || editingClientProject.providerUrl) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClientProject({
                                ...editingClientProject,
                                domainName: "",
                                providerUrl: "",
                                domainProvider: "",
                                domainExpiration: "",
                                isHostingFree: false,
                                hostingType: ""
                              });
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-red-500/20 shadow-lg shadow-red-500/5 group"
                          >
                            <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            Remove Asset
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            Provider URL
                          </label>
                          <Input
                            value={editingClientProject.providerUrl}
                            onChange={(e) =>
                              setEditingClientProject({
                                ...editingClientProject,
                                providerUrl: e.target.value,
                              })
                            }
                            placeholder="e.g. coffeehaven.netlify.app"
                            className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            Custom Domain
                          </label>
                          <Input
                            value={editingClientProject.domainName}
                            onChange={(e) =>
                              setEditingClientProject({
                                ...editingClientProject,
                                domainName: e.target.value,
                              })
                            }
                            placeholder="e.g. coffeehaven.com"
                            className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            Provider
                          </label>
                          <div className="space-y-2">
                            <div className="relative">
                              <select
                                value={
                                  INFRASTRUCTURE_PROVIDERS.filter(
                                    (p) => p !== "Other",
                                  ).includes(editingClientProject.domainProvider)
                                    ? editingClientProject.domainProvider
                                    : editingClientProject.domainProvider
                                      ? "Other"
                                      : ""
                                }
                                onChange={(e) => {
                                  if (e.target.value === "Other") {
                                    setEditingClientProject({
                                      ...editingClientProject,
                                      domainProvider: "",
                                    });
                                  } else {
                                    setEditingClientProject({
                                      ...editingClientProject,
                                      domainProvider: e.target.value,
                                    });
                                  }
                                }}
                                className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm font-medium"
                              >
                                <option value="">Select Provider</option>
                                {INFRASTRUCTURE_PROVIDERS.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                            </div>
                            {(editingClientProject.domainProvider === "" ||
                              !INFRASTRUCTURE_PROVIDERS.filter(
                                (p) => p !== "Other",
                              ).includes(
                                editingClientProject.domainProvider,
                              )) && (
                              <Input
                                value={editingClientProject.domainProvider}
                                onChange={(e) =>
                                  setEditingClientProject({
                                    ...editingClientProject,
                                    domainProvider: e.target.value,
                                  })
                                }
                                placeholder="Enter custom provider..."
                                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                              />
                            )}
                          </div>
                        </div>
                        {!editingClientProject.isHostingFree ? (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Expiration
                            </label>
                            <Input
                              type="date"
                              value={editingClientProject.domainExpiration}
                              onChange={(e) =>
                                setEditingClientProject({
                                  ...editingClientProject,
                                  domainExpiration: e.target.value,
                                })
                              }
                              className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Show Expiry Date?
                            </label>
                            <div
                              onClick={() => {
                                const newVal = !editingClientProject.showDomainExpiration;
                                setEditingClientProject({
                                  ...editingClientProject,
                                  showDomainExpiration: newVal,
                                  domainExpiration: newVal ? (editingClientProject.domainExpiration || "2028-12-31") : "",
                                });
                              }}
                              className={`h-14 border rounded-xl flex items-center px-4 cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest gap-3 ${editingClientProject.showDomainExpiration ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-white/5 border-white/10 text-white/20"}`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${editingClientProject.showDomainExpiration ? "bg-green-500 border-green-500" : "border-white/20"}`}>
                                {editingClientProject.showDomainExpiration && <Check className="w-3 h-3 text-black" />}
                              </div>
                              {editingClientProject.showDomainExpiration
                                ? "Show Expiry"
                                : "No Expiry"}
                            </div>
                          </div>
                        )}
                      </div>

                      {editingClientProject.isHostingFree && editingClientProject.showDomainExpiration && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div />
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Expiration (Free Tier)
                            </label>
                            <Input
                              type="date"
                              value={editingClientProject.domainExpiration}
                              onChange={(e) =>
                                setEditingClientProject({
                                  ...editingClientProject,
                                  domainExpiration: e.target.value,
                                })
                              }
                              className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                            />
                          </div>
                        </div>
                      )}

                      <div className="h-px bg-white/5 my-2" />
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            Primary Architecture
                          </label>
                          <div className="relative">
                            <select
                              value={editingClientProject.hostingType}
                              onChange={(e) =>
                                setEditingClientProject({
                                  ...editingClientProject,
                                  hostingType: e.target.value as any,
                                })
                              }
                              className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm font-medium"
                            >
                              <option value="">Select Architecture</option>
                              <option value="Frontend">Frontend (FRNT)</option>
                              <option value="Backend">Backend (BACK)</option>
                              <option value="Database">Database (DATA)</option>
                              <option value="Fullstack">Fullstack / Full (FULL)</option>
                              <option value="Other">Other Architecture</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            Hosting Cost
                          </label>
                          <div
                            onClick={() => {
                              const newFree = !editingClientProject.isHostingFree;
                              setEditingClientProject({
                                ...editingClientProject,
                                isHostingFree: newFree,
                                showDomainExpiration: newFree ? false : editingClientProject.showDomainExpiration,
                              });
                            }}
                            className={`h-14 border rounded-xl flex items-center justify-center cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest ${editingClientProject.isHostingFree ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}
                          >
                            {editingClientProject.isHostingFree
                              ? "Free Hosting"
                              : "Paid Hosting"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            Asset Source
                          </label>
                          <div
                            onClick={() =>
                              setEditingClientProject({
                                ...editingClientProject,
                                isClientProvided:
                                  !editingClientProject.isClientProvided,
                              })
                            }
                            className={`h-14 border rounded-xl flex items-center px-4 cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest gap-3 ${editingClientProject.isClientProvided ? "bg-zarco-cyan/10 border-zarco-cyan/20 text-zarco-cyan" : "bg-white/5 border-white/10 text-white/20"}`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${editingClientProject.isClientProvided ? "bg-zarco-cyan border-zarco-cyan" : "border-white/20"}`}>
                              {editingClientProject.isClientProvided && <Check className="w-3 h-3 text-black" />}
                            </div>
                            {editingClientProject.isClientProvided
                              ? "Provided by Client"
                              : "Zarco Infrastructure"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            Payment Management
                          </label>
                          <div
                            onClick={() =>
                              setEditingClientProject({
                                ...editingClientProject,
                                isPaymentManagedByCustomer:
                                  !editingClientProject.isPaymentManagedByCustomer,
                              })
                            }
                            className={`h-14 border rounded-xl flex items-center px-4 cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest gap-3 ${editingClientProject.isPaymentManagedByCustomer ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-white/5 border-white/10 text-white/20"}`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${editingClientProject.isPaymentManagedByCustomer ? "bg-amber-500 border-amber-500" : "border-white/20"}`}>
                              {editingClientProject.isPaymentManagedByCustomer && <Check className="w-3 h-3 text-black" />}
                            </div>
                            {editingClientProject.isPaymentManagedByCustomer
                              ? "Managed by Customer"
                              : "Managed by Company"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Hosts */}
                    {(editingClientProject.hosts || []).map((host, idx) => (
                      <div
                        key={idx}
                        className="space-y-6 relative pt-8 border-t border-white/5"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                            Hosting Asset #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeHost(idx)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-red-500/20 shadow-lg shadow-red-500/5 group"
                          >
                            <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            Remove Asset
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Provider URL
                            </label>
                            <Input
                              value={host.providerUrl}
                              onChange={(e) =>
                                updateHost(idx, "providerUrl", e.target.value)
                              }
                              placeholder="e.g. coffee-api.railway.app"
                              className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Custom Domain
                            </label>
                            <Input
                              value={host.domainName}
                              onChange={(e) =>
                                updateHost(idx, "domainName", e.target.value)
                              }
                              placeholder="e.g. api.coffeehaven.com"
                              className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Provider
                            </label>
                            <div className="space-y-2">
                              <div className="relative">
                                <select
                                  value={
                                    INFRASTRUCTURE_PROVIDERS.filter(
                                      (p) => p !== "Other",
                                    ).includes(host.domainProvider)
                                      ? host.domainProvider
                                      : host.domainProvider
                                        ? "Other"
                                        : ""
                                  }
                                  onChange={(e) => {
                                    if (e.target.value === "Other") {
                                      updateHost(idx, "domainProvider", "");
                                    } else {
                                      updateHost(
                                        idx,
                                        "domainProvider",
                                        e.target.value,
                                      );
                                    }
                                  }}
                                  className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm font-medium"
                                >
                                  <option value="">Select Provider</option>
                                  {INFRASTRUCTURE_PROVIDERS.map((p) => (
                                    <option key={p} value={p}>
                                      {p}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                              </div>
                              {(host.domainProvider === "" ||
                                !INFRASTRUCTURE_PROVIDERS.filter(
                                  (p) => p !== "Other",
                                ).includes(host.domainProvider)) && (
                                <Input
                                  value={host.domainProvider}
                                  onChange={(e) =>
                                    updateHost(
                                      idx,
                                      "domainProvider",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Enter custom provider..."
                                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                                />
                              )}
                            </div>
                          </div>
                          {!host.isHostingFree ? (
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                Expiration
                              </label>
                              <Input
                                type="date"
                                value={host.domainExpiration}
                                onChange={(e) =>
                                  updateHost(
                                    idx,
                                    "domainExpiration",
                                    e.target.value,
                                  )
                                }
                                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                Show Expiry Date?
                              </label>
                              <div
                                onClick={() => {
                                  const newVal = !host.showDomainExpiration;
                                  updateHost(idx, {
                                    showDomainExpiration: newVal,
                                    domainExpiration: newVal ? (host.domainExpiration || "2028-12-31") : "",
                                  });
                                }}
                                className={`h-14 border rounded-xl flex items-center px-4 cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest gap-3 ${host.showDomainExpiration ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-white/5 border-white/10 text-white/20"}`}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${host.showDomainExpiration ? "bg-green-500 border-green-500" : "border-white/20"}`}>
                                  {host.showDomainExpiration && <Check className="w-3 h-3 text-black" />}
                                </div>
                                {host.showDomainExpiration
                                  ? "Show Expiry"
                                  : "No Expiry"}
                              </div>
                            </div>
                          )}
                        </div>

                        {host.isHostingFree && host.showDomainExpiration && (
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div />
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                Expiration (Free Tier)
                              </label>
                              <Input
                                type="date"
                                value={host.domainExpiration}
                                onChange={(e) =>
                                  updateHost(
                                    idx,
                                    "domainExpiration",
                                    e.target.value,
                                  )
                                }
                                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Architecture
                            </label>
                            <div className="relative">
                              <select
                                value={host.hostingType}
                                onChange={(e) =>
                                  updateHost(
                                    idx,
                                    "hostingType",
                                    e.target.value as any,
                                  )
                                }
                                className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm font-medium"
                              >
                                <option value="">Select Architecture</option>
                                <option value="Frontend">Frontend (FRNT)</option>
                                <option value="Backend">Backend (BACK)</option>
                                <option value="Database">Database (DATA)</option>
                                <option value="Fullstack">Fullstack / Full (FULL)</option>
                                <option value="Other">Other Architecture</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Cost Tier
                            </label>
                            <div
                              onClick={() => {
                                const newFree = !host.isHostingFree;
                                updateHost(idx, {
                                  isHostingFree: newFree,
                                  showDomainExpiration: newFree ? false : host.showDomainExpiration,
                                });
                              }}
                              className={`h-14 border rounded-xl flex items-center justify-center cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest ${host.isHostingFree ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}
                            >
                              {host.isHostingFree ? "Free Tier" : "Paid Tier"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Asset Source
                            </label>
                            <div
                              onClick={() =>
                                updateHost(
                                  idx,
                                  "isClientProvided",
                                  !host.isClientProvided,
                                )
                              }
                              className={`h-14 border rounded-xl flex items-center px-4 cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest gap-3 ${host.isClientProvided ? "bg-zarco-cyan/10 border-zarco-cyan/20 text-zarco-cyan" : "bg-white/5 border-white/10 text-white/20"}`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${host.isClientProvided ? "bg-zarco-cyan border-zarco-cyan" : "border-white/20"}`}>
                                {host.isClientProvided && <Check className="w-3 h-3 text-black" />}
                              </div>
                              {host.isClientProvided
                                ? "Provided by Client"
                                : "Zarco Infrastructure"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                              Payment Management
                            </label>
                            <div
                              onClick={() =>
                                updateHost(
                                  idx,
                                  "isPaymentManagedByCustomer",
                                  !host.isPaymentManagedByCustomer,
                                )
                              }
                              className={`h-14 border rounded-xl flex items-center px-4 cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest gap-3 ${host.isPaymentManagedByCustomer ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-white/5 border-white/10 text-white/20"}`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${host.isPaymentManagedByCustomer ? "bg-amber-500 border-amber-500" : "border-white/20"}`}>
                                {host.isPaymentManagedByCustomer && <Check className="w-3 h-3 text-black" />}
                              </div>
                              {host.isPaymentManagedByCustomer
                                ? "Managed by Customer"
                                : "Managed by Company"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Timeline & Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">📅</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Timeline
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={editingClientProject.startDate}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            startDate: e.target.value,
                          })
                        }
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Deadline
                      </label>
                      <Input
                        type="date"
                        value={editingClientProject.deadline}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            deadline: e.target.value,
                          })
                        }
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Budget Price
                      </label>
                      <Input
                        type="number"
                        value={editingClientProject.price}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            price: e.target.value,
                          })
                        }
                        placeholder="5000"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Delivery Date
                      </label>
                      <Input
                        type="date"
                        value={editingClientProject.deliveryDate}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            deliveryDate: e.target.value,
                          })
                        }
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Expected Time to Finish
                      </label>
                      <Input
                        type="text"
                        value={editingClientProject.expectedDuration || ""}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            expectedDuration: e.target.value,
                          })
                        }
                        placeholder="e.g. 4 Weeks or 6 Weeks"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Expected Duration Toggle
                      </label>
                      <div
                        onClick={() =>
                          setEditingClientProject({
                            ...editingClientProject,
                            onlyShowExpected: !editingClientProject.onlyShowExpected,
                          })
                        }
                        className={`h-14 border rounded-xl flex items-center px-4 cursor-pointer transition-all uppercase text-[10px] font-black tracking-widest gap-3 ${
                          editingClientProject.onlyShowExpected
                            ? "bg-zarco-cyan/10 border-zarco-cyan/20 text-zarco-cyan"
                            : "bg-white/5 border-white/10 text-white/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            editingClientProject.onlyShowExpected
                              ? "bg-zarco-cyan border-zarco-cyan"
                              : "border-white/20"
                          }`}
                        >
                          {editingClientProject.onlyShowExpected && (
                            <Check className="w-3 h-3 text-black" />
                          )}
                        </div>
                        <span className="truncate">
                          {editingClientProject.onlyShowExpected
                            ? "Only Show Expected Duration"
                            : "Show All Timeline Fields"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">📝</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Internal Intelligence
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Development Notes
                      </label>
                      <textarea
                        value={editingClientProject.internalNotes}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            internalNotes: e.target.value,
                          })
                        }
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[100px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Client Feedback
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowFeedbackModal(true)}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zarco-cyan/10 hover:bg-zarco-cyan/20 border border-zarco-cyan/20 text-zarco-cyan text-[9px] uppercase font-black tracking-widest transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Customer Workspace Notes ({(editingClientProject.feedbacksList || []).length})</span>
                        </button>
                      </div>
                      <textarea
                        value={editingClientProject.clientFeedback}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            clientFeedback: e.target.value,
                          })
                        }
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[100px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan resize-none"
                      />
                    </div>
                  </div>
                </Card>

                {/* Secure Client Portal & Sharing Link */}
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 mt-8">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">🔗</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white animate-pulse">
                      Secure Client Portal & Workspace
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed">
                      Enable shared workspaces to let customers view objectives, wireframes, pricing sheets, and submit live feedback notes securely.
                    </p>

                    <div className="flex items-center gap-3 py-3 px-4 bg-white/5 border border-white/5 rounded-xl">
                      <input
                        type="checkbox"
                        id="isShared"
                        checked={editingClientProject.isShared || false}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            isShared: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-zarco-cyan bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-cyan"
                      />
                      <label htmlFor="isShared" className="text-xs font-black uppercase tracking-widest text-white/80 select-none cursor-pointer">
                        Enable Portal Link Sharing
                      </label>
                    </div>

                    <div className="flex items-center gap-3 py-3 px-4 bg-white/5 border border-white/5 rounded-xl">
                      <input
                        type="checkbox"
                        id="showFullDescription"
                        checked={editingClientProject.showFullDescription || false}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            showFullDescription: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-zarco-cyan bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-cyan"
                      />
                      <label htmlFor="showFullDescription" className="text-xs font-black uppercase tracking-widest text-white/80 select-none cursor-pointer">
                        Display Full Description Button in Portal
                      </label>
                    </div>

                    <div className="flex items-center gap-3 py-3 px-4 bg-white/5 border border-white/5 rounded-xl">
                      <input
                        type="checkbox"
                        id="showReviewsBox"
                        checked={editingClientProject.showReviewsBox !== false}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            showReviewsBox: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-zarco-cyan bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-cyan"
                      />
                      <label htmlFor="showReviewsBox" className="text-xs font-black uppercase tracking-widest text-white/80 select-none cursor-pointer border-none bg-transparent">
                        Display Reviews & Testimonial Box in Portal
                      </label>
                    </div>

                    <div className="flex items-center gap-3 py-3 px-4 bg-white/5 border border-white/5 rounded-xl">
                      <input
                        type="checkbox"
                        id="showTermsButton"
                        checked={editingClientProject.showTermsButton || false}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            showTermsButton: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-zarco-cyan bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-cyan"
                      />
                      <label htmlFor="showTermsButton" className="text-xs font-black uppercase tracking-widest text-white/80 select-none cursor-pointer border-none bg-transparent">
                        Display Terms & Conditions Button in Portal Page Top
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Portal Username
                        </label>
                        <Input
                          value={editingClientProject.shareUsername || ""}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              shareUsername: e.target.value,
                            })
                          }
                          placeholder="e.g. customername"
                          className="bg-[#0c1417] border-white/10 rounded-xl h-12 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Portal Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPortalPassword ? "text" : "password"}
                            value={editingClientProject.sharePassword || ""}
                            onChange={(e) =>
                              setEditingClientProject({
                                ...editingClientProject,
                                sharePassword: e.target.value,
                              })
                            }
                            placeholder="e.g. zarco-lock-pass"
                            className="bg-[#0c1417] border-white/10 rounded-xl h-12 text-white pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPortalPassword(!showPortalPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                          >
                            {showPortalPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Synced Space display language option */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                        Space Display Language
                      </label>
                      <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1 max-w-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClientProject({
                              ...editingClientProject,
                              shareLanguage: "en",
                            });
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            (editingClientProject.shareLanguage || "en") === "en"
                              ? "bg-zarco-cyan/20 text-zarco-cyan border border-zarco-cyan/30"
                              : "text-white/40 border border-transparent hover:text-white"
                          }`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClientProject({
                              ...editingClientProject,
                              shareLanguage: "pt",
                            });
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            (editingClientProject.shareLanguage || "en") === "pt"
                              ? "bg-zarco-cyan/20 text-zarco-cyan border border-zarco-cyan/30"
                              : "text-white/40 border border-transparent hover:text-white"
                          }`}
                        >
                          Português
                        </button>
                      </div>
                    </div>

                    {(editingClientProject.isShared || (editingClientProject.shareUsername && editingClientProject.sharePassword)) && (
                      <div className="p-4 bg-zarco-cyan/5 border border-zarco-cyan/15 rounded-xl mt-4">
                        <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest block mb-2">
                          Sharable Customer link
                        </span>
                        <div className="flex items-center gap-3 bg-black/40 px-3.5 py-2.5 rounded-lg border border-white/5 text-xs">
                          <span className="font-mono text-white/70 truncate select-all flex-1">
                            {window.location.origin}/#project-hub/{editingClientProject.id}{(editingClientProject.shareLanguage || "en") === "pt" ? "?lng=pt" : "?lng=en"}
                          </span>
                          <Button
                            type="button"
                            onClick={() => {
                              const finalUrl = `${window.location.origin}/#project-hub/${editingClientProject.id}${(editingClientProject.shareLanguage || "en") === "pt" ? "?lng=pt" : "?lng=en"}`;
                              navigator.clipboard.writeText(finalUrl);
                              showAdminToast("Client Workspace Link copied successfully!", "success");
                            }}
                            className="bg-zarco-cyan/10 hover:bg-zarco-cyan/25 border border-zarco-cyan/35 text-zarco-cyan font-black text-[9px] uppercase tracking-widest px-3 py-1.5 h-8 rounded-md"
                          >
                            Copy Link
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Wireframes & Prototypes Section inside Shared Portal Card */}
                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
                          Prototypes & Design Assets
                        </h4>
                        <span className="text-[9px] text-white/35 uppercase tracking-wider block font-bold">
                          Provide wireframe figma links, direct asset images or custom interactive prototypes
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-2">
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-medium">
                              Wireframe URLs / Assets (Figma or Images)
                            </label>
                            <span className="text-[9px] text-white/20 uppercase tracking-wide block font-bold">
                              Provide figma link or upload visual layouts directly
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              id="wireframe-file-upload-portal"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploading("wireframe");
                                try {
                                  let folderName = "portfolio/client-projects";
                                  if (editingClientProject.projectName) {
                                    const slug = editingClientProject.projectName
                                      .trim()
                                      .toLowerCase()
                                      .normalize("NFD")
                                      .replace(/[\u0300-\u036f]/g, "")
                                      .replace(/[^a-z0-9]+/g, "-")
                                      .replace(/(^-|-$)/g, "");
                                    folderName = `portfolio/${slug}/wireframes`;
                                  }
                                  const url = await uploadToCloudinary(file, folderName);
                                  const currentVal = (editingClientProject.wireframes || "").trim();
                                  const newVal = currentVal ? `${currentVal}\n${url}` : url;
                                  setEditingClientProject({
                                    ...editingClientProject,
                                    wireframes: newVal
                                  });
                                  showAdminToast("Wireframe layout successfully uploaded and added below!", "success");
                                } catch (err: any) {
                                  console.error("Error uploading wireframe:", err);
                                  showAdminToast(`Upload failed: ${err.message || "Unknown error"}`, "error");
                                } finally {
                                  setUploading(null);
                                  e.target.value = "";
                                }
                              }}
                              className="hidden"
                              disabled={uploading === "wireframe"}
                            />
                            <label
                              htmlFor="wireframe-file-upload-portal"
                              className={`px-4 py-2 bg-zarco-purple/15 hover:bg-zarco-purple/25 border border-zarco-purple/35 text-white font-black uppercase tracking-widest text-[9px] rounded-lg cursor-pointer flex items-center gap-2 transition-all ${
                                uploading === "wireframe" ? "opacity-50 pointer-events-none" : ""
                              }`}
                            >
                              <span>{uploading === "wireframe" ? "⏳ Uploading..." : "📷 Upload Wireframe image"}</span>
                            </label>
                          </div>
                        </div>
                        <textarea
                          value={editingClientProject.wireframes || ""}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              wireframes: e.target.value,
                            })
                          }
                          placeholder="e.g.&#10;https://figma.com/file/...&#10;https://res.cloudinary.com/..."
                          className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[100px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan"
                        />
                      </div>

                      {/* Interactive HTML Prototypes Sub-Section */}
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-medium">
                              Figma or HTML Interactive Prototypes (Embed/iframe Code)
                            </label>
                            <span className="text-[9px] text-white/20 uppercase tracking-wide block">
                              Add custom HTML embed codes to render live prototypes on the client hub
                            </span>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              const newProto: PrototypeEntry = {
                                id: 'proto-' + Date.now().toString(36),
                                title: 'Interactive Prototype ' + ((editingClientProject.prototypesList || []).length + 1),
                                embedHtml: '',
                              };
                              setEditingClientProject({
                                ...editingClientProject,
                                prototypesList: [...(editingClientProject.prototypesList || []), newProto]
                              });
                            }}
                            className="bg-zarco-cyan/20 border border-zarco-cyan/30 text-zarco-cyan font-black uppercase tracking-widest text-[9px] px-3 py-1.5 hover:bg-zarco-cyan/35 rounded-lg flex items-center gap-1 self-start sm:self-auto"
                          >
                            + Add Prototype Embed
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {(editingClientProject.prototypesList || []).map((proto, pidx) => (
                            <div key={proto.id || pidx} className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-3 relative">
                              <div className="flex justify-between items-center gap-3">
                                <div className="flex-1 space-y-1">
                                  <label className="text-[9px] font-black text-white/35 uppercase tracking-widest block">
                                    Prototype Title
                                  </label>
                                  <Input
                                    type="text"
                                    value={proto.title || ''}
                                    onChange={(e) => {
                                      const newList = [...(editingClientProject.prototypesList || [])];
                                      newList[pidx] = { ...proto, title: e.target.value };
                                      setEditingClientProject({
                                        ...editingClientProject,
                                        prototypesList: newList
                                      });
                                    }}
                                    placeholder="e.g. Mobile Prototype / Final Checkout Flow"
                                    className="bg-[#0c1417]/70 border-white/10 rounded-lg h-9 text-xs text-white"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const newList = (editingClientProject.prototypesList || []).filter((_, i) => i !== pidx);
                                    setEditingClientProject({
                                      ...editingClientProject,
                                      prototypesList: newList
                                    });
                                  }}
                                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-[9px] uppercase px-3 py-1.5 h-8 rounded-lg self-end"
                                >
                                  Delete
                                </Button>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-white/35 uppercase tracking-widest block">
                                  Custom HTML Embed / iframe Code
                                </label>
                                <textarea
                                  value={proto.embedHtml || ''}
                                  onChange={(e) => {
                                    const newList = [...(editingClientProject.prototypesList || [])];
                                    newList[pidx] = { ...proto, embedHtml: e.target.value };
                                    setEditingClientProject({
                                      ...editingClientProject,
                                      prototypesList: newList
                                    });
                                  }}
                                  placeholder='e.g. <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="100%" height="450" src="https://embed.figma.com/proto/...&scaling=scale-down" allowfullscreen></iframe>'
                                  className="w-full bg-[#0c1417]/70 border border-white/10 rounded-lg p-3 min-h-[80px] text-xs font-mono text-white/80 focus:outline-none focus:border-zarco-cyan"
                                />
                              </div>
                            </div>
                          ))}

                          {(editingClientProject.prototypesList || []).length === 0 && (
                            <div className="text-center py-4 border border-dashed border-white/5 rounded-xl text-white/30 text-[10px] uppercase font-bold tracking-wider">
                              No Prototype HTML integrations added yet. Click "+ Add Prototype Embed".
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Scope & Proposal Specifications */}
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 mt-8">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">📐</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Proposal & Scope Specifications
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Project Purpose & Long-term Targets
                      </label>
                      <textarea
                        value={editingClientProject.projectPurpose || ""}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            projectPurpose: e.target.value,
                          })
                        }
                        placeholder="Detail the core value model, target audience, and primary commercial purposes of this development..."
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[120px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan resize-none"
                      />
                    </div>

                    {/* Common Website Pages Checkbox Presets */}
                    <div className="space-y-3 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
                        Select Standard Website Pages (Auto-Calculates Estimated Pages Count)
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {PRESET_PAGES.map((presetPage) => {
                          const isSelected = (editingClientProject.pagesList || "")
                            .split("\n")
                            .map((p) => p.trim())
                            .filter((p) => p !== "")
                            .includes(presetPage);
                          return (
                            <button
                              key={presetPage}
                              type="button"
                              onClick={() => togglePagePreset(presetPage)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border flex items-center gap-2 ${
                                isSelected
                                  ? "bg-zarco-cyan/15 text-zarco-cyan border-zarco-cyan/30 shadow-[0_0_10px_rgba(79,209,220,0.1)]"
                                  : "bg-black/30 text-white/40 border-white/5 hover:text-white hover:border-white/10"
                              }`}
                            >
                              <span className="text-xs">{isSelected ? "✓" : "+"}</span>
                              <span>{presetPage}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Estimated Pages/Screens Count
                        </label>
                        <Input
                          value={editingClientProject.pagesCount || ""}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              pagesCount: e.target.value,
                            })
                          }
                          placeholder="e.g. 5 Pages"
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14 text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Page Schemas (One per line)
                        </label>
                        <textarea
                          value={editingClientProject.pagesList || ""}
                          onChange={(e) => {
                            const listVal = e.target.value;
                            const lines = listVal.split("\n").map(p => p.trim()).filter(p => p !== "");
                            const totalPages = lines.length;
                            const countStr = totalPages > 0 ? `${totalPages} Page${totalPages > 1 ? "s" : ""}` : "";
                            setEditingClientProject({
                              ...editingClientProject,
                              pagesList: listVal,
                              pagesCount: countStr
                            });
                          }}
                          placeholder="e.g.&#10;Homepage&#10;About Us&#10;Dynamic Checkout API"
                          className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[90px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan resize-y"
                        />
                      </div>
                    </div>

                    {/* Common Platform Features & Presets */}
                    <div className="space-y-3 bg-[#080d0f] border border-white/5 p-5 rounded-2xl">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
                        Select Standard Platform Features (Auto-Adds Testimonials, Reviews, Database, Backend)
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {PRESET_FEATURES.map((presetFeature) => {
                          const isSelected = (editingClientProject.featuresList || "")
                            .split("\n")
                            .map((f) => f.trim())
                            .filter((f) => f !== "")
                            .includes(presetFeature);
                          return (
                            <button
                              key={presetFeature}
                              type="button"
                              onClick={() => toggleFeaturePreset(presetFeature)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border flex items-center gap-2 ${
                                isSelected
                                  ? "bg-zarco-purple/15 text-zarco-purple border-zarco-purple/30 shadow-[0_0_10px_rgba(151,71,255,0.1)]"
                                  : "bg-black/30 text-white/40 border-white/5 hover:text-white hover:border-white/10"
                              }`}
                            >
                              <span className="text-xs">{isSelected ? "✓" : "+"}</span>
                              <span>{presetFeature}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2 pt-4">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                          Features & Core Infrastructure Specifications (One per line)
                        </label>
                        <textarea
                          value={editingClientProject.featuresList || ""}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              featuresList: e.target.value,
                            })
                          }
                          placeholder="e.g.&#10;Database Integration&#10;Server & Backend API&#10;Testimonials & Reviews"
                          className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[90px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan resize-y"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Pricing & Potential Upsell Proposal Lines */}
                {(() => {
                  const phases = getProjectPhases(editingClientProject);
                  const activePhaseId = phases.some(p => p.id === adminPricingActiveTab) ? adminPricingActiveTab : 'primary';
                  const activePhase = phases.find(p => p.id === activePhaseId) || phases[0];

                  const lines = activePhase.budgetLines || [];
                  const customServices = activePhase.customServices || [];

                  const baseSubtotal = lines.reduce((acc, line) => {
                    return acc + (Number(line.cost) || 0);
                  }, 0);

                  const customSubtotal = customServices.reduce((acc, item) => {
                    return acc + (Number(item.cost) || 0);
                  }, 0);

                  const subtotalVal = baseSubtotal + customSubtotal;

                  const discPct = Number(activePhase.discountPercent || "0") || 0;
                  const discountAmtVal = (subtotalVal * discPct) / 100;
                  const taxableBaseVal = Math.max(0, subtotalVal - discountAmtVal);
                  
                  const applyVat = activePhase.applyVat;
                  const vatPct = applyVat 
                    ? (Number(activePhase.vatPercent !== undefined ? activePhase.vatPercent : "23") || 0) 
                    : 0;
                  const vatAmtVal = (taxableBaseVal * vatPct) / 100;
                  const grandTotalVal = taxableBaseVal + vatAmtVal;

                  return (
                    <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 mt-8 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-6">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xl font-normal">💶</span>
                          <h3 className="text-xl font-bold uppercase tracking-tight text-white mr-2">
                            Pricing Model & Optional Add-ons
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              setAdminEstimatorMode(activePhaseId);
                              setShowAdminEstimatorModal(true);
                            }}
                            className="bg-[#0c1417] hover:bg-white/[0.03] text-white border border-white/5 font-black uppercase tracking-widest text-[9px] px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Calculator className={`w-3.5 h-3.5 ${activePhaseId === 'secondary' ? 'text-zarco-purple' : activePhaseId === 'primary' ? 'text-zarco-cyan' : 'text-zarco-purple'}`} />
                            {`${activePhase.title} Estimator`}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleGenerateInvoiceFromProject(editingClientProject, activePhaseId)}
                            className="bg-[#0c1417] hover:bg-white/[0.03] text-white border border-white/5 font-black uppercase tracking-widest text-[9px] px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Receipt className={`w-3.5 h-3.5 ${activePhaseId === 'secondary' ? 'text-zarco-purple' : 'text-zarco-cyan'}`} />
                            Generate Invoice
                          </Button>
                          {activePhaseId !== 'primary' && (
                            <Button
                              type="button"
                              onClick={() => {
                                let updated = { ...editingClientProject };
                                if (activePhaseId === 'secondary') {
                                  updated.hasSecondaryPhase = false;
                                  updated.secondaryBudgetLines = [];
                                  updated.secondaryCustomServices = [];
                                  updated.secondaryDiscountPercent = "0";
                                  updated.secondaryApplyVat = true;
                                  updated.secondaryVatPercent = "23";
                                  updated.secondaryPaidStatus = "Pending";
                                  updated.secondaryPrice = "";
                                } else if (activePhaseId.startsWith('phase_')) {
                                  const idx = parseInt(activePhaseId.split('_')[1], 10);
                                  const addPhases = [...(updated.additionalPhases || [])];
                                  addPhases.splice(idx, 1);
                                  updated.additionalPhases = addPhases;
                                }
                                setEditingClientProject(updated);
                                setAdminPricingActiveTab('primary');
                              }}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-black uppercase tracking-widest text-[9px] px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Phase
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Pricing Phase Management & Selector */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 mb-6 gap-4">
                        {phases.length > 2 ? (
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1 mb-2 sm:mb-0">Select Phase:</span>
                            <div className="relative">
                              <select
                                value={adminPricingActiveTab}
                                onChange={(e) => setAdminPricingActiveTab(e.target.value)}
                                className="appearance-none bg-[#080d0f] border border-white/10 text-white rounded-xl py-2 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-zarco-cyan cursor-pointer w-[130px]"
                              >
                                {phases.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.title}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 w-3.5 h-3.5" />
                            </div>
                          </div>
                        ) : phases.length === 2 ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setAdminPricingActiveTab('primary')}
                              className={`px-4 py-3 font-black uppercase tracking-widest text-[9px] border-b-2 transition-all cursor-pointer ${
                                adminPricingActiveTab === 'primary'
                                  ? 'border-zarco-cyan text-zarco-cyan bg-white/[0.01]'
                                  : 'border-transparent text-white/40 hover:text-white/70'
                              }`}
                            >
                              Phase 1
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdminPricingActiveTab('secondary')}
                              className={`px-4 py-3 font-black uppercase tracking-widest text-[9px] border-b-2 transition-all cursor-pointer ${
                                adminPricingActiveTab === 'secondary'
                                  ? 'border-zarco-purple text-zarco-purple bg-white/[0.01]'
                                  : 'border-transparent text-white/40 hover:text-white/70'
                              }`}
                            >
                              Phase 2
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] font-black uppercase text-white/40 tracking-wider">
                            Phase 1 Active
                          </div>
                        )}

                        {/* Add Phase Action Button */}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              if (phases.length === 1) {
                                const updated = {
                                  ...editingClientProject,
                                  hasSecondaryPhase: true,
                                  secondaryBudgetLines: [],
                                  secondaryCustomServices: [],
                                  secondaryDiscountPercent: "0",
                                  secondaryApplyVat: true,
                                  secondaryVatPercent: "23",
                                  secondaryPaidStatus: "Pending"
                                };
                                setEditingClientProject(updated);
                                setAdminPricingActiveTab('secondary');
                              } else {
                                const nextPhaseNum = phases.length + 1;
                                const newPhaseObj = {
                                  title: `Phase ${nextPhaseNum}`,
                                  budgetLines: [],
                                  customServices: [],
                                  discountPercent: "0",
                                  applyVat: true,
                                  vatPercent: "23",
                                  paidStatus: "Pending",
                                  price: ""
                                };
                                const updatedPhases = [...(editingClientProject.additionalPhases || []), newPhaseObj];
                                const updated = {
                                  ...editingClientProject,
                                  additionalPhases: updatedPhases
                                };
                                setEditingClientProject(updated);
                                setAdminPricingActiveTab(`phase_${updatedPhases.length - 1}`);
                              }
                            }}
                            className="bg-[#0c1417] hover:bg-white/[0.03] text-white border border-white/10 font-black uppercase tracking-widest text-[8px] sm:text-[9px] px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-zarco-cyan" />
                            {phases.length === 1 ? 'Add Other Phases' : 'Add Another Phase'}
                          </Button>
                        </div>
                      </div>

                      {/* Active Phase Billing Status selection */}
                      <div className="bg-[#0c1417]/20 border border-white/[0.04] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="text-left">
                          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest block leading-none ${activePhaseId === 'primary' ? 'text-[#4fd1dc]' : activePhaseId === 'secondary' ? 'text-zarco-purple' : 'text-zarco-cyan'}`}>
                            {activePhase.title} Billing Status
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-white/30 uppercase tracking-widest block mt-1.5 leading-none font-medium">
                            Manually designate collection state for {activePhase.title} services
                          </span>
                        </div>
                        <div className="relative shrink-0">
                          <select
                            value={activePhase.paidStatus || "Pending"}
                            onChange={(e) => {
                              const updatedProj = updateProjectPhase(editingClientProject, activePhaseId, { paidStatus: e.target.value as any });
                              setEditingClientProject(updatedProj);
                            }}
                            className={`appearance-none bg-[#080d0f] border border-white/10 text-white rounded-full py-2.5 pl-5 pr-10 text-[9px] font-black uppercase tracking-widest focus:outline-none cursor-pointer w-full sm:w-[170px] ${
                              activePhaseId === 'primary' ? 'focus:border-zarco-cyan' : activePhaseId === 'secondary' ? 'focus:border-zarco-purple' : 'focus:border-zarco-cyan'
                            }`}
                          >
                            <option value="Pending" className="bg-[#080d0f]">Pending</option>
                            <option value="Deposit" className="bg-[#080d0f]">Deposit Received</option>
                            <option value="Paid" className="bg-[#080d0f]">Paid In Full</option>
                            <option value="Proposal" className="bg-[#080d0f]">Proposal Only</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-[50%] -translate-y-[50%] pointer-events-none text-white/50 w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Standard Deliverables list */}
                        {lines.length > 0 && (
                          <div className="space-y-3 text-left animate-fade-in">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4fd1dc]/80">
                              Standard Deliverables ({lines.length})
                            </h4>
                            <div className="space-y-3">
                              {lines.map((line, idx) => (
                                <div key={`dl-${idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0c1417]/40 rounded-2xl border border-white/5 text-left">
                                  <div className="space-y-1 text-left">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold uppercase tracking-wider text-sm text-white">
                                        {line.item}
                                      </span>
                                      {line.isOptional ? (
                                        <span className="px-2.5 py-0.5 bg-zarco-purple/20 text-zarco-purple border border-zarco-purple/30 text-[9px] font-black uppercase tracking-wider rounded-md">
                                          Optional Add-on
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-0.5 bg-zarco-cyan/10 text-zarco-cyan text-[9px] font-black uppercase tracking-wider rounded-md border border-zarco-cyan/25">
                                          Base Scope
                                        </span>
                                      )}
                                    </div>
                                    {line.description && (
                                      <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
                                        {line.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right font-black font-mono text-base text-white whitespace-nowrap">
                                    {line.cost !== '—' && line.cost !== '0' && line.cost !== ''
                                      ? `€${Number(line.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                      : '—'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Custom Services listing if any added */}
                        {customServices.length > 0 && (
                          <div className="space-y-3 pt-2 text-left animate-fade-in">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zarco-cyan">
                              Custom services & bespoke options ({customServices.length})
                            </h4>
                            <div className="space-y-3 font-medium">
                              {customServices.map((item, idx) => (
                                <div key={`cs-${item.id || idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zarco-cyan/[0.02] rounded-2xl border border-zarco-cyan/20 text-left">
                                  <div className="space-y-1 text-left">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold uppercase tracking-wider text-sm text-white flex items-center gap-1.5">
                                        <span className="text-zarco-cyan">✨</span>
                                        {item.item}
                                      </span>
                                      {item.isOptional ? (
                                        <span className="px-2.5 py-0.5 bg-zarco-purple/20 text-zarco-purple border border-zarco-purple/30 text-[9px] font-black uppercase tracking-wider rounded-md">
                                          Optional Add-on
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-0.5 bg-zarco-cyan/10 text-zarco-cyan text-[9px] font-black uppercase tracking-wider rounded-md border border-zarco-cyan/25">
                                          Base Scope
                                        </span>
                                      )}
                                    </div>
                                    {((item.quantity && item.quantity >= 1) || (item.hours && item.hours > 0)) && (
                                      <div className="flex items-center gap-2 mt-1 text-[10px] text-white/50 font-mono font-bold">
                                        {item.quantity && item.quantity >= 1 && (
                                          <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/70">Qty: {item.quantity}</span>
                                        )}
                                        {item.hours && item.hours > 0 && (
                                          <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/70">Hours: {item.hours}</span>
                                        )}
                                        {item.unitPrice !== undefined && (
                                          <span className="text-white/30">@ €{item.unitPrice}/unit</span>
                                        )}
                                      </div>
                                    )}
                                    {item.description && (
                                      <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right font-black font-mono text-base text-zarco-cyan whitespace-nowrap">
                                    €{Number(item.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {lines.length === 0 && customServices.length === 0 && (
                          <div className="py-8 text-center text-white/30 border border-dashed border-white/5 rounded-2xl text-xs uppercase font-bold tracking-wider">
                            No services configured yet. Use the Interactive Estimator above to configure line items.
                          </div>
                        )}

                        {/* Detailed financial breakdown summary */}
                        <div className="mt-8 pt-6 border-t border-white/5 space-y-3 select-all max-w-md ml-auto">
                          <div className="flex justify-between items-center text-xs text-white/40">
                            <span className="uppercase tracking-widest text-[9px] font-black">Gross Subtotal:</span>
                            <span className="font-mono font-bold text-white text-sm">
                              €{subtotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          {discountAmtVal > 0 && (
                            <div className="flex justify-between items-center text-xs text-green-400">
                              <span className="uppercase tracking-widest text-[9px] font-black">Promo Discount: ({discPct}%)</span>
                              <span className="font-mono font-black">
                                -€{discountAmtVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}

                          {discountAmtVal > 0 && (
                            <div className="flex justify-between items-center text-xs text-white/40 border-t border-white/5 pt-3">
                              <span className="uppercase tracking-widest text-[9px] font-black">Taxable Base:</span>
                              <span className="font-mono font-bold">
                                €{taxableBaseVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}

                          {applyVat && vatAmtVal > 0 && (
                            <div className="flex justify-between items-center text-xs text-zarco-purple">
                              <span className="uppercase tracking-widest text-[9px] font-black">Sales VAT: ({vatPct}%)</span>
                              <span className="font-mono font-black">
                                +€{vatAmtVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-xs pt-4 border-t border-white/10">
                            <span className="uppercase tracking-widest text-[10px] font-black text-[#4fd1dc]">Estimated Grand Total:</span>
                            <span className="text-2xl font-black text-[#4fd1dc] font-sans tracking-tight">
                              €{grandTotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })()}

                {/* Testing & QA Option */}
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 mt-8">
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🧪</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        Testing & Improvements Options
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 max-w-2xl">
                    {/* Manual Testing Option */}
                    <div className="bg-[#0c1417]/50 p-6 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="hasManualTesting"
                          checked={editingClientProject.hasManualTesting || false}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              hasManualTesting: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded text-zarco-cyan bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-cyan cursor-pointer"
                        />
                        <label htmlFor="hasManualTesting" className="text-xs font-black text-white uppercase tracking-wider select-none cursor-pointer">
                          1. Manual Testing Done
                        </label>
                      </div>

                      {editingClientProject.hasManualTesting && (
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block font-bold">
                            Testing Page / Dashboard URL (opens target="_blank")
                          </label>
                          <Input
                            type="url"
                            value={editingClientProject.manualTestingUrl || ""}
                            onChange={(e) =>
                              setEditingClientProject({
                                ...editingClientProject,
                                manualTestingUrl: e.target.value,
                              })
                            }
                            placeholder="e.g. https://test.zarco.studio/interactive-test"
                            className="bg-[#0c1417] border-[#ffffff15] h-12 text-sm text-white w-full font-bold focus:border-zarco-cyan"
                          />
                        </div>
                      )}
                    </div>

                    {/* Automated Testing Option */}
                    <div className="bg-[#0c1417]/50 p-6 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="hasAutomatedTesting"
                          checked={editingClientProject.hasAutomatedTesting || false}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              hasAutomatedTesting: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded text-zarco-cyan bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-cyan cursor-pointer"
                        />
                        <label htmlFor="hasAutomatedTesting" className="text-xs font-black text-white uppercase tracking-wider select-none cursor-pointer">
                          2. Automated Testing Standard
                        </label>
                      </div>

                      {editingClientProject.hasAutomatedTesting && (
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block font-bold">
                            Automated Testing URL (opens target="_blank")
                          </label>
                          <Input
                            type="url"
                            value={editingClientProject.automatedTestingUrl || ""}
                            onChange={(e) =>
                              setEditingClientProject({
                                ...editingClientProject,
                                automatedTestingUrl: e.target.value,
                              })
                            }
                            placeholder="e.g. https://github.com/zarco-studio/app/actions"
                            className="bg-[#0c1417] border-[#ffffff15] h-12 text-sm text-white w-full font-bold focus:border-zarco-cyan"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Terms and Conditions Card */}
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 mt-8">
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📜</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        Terms & Conditions – Web Development Services
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block font-bold">
                          Terms Document Title
                        </label>
                        <Input
                          type="text"
                          value={editingClientProject.termsSubtitle || ""}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              termsSubtitle: e.target.value,
                            })
                          }
                          placeholder="e.g. Terms & Conditions / Condições Gerais"
                          className="bg-[#0c1417] border-[#ffffff15] h-12 text-sm text-white w-full font-bold focus:border-zarco-cyan"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block font-bold">
                          Terms Document URL (PDF/Link)
                        </label>
                        <Input
                          type="url"
                          value={editingClientProject.termsUrl || ""}
                          onChange={(e) =>
                            setEditingClientProject({
                              ...editingClientProject,
                              termsUrl: e.target.value,
                            })
                          }
                          placeholder="e.g. https://zarco.studio/terms.pdf"
                          className="bg-[#0c1417] border-[#ffffff15] h-12 text-sm text-white w-full font-bold focus:border-zarco-cyan"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block font-bold">
                        Terms Summary / Small Print Description
                      </label>
                      <textarea
                        value={editingClientProject.termsDescription || ""}
                        onChange={(e) =>
                          setEditingClientProject({
                            ...editingClientProject,
                            termsDescription: e.target.value,
                          })
                        }
                        placeholder="e.g. By choosing and proceeding with the proposal, the client accepts the Terms & Conditions of Web Development Services..."
                        className="bg-[#0c1417] border-[#ffffff15] text-sm text-white w-full min-h-[100px] p-4 rounded-xl font-medium focus:border-zarco-cyan focus:outline-none"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        ) : view === "clients-form" && editingClient ? (
          <form onSubmit={handleSaveClient} className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                  {editingClient.id.startsWith("client-temp-")
                    ? "👤 Onboard Client"
                    : "👤 Manage Profile"}
                </h2>
                <p className="text-white/40 text-sm italic uppercase tracking-widest">
                  Building a complete business identity for bespoke
                  collaboration.
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setView("clients-list")}
                  variant="outline"
                  className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={savingClient}
                  className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
                >
                  {savingClient ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Complete Profile"
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Identity & Business Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">🧠</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Identity
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Full Name
                      </label>
                      <Input
                        required
                        value={editingClient.fullName || ""}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="Johnathan Doe"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Company Name
                      </label>
                      <Input
                        required
                        value={editingClient.companyName || ""}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            companyName: e.target.value,
                          })
                        }
                        placeholder="Neo Vision Ltd."
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">🏢</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Business Info
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Business Type
                        </label>
                        <div className="relative">
                          <select
                            value={editingClient.businessType}
                            onChange={(e) =>
                              setEditingClient({
                                ...editingClient,
                                businessType: e.target.value,
                              })
                            }
                            className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                          >
                            <option value="">Select Type</option>
                            {BUSINESS_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Industry / Niche
                        </label>
                        <div className="relative">
                          <select
                            value={editingClient.industry}
                            onChange={(e) =>
                              setEditingClient({
                                ...editingClient,
                                industry: e.target.value,
                              })
                            }
                            className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                          >
                            <option value="">Select Industry</option>
                            {INDUSTRIES.map((i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        VAT Number / Tax ID
                      </label>
                      <Input
                        value={editingClient.vatNumber}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            vatNumber: e.target.value,
                          })
                        }
                        placeholder="e.g. GB 123456789"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Short Business Description
                      </label>
                      <textarea
                        value={editingClient.description}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            description: e.target.value,
                          })
                        }
                        placeholder="What does the business do?"
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[100px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan resize-none"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Online Presence */}
              <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                  <span className="text-xl">🌐</span>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                    Online Presence
                  </h3>
                </div>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Current Website URL
                    </label>
                    <Input
                      value={editingClient.websiteUrl}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          websiteUrl: e.target.value,
                        })
                      }
                      placeholder="https://www.neovision.com"
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                    />
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Instagram
                      </label>
                      <Input
                        value={editingClient.instagramUrl}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            instagramUrl: e.target.value,
                          })
                        }
                        placeholder="@neovision"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Facebook
                      </label>
                      <Input
                        value={editingClient.facebookUrl}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            facebookUrl: e.target.value,
                          })
                        }
                        className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        LinkedIn
                      </label>
                      <Input
                        value={editingClient.linkedinUrl}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            linkedinUrl: e.target.value,
                          })
                        }
                        className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        TikTok
                      </label>
                      <Input
                        value={editingClient.tiktokUrl}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            tiktokUrl: e.target.value,
                          })
                        }
                        placeholder="Optional"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-12"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact & Location */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">📞</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Contact
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Email Address
                      </label>
                      <Input
                        required
                        type="email"
                        value={editingClient.email}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            email: e.target.value,
                          })
                        }
                        placeholder="hello@neovision.com"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Phone Number
                        </label>
                        <Input
                          value={editingClient.phone}
                          onChange={(e) =>
                            setEditingClient({
                              ...editingClient,
                              phone: e.target.value,
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          WhatsApp
                        </label>
                        <Input
                          value={editingClient.whatsapp}
                          onChange={(e) =>
                            setEditingClient({
                              ...editingClient,
                              whatsapp: e.target.value,
                            })
                          }
                          placeholder="Optional"
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Other Contact Info
                      </label>
                      <textarea
                        value={editingClient.otherContact}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            otherContact: e.target.value,
                          })
                        }
                        placeholder="Alternative emails, Skype, Telegram, etc..."
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[80px] text-sm text-white/70 focus:outline-none focus:border-zarco-cyan resize-none"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">📍</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Address
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Street Address
                      </label>
                      <Input
                        value={editingClient.streetAddress}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            streetAddress: e.target.value,
                          })
                        }
                        placeholder="Main street or line 1"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Address Line 2
                      </label>
                      <Input
                        value={editingClient.addressLine2}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            addressLine2: e.target.value,
                          })
                        }
                        placeholder="Suite, apartment, etc."
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Zip Code
                        </label>
                        <Input
                          value={editingClient.zipCode}
                          onChange={(e) =>
                            setEditingClient({
                              ...editingClient,
                              zipCode: e.target.value,
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          City
                        </label>
                        <Input
                          value={editingClient.city}
                          onChange={(e) =>
                            setEditingClient({
                              ...editingClient,
                              city: e.target.value,
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Country
                        </label>
                        <Input
                          value={editingClient.country}
                          onChange={(e) =>
                            setEditingClient({
                              ...editingClient,
                              country: e.target.value,
                            })
                          }
                          className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        ) : view === "billing-summary" ? (
          <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                  Financial Analytics
                </h2>
                <p className="text-white/40 text-sm italic uppercase tracking-widest">
                  Revenue breakdown by month and year.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Year</label>
                  <select 
                    value={analyticsYear}
                    onChange={(e) => setAnalyticsYear(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-white/60 focus:outline-none focus:border-zarco-cyan h-12"
                  >
                    {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Month</label>
                  <select 
                    value={analyticsMonth}
                    onChange={(e) => setAnalyticsMonth(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-white/60 focus:outline-none focus:border-zarco-cyan h-12"
                  >
                    <option value="All">ALL MONTHS</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <option key={m} value={m}>{m.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Type</label>
                  <select 
                    value={billingTypeFilter}
                    onChange={(e) => setBillingTypeFilter(e.target.value as any)}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-zarco-cyan focus:outline-none focus:border-zarco-cyan h-12"
                  >
                    <option value="all">ALL PAYMENTS</option>
                    <option value="project">PROJECT PAYMENTS</option>
                    <option value="subscription">SUBSCRIPTIONS</option>
                  </select>
                </div>
                <Button
                  onClick={() => setView("billing-list")}
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white/60 font-bold uppercase tracking-widest text-[10px] rounded-xl px-8 h-12 hover:bg-white/10 self-end"
                >
                  Detailed List
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
              <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 border-l-4 border-l-zarco-cyan">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
                  Gross Revenue
                </p>
                <h3 className="text-2xl font-black text-zarco-cyan uppercase">
                  € {filteredAnalyticsInvoices.reduce((sum, inv) => sum + (normalizeStatus(inv.status) === 'PAID' ? inv.amount : 0), 0).toLocaleString()}
                </h3>
                <p className="text-[10px] text-white/40 mt-2 uppercase tracking-tight italic">
                  Total Paid
                </p>
              </Card>
              <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
                  Net Revenue (Tax Off)
                </p>
                <h3 className="text-2xl font-black text-white uppercase">
                  € {filteredAnalyticsInvoices.reduce((sum, inv) => sum + (normalizeStatus(inv.status) === 'PAID' ? (inv.amount - (inv.vatAmount || 0)) : 0), 0).toLocaleString()}
                </h3>
                <p className="text-[10px] text-white/40 mt-2 uppercase tracking-tight italic">
                  Earnings after tax
                </p>
              </Card>
              <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 border-l-4 border-l-purple-500/50">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
                  Tax Collected
                </p>
                <h3 className="text-2xl font-black text-white uppercase">
                  € {filteredAnalyticsInvoices.reduce((sum, inv) => sum + (normalizeStatus(inv.status) === 'PAID' ? (inv.vatAmount || 0) : 0), 0).toLocaleString()}
                </h3>
                <p className="text-[10px] text-white/40 mt-2 uppercase tracking-tight italic">
                   Total VAT share
                </p>
              </Card>
              <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
                  Pending Assets
                </p>
                <h3 className="text-3xl font-black text-white uppercase">
                  € {filteredAnalyticsInvoices.reduce((sum, inv) => {
                    const s = normalizeStatus(inv.status);
                    return sum + (s !== 'PAID' && s !== 'VOID' ? inv.amount : 0);
                  }, 0).toLocaleString()}
                </h3>
                <p className="text-[10px] text-white/40 mt-2 uppercase tracking-tight italic">
                  Awaiting settlement
                </p>
              </Card>
              <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
                  Invoiced Count
                </p>
                <h3 className="text-3xl font-black text-white uppercase">
                  {filteredAnalyticsInvoices.length}
                </h3>
                <p className="text-[10px] text-white/40 mt-2 uppercase tracking-tight italic">
                  Total documents
                </p>
              </Card>
            </div>

            <div className="space-y-12">
              {Object.entries(
                filteredAnalyticsInvoices
                  .reduce((acc, inv) => {
                    const date = new Date(inv.issueDate);
                    const month = date.toLocaleString('en-US', { month: 'long' });
                    const year = date.getFullYear();
                    const key = `${month} ${year}`;
                    if (!acc[key]) acc[key] = { invoices: [], total: 0 };
                    acc[key].invoices.push(inv);
                    acc[key].total += inv.amount;
                    return acc;
                  }, {} as Record<string, { invoices: any[], total: number }>)
              )
              .sort(([ak], [bk]) => {
                const dateA = new Date(ak);
                const dateB = new Date(bk);
                return dateB.getTime() - dateA.getTime();
              })
              .map(([monthYear, data]: [string, any]) => (
                <div key={monthYear} className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white/60">
                      {monthYear}
                    </h3>
                    <div className="h-px flex-1 bg-white/5" />
                    <p className="text-[11px] font-bold text-zarco-cyan tracking-widest">
                      MONTHLY TOTAL: € {(data as any).total.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {(data as any).invoices.map((invoice: any) => {
                      const client = clients.find(c => c.id === invoice.clientId);
                      return (
                        <div 
                          key={invoice.id}
                          className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex justify-between items-center group hover:bg-white/[0.04] transition-all cursor-pointer"
                          onClick={() => {
                            setEditingInvoice(invoice);
                            setView("billing-form");
                          }}
                        >
                          <div className="flex gap-8 items-center">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-bold text-zarco-cyan">
                              {invoice.invoiceNumber.split('-').pop()}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
                                {client?.companyName || client?.fullName || "Client"}
                              </p>
                              <h4 className="text-sm font-bold text-white group-hover:text-zarco-cyan transition-colors">
                                {invoice.invoiceNumber}
                              </h4>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5">
                            <p className="text-xs font-bold text-white mb-0 text-right">
                              {invoice.currency} {invoice.amount.toLocaleString()}
                            </p>
                            {invoice.vatAmount > 0 && (
                              <p className="text-[9px] font-bold text-purple-400/60 uppercase tracking-widest mb-0 text-right">
                                Tax: {invoice.currency} {invoice.vatAmount.toLocaleString()}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              {invoice.isSubscription && (() => {
                                const ptMonthMap: Record<string, string> = {
                                  "January": "Janeiro",
                                  "February": "Fevereiro",
                                  "March": "Março",
                                  "April": "Abril",
                                  "May": "Maio",
                                  "June": "Junho",
                                  "July": "Julho",
                                  "August": "Agosto",
                                  "September": "Setembro",
                                  "October": "Outubro",
                                  "November": "Novembro",
                                  "December": "Dezembro"
                                };
                                const rawMonth = invoice.subscriptionMonth || (invoice.issueDate ? new Date(invoice.issueDate + 'T12:00:00').toLocaleString('en-US', { month: 'long' }) : new Date().toLocaleString('en-US', { month: 'long' }));
                                const ptMonthName = ptMonthMap[rawMonth] || rawMonth;
                                const displayMonth = rawMonth === ptMonthName ? rawMonth : `${rawMonth} / ${ptMonthName}`;
                                return (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-zarco-cyan/15 text-zarco-cyan border border-zarco-cyan/25 flex items-center gap-1 animate-fade-in">
                                    <span>💳</span>
                                    Subscription • {displayMonth}
                                  </span>
                                );
                              })()}
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                normalizeStatus(invoice.status) === 'PAID' ? 'bg-green-500/20 text-green-400' : 
                                normalizeStatus(invoice.status) === 'UNPAID' ? 'bg-orange-500/20 text-orange-400' :
                                normalizeStatus(invoice.status) === 'VOID' ? 'bg-red-500/20 text-red-400' :
                                normalizeStatus(invoice.status) === 'PENDING' ? 'bg-cyan-500/20 text-cyan-400' :
                                normalizeStatus(invoice.status) === 'DUPLICATE' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-white/10 text-white/40'
                              }`}>
                                {normalizeStatus(invoice.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : view === "billing-list" ? (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                  Financial Oversight
                </h2>
                <p className="text-white/40 text-sm italic uppercase tracking-widest">
                  Manage billables, track payments, and maintain cash flow.
                </p>
              </div>
              <Button
                onClick={handleAddInvoice}
                className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none"
              >
                Create Invoice
              </Button>
            </div>

            {/* Admin Billing Search Bar & Filter Buttons */}
            {invoices.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8 animate-fade-in">
                <div className="relative max-w-md w-full">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={adminBillingSearch}
                    onChange={(e) => setAdminBillingSearch(e.target.value)}
                    placeholder="Search bills by year, company title..."
                    className="w-full h-11 pl-12 pr-10 bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-zarco-cyan/50 focus:bg-white/[0.04] transition-all rounded-2xl text-[11px] font-bold uppercase tracking-wider text-white placeholder-white/20 outline-none"
                  />
                  {adminBillingSearch && (
                    <button
                      onClick={() => setAdminBillingSearch('')}
                      className="absolute inset-y-0 right-4 flex items-center text-white/30 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center bg-[#080d0f] border border-white/5 p-1 rounded-xl self-start md:self-auto shrink-0">
                  <button
                    onClick={() => setBillingTypeFilter("all")}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      billingTypeFilter === "all"
                        ? "bg-zarco-cyan text-black"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    All Payments
                  </button>
                  <button
                    onClick={() => setBillingTypeFilter("project")}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      billingTypeFilter === "project"
                        ? "bg-zarco-cyan text-black"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => setBillingTypeFilter("subscription")}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      billingTypeFilter === "subscription"
                        ? "bg-zarco-cyan text-black"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Subscriptions
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {loadingInvoices ? (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                  <Loader2 className="w-12 h-12 text-zarco-cyan animate-spin mb-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 italic">
                    Loading financial data...
                  </h3>
                </div>
              ) : invoices.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                  <Receipt className="w-12 h-12 text-white/10 mb-6" />
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 mb-6">
                    No invoices generated
                  </h3>
                  <Button
                    onClick={handleAddInvoice}
                    className="bg-white/5 border border-white/10 text-white/60 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10"
                  >
                    Issue First Invoice
                  </Button>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="py-20 text-center border border-white/5 rounded-[2.5rem] bg-white/[0.01] flex flex-col items-center justify-center gap-4 animate-fade-in">
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">
                    No invoices match your search criteria.
                  </p>
                  <button
                    onClick={() => setAdminBillingSearch('')}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredInvoices.map((invoice) => {
                  const client = clients.find((c) => c.id === invoice.clientId);
                  const project = clientProjects.find((p) => p.id === invoice.projectId);
                  return (
                    <Card
                      key={invoice.id}
                      className="bg-[#0a1114] border-white/5 rounded-[2rem] p-8 group hover:border-zarco-cyan/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-10 flex-1">
                          <div className="flex flex-col min-w-[150px]">
                            <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest mb-1">
                              {invoice.invoiceNumber}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                  normalizeStatus(invoice.status) === "PAID"
                                    ? "bg-green-500/20 text-green-500"
                                    : normalizeStatus(invoice.status) === "UNPAID"
                                      ? "bg-orange-500/20 text-orange-400"
                                      : normalizeStatus(invoice.status) === "VOID"
                                        ? "bg-red-500/20 text-red-500"
                                        : normalizeStatus(invoice.status) === "PENDING"
                                          ? "bg-cyan-500/20 text-cyan-400"
                                          : normalizeStatus(invoice.status) === "DUPLICATE"
                                            ? "bg-purple-500/20 text-purple-400"
                                            : "bg-white/10 text-white/40"
                                }`}
                              >
                                {normalizeStatus(invoice.status)}
                              </span>
                              {invoice.isSubscription && (() => {
                                const ptMonthMap: Record<string, string> = {
                                  "January": "Janeiro",
                                  "February": "Fevereiro",
                                  "March": "Março",
                                  "April": "Abril",
                                  "May": "Maio",
                                  "June": "Junho",
                                  "July": "Julho",
                                  "August": "Agosto",
                                  "September": "Setembro",
                                  "October": "Outubro",
                                  "November": "Novembro",
                                  "December": "Dezembro"
                                };
                                const rawMonth = invoice.subscriptionMonth || (invoice.issueDate ? new Date(invoice.issueDate + 'T12:00:00').toLocaleString('en-US', { month: 'long' }) : new Date().toLocaleString('en-US', { month: 'long' }));
                                const ptMonthName = ptMonthMap[rawMonth] || rawMonth;
                                const displayMonth = rawMonth === ptMonthName ? rawMonth : `${rawMonth} / ${ptMonthName}`;
                                return (
                                  <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-zarco-cyan/15 text-zarco-cyan border border-zarco-cyan/25 flex items-center gap-1 animate-fade-in">
                                    <span>💳</span>
                                    Subscription • {displayMonth}
                                  </span>
                                );
                              })()}
                            </div>
                            <h3 className="text-xl font-black text-white/80">
                              {invoice.currency} {(invoice.amount || 0).toLocaleString()}
                            </h3>
                          </div>
                          
                          <div className="h-16 w-px bg-white/5" />
                          
                          <div className="flex flex-col min-w-[200px]">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                              Recipient
                            </span>
                            <span className="text-sm font-black text-white uppercase">
                              {client?.companyName || "N/A"}
                            </span>
                            <span className="text-xs text-white/40">
                              {client?.fullName || "Private Client"}
                            </span>
                          </div>

                          <div className="h-16 w-px bg-white/5" />

                          <div className="flex flex-col min-w-[150px]">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                              Context
                            </span>
                            <span className="text-xs font-bold text-white/60 uppercase">
                              {project?.projectName || "Manual Service"}
                            </span>
                          </div>

                          <div className="h-16 w-px bg-white/5" />

                          <div className="flex flex-col min-w-[150px]">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                              Dates
                            </span>
                            <span className="text-[11px] text-white/40">
                              Issued: {invoice.issueDate}
                            </span>
                            <span className={`text-[11px] font-bold ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'Paid' ? 'text-red-500' : 'text-white/40'}`}>
                              Due: {invoice.dueDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3 items-center">
                          {invoiceConfirmingDelete === invoice.id ? (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                              <Button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteInvoice(invoice.id);
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
                                  setInvoiceConfirmingDelete(null);
                                }}
                                className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 h-10 rounded-xl transition-all"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditInvoice(invoice)}
                                className="text-white/20 hover:text-zarco-cyan hover:bg-zarco-cyan/10"
                              >
                                <Settings className="w-5 h-5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInvoiceConfirmingDelete(invoice.id);
                                }}
                                className="text-white/20 hover:text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ) : view === "billing-form" && editingInvoice ? (
          <form onSubmit={handleSaveInvoice} className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                  {editingInvoice.id.startsWith("invoice-temp-")
                    ? "Generate Invoice"
                    : "Edit Invoice"}
                </h2>
                <p className="text-white/40 text-sm italic uppercase tracking-widest">
                  Configure financial requests and payment terms.
                </p>
              </div>
              <div className="flex items-end gap-4">
                {!editingInvoice.id.startsWith("invoice-temp-") && (
                  <>
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">PDF Stamp</label>
                      <select 
                        value={pdfStates[editingInvoice.id] !== undefined
                          ? pdfStates[editingInvoice.id]
                          : (() => {
                              const invStatus = (editingInvoice.status || "").toUpperCase();
                              if (invStatus === "PAID") return "PAID";
                              if (invStatus === "OVERDUE") return "UNPAID";
                              if (invStatus === "SENT" || invStatus === "DRAFT") return "PENDING";
                              if (invStatus === "CANCELLED") return "VOID";
                              return "";
                            })()
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setPdfStates({...pdfStates, [editingInvoice.id]: val});
                          
                          // Sync back to invoice status
                          let nextStatus = editingInvoice.status;
                          if (val === "PAID") nextStatus = "Paid";
                          else if (val === "UNPAID") nextStatus = "Overdue";
                          else if (val === "PENDING") nextStatus = "Sent";
                          else if (val === "VOID") nextStatus = "Cancelled";
                          
                          setEditingInvoice({
                            ...editingInvoice,
                            status: nextStatus
                          });
                        }}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white/60 focus:outline-none focus:border-zarco-cyan"
                      >
                        <option value="">NONE</option>
                        <option value="PAID">PAID</option>
                        <option value="UNPAID">UNPAID</option>
                        <option value="PENDING">PENDING</option>
                        <option value="DUPLICATE">DUPLICATE</option>
                        <option value="VOID">VOID</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[100px]">
                      <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Language</label>
                      <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => setPdfLangs({...pdfLangs, [editingInvoice.id]: 'en'})}
                          className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                            (pdfLangs[editingInvoice.id] || 'en') === 'en' 
                              ? 'bg-zarco-cyan text-black' 
                              : 'text-white/40 hover:text-white/60'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          onClick={() => setPdfLangs({...pdfLangs, [editingInvoice.id]: 'pt'})}
                          className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                            pdfLangs[editingInvoice.id] === 'pt' 
                              ? 'bg-zarco-cyan text-black' 
                              : 'text-white/40 hover:text-white/60'
                          }`}
                        >
                          PT
                        </button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleGeneratePDF(editingInvoice)}
                      variant="outline"
                      className="bg-white/5 border-white/10 text-zarco-cyan font-bold uppercase tracking-widest text-[11px] rounded-xl px-8 py-6 hover:bg-zarco-cyan/10 transition-all h-[46px]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  onClick={() => setView("billing-list")}
                  variant="outline"
                  className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5 h-[46px]"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={savingInvoice}
                  className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)] h-[46px]"
                >
                  {savingInvoice ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save & Issue"
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Top Section: Context & Compliance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sender Information Preview */}
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 h-full">
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏢</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        Sender Info
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setView("settings")}
                      className="text-[9px] font-black uppercase tracking-widest text-zarco-cyan hover:bg-zarco-cyan/10"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-6 opacity-60">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Legal Name</p>
                      <p className="text-xs font-bold text-white">{companySettings.companyName || "Not Set"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">VAT / Tax ID</p>
                      <p className="text-xs font-bold text-white">{companySettings.vatNumber || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Address</p>
                      <p className="text-[10px] text-white/70 leading-tight">
                        {companySettings.addressLine1}{companySettings.addressLine2 && `, ${companySettings.addressLine2}`}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Relational Data */}
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 h-full">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">🔗</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Relational Data
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Linked Client
                      </label>
                      <select
                        required
                        value={editingInvoice.clientId}
                        onChange={(e) => setEditingInvoice({ 
                          ...editingInvoice, 
                          clientId: e.target.value, 
                          showClientVat: true,
                          showClientName: true,
                          showClientCompany: true
                        })}
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                      >
                        <option value="">Select Client</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.companyName} ({c.fullName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {editingInvoice.clientId && (
                      <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Client Name</p>
                            <p className="text-xs font-bold text-white">
                              {clients.find(c => c.id === editingInvoice.clientId)?.fullName || clients.find(c => c.id === editingInvoice.clientId)?.companyName}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Show on PDF</span>
                            <input 
                              type="checkbox"
                              checked={editingInvoice.showClientName !== false}
                              onChange={(e) => setEditingInvoice({...editingInvoice, showClientName: e.target.checked})}
                              className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Company Name</p>
                            <p className="text-xs font-bold text-white">
                              {clients.find(c => c.id === editingInvoice.clientId)?.companyName || "No Company"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Show on PDF</span>
                            <input 
                              type="checkbox"
                              checked={editingInvoice.showClientCompany !== false}
                              onChange={(e) => setEditingInvoice({...editingInvoice, showClientCompany: e.target.checked})}
                              className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Client VAT / Tax ID</p>
                            <p className="text-xs font-bold text-white">
                              {clients.find(c => c.id === editingInvoice.clientId)?.vatNumber || "No VAT on profile"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Show on PDF</span>
                            <input 
                              type="checkbox"
                              checked={editingInvoice.showClientVat !== false}
                              onChange={(e) => setEditingInvoice({...editingInvoice, showClientVat: e.target.checked})}
                              className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Project (Optional)
                      </label>
                      <select
                        value={editingInvoice.projectId}
                        onChange={(e) => setEditingInvoice({ ...editingInvoice, projectId: e.target.value })}
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                      >
                        <option value="">Select Project</option>
                        {clientProjects
                          .filter((p) => !editingInvoice.clientId || p.clientId === editingInvoice.clientId)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.projectName}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Financial Guardrails & Total */}
                <Card className="bg-zarco-cyan/[0.02] border border-zarco-cyan/10 rounded-[2.5rem] p-10 flex flex-col justify-between h-full">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest">Financial Guardrails</h4>
                    </div>
                    
                    {/* VAT Control */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Apply VAT</label>
                        <input 
                          type="checkbox"
                          checked={editingInvoice.applyVat || false}
                          onChange={(e) => setEditingInvoice({...editingInvoice, applyVat: e.target.checked})}
                          className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                        />
                      </div>
                      {editingInvoice.applyVat && (
                        <div className="space-y-2">
                          <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">VAT Rate (%)</label>
                          <Input 
                            type="number"
                            value={editingInvoice.vatRate || 0}
                            onChange={(e) => setEditingInvoice({...editingInvoice, vatRate: Number(e.target.value)})}
                            className="bg-black/20 border-white/5 h-10 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Discount Control */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Discount</label>
                        <input 
                          type="checkbox"
                          checked={editingInvoice.applyDiscount || false}
                          onChange={(e) => setEditingInvoice({...editingInvoice, applyDiscount: e.target.checked})}
                          className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                        />
                      </div>
                      {editingInvoice.applyDiscount && (
                        <div className="space-y-2">
                          <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Discount Rate (%)</label>
                          <Input 
                            type="number"
                            value={editingInvoice.discountRate || 0}
                            onChange={(e) => setEditingInvoice({...editingInvoice, discountRate: Number(e.target.value)})}
                            className="bg-black/20 border-white/5 h-10 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Subscription Settings */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Is Subscription Bill</label>
                        <input 
                          type="checkbox"
                          checked={editingInvoice.isSubscription || false}
                          onChange={(e) => setEditingInvoice({...editingInvoice, isSubscription: e.target.checked})}
                          className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                        />
                      </div>
                      {editingInvoice.isSubscription && (
                        <div className="space-y-2 animate-fade-in">
                          <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Subscription Month</label>
                          <select
                            value={editingInvoice.subscriptionMonth || new Date().toLocaleString("en-US", { month: "long" })}
                            onChange={(e) => setEditingInvoice({...editingInvoice, subscriptionMonth: e.target.value})}
                            className="w-full rounded-xl border border-white/10 bg-[#080d0f] text-white h-10 px-3 text-xs focus:border-zarco-cyan focus:outline-none"
                          >
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => {
                              const ptMonthMapForOption: Record<string, string> = {
                                "January": "Janeiro",
                                "February": "Fevereiro",
                                "March": "Março",
                                "April": "Abril",
                                "May": "Maio",
                                "June": "Junho",
                                "July": "Julho",
                                "August": "Agosto",
                                "September": "Setembro",
                                "October": "Outubro",
                                "November": "Novembro",
                                "December": "Dezembro"
                              };
                              return (
                                <option key={m} value={m}>
                                  {m} / {ptMonthMapForOption[m]}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zarco-cyan/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-white/20">Subtotal</span>
                      <span className="text-white/60">{(editingInvoice.subtotal || 0).toLocaleString()} {editingInvoice.currency}</span>
                    </div>
                    {editingInvoice.applyDiscount && (
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-red-500/40">Discount ({editingInvoice.discountRate}%)</span>
                        <span className="text-red-500/60">-{(editingInvoice.discountAmount || 0).toLocaleString()} {editingInvoice.currency}</span>
                      </div>
                    )}
                    {editingInvoice.applyVat && (
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-white/20">VAT ({editingInvoice.vatRate}%)</span>
                        <span className="text-white/60">+{(editingInvoice.vatAmount || 0).toLocaleString()} {editingInvoice.currency}</span>
                      </div>
                    )}
                    <div className="pt-4 mt-2 border-t border-zarco-cyan/20">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">
                        Final Total
                      </label>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-zarco-cyan">
                          {(editingInvoice.amount || 0).toLocaleString()}
                        </span>
                        <span className="text-lg font-bold text-white/20 mb-1">{editingInvoice.currency}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-zarco-cyan/10">
                      <Button
                        type="button"
                        onClick={() => {
                          setPdfStates({ ...pdfStates, [editingInvoice.id]: "PAID" });
                          setEditingInvoice({ ...editingInvoice, status: 'PAID' });
                        }}
                        className={`font-black uppercase tracking-widest text-[9px] rounded-xl h-12 transition-all border-none ${
                          normalizeStatus(editingInvoice.status) === 'PAID' 
                            ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        Mark as Paid
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setPdfStates({ ...pdfStates, [editingInvoice.id]: "PENDING" });
                          setEditingInvoice({ ...editingInvoice, status: 'PENDING' });
                        }}
                        className={`font-black uppercase tracking-widest text-[9px] rounded-xl h-12 transition-all border-none ${
                          normalizeStatus(editingInvoice.status) === 'PENDING' 
                            ? 'bg-zarco-cyan text-black shadow-[0_0_15px_rgba(79,209,220,0.3)]' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        Mark Pending
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Bottom Section: Details (Full Width) */}
              <div className="space-y-8">
                {/* Details */}
                <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <span className="text-xl">📄</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                      Invoice Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          Invoice ID
                        </label>
                        <span className={`text-[8px] font-bold uppercase py-0.5 px-2 rounded-full border ${
                          companySettings.autoGenerateInvoices !== false 
                            ? "bg-zarco-cyan/10 text-zarco-cyan border-zarco-cyan/20" 
                            : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        }`}>
                          {companySettings.autoGenerateInvoices !== false ? "Locked (Auto)" : "Manual Edit"}
                        </span>
                      </div>
                      <div className="relative group">
                        <Input
                          required
                          disabled={companySettings.autoGenerateInvoices !== false}
                          value={editingInvoice.invoiceNumber}
                          placeholder={companySettings.autoGenerateInvoices !== false ? "Auto-generated" : "Enter manual ID (e.g. INV-001)"}
                          onChange={(e) =>
                            setEditingInvoice({
                              ...editingInvoice,
                              invoiceNumber: e.target.value,
                            })
                          }
                          className={`bg-[#0c1417] border-white/10 rounded-xl h-14 w-full transition-all ${
                            companySettings.autoGenerateInvoices !== false 
                              ? "opacity-60 cursor-not-allowed select-none pr-10" 
                              : "focus:border-zarco-cyan/50"
                          }`}
                        />
                        {companySettings.autoGenerateInvoices !== false && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                            <span className="text-[10px]">🔒</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Status
                      </label>
                      <select
                        value={normalizeStatus(editingInvoice.status)}
                        onChange={(e) => {
                          const newStatus = e.target.value as any;
                          const stampValue = newStatus === "DRAFT" ? "" : newStatus;
                          setPdfStates({ ...pdfStates, [editingInvoice.id]: stampValue });
                          setEditingInvoice({
                            ...editingInvoice,
                            status: newStatus,
                          });
                        }}
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm font-bold"
                      >
                        {["DRAFT", "PENDING", "PAID", "UNPAID", "DUPLICATE", "VOID"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Issue Date
                      </label>
                      <Input
                        type="date"
                        required
                        value={editingInvoice.issueDate}
                        onChange={(e) =>
                          setEditingInvoice({
                            ...editingInvoice,
                            issueDate: e.target.value,
                          })
                        }
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Due Date
                      </label>
                      <Input
                        type="date"
                        required
                        value={editingInvoice.dueDate}
                        onChange={(e) =>
                          setEditingInvoice({
                            ...editingInvoice,
                            dueDate: e.target.value,
                          })
                        }
                        className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-6 mb-8">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none ml-1 block">
                      Notes / Terms (Will display on PDF)
                    </label>
                    <textarea
                      value={editingInvoice.notes || ""}
                      onChange={(e) =>
                        setEditingInvoice({
                          ...editingInvoice,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Add any extra note, discount terms, or bank instruction to display on the invoice (e.g., Payment Terms: Net 30)"
                      rows={3}
                      className="w-full bg-[#0c1417] border border-white/10 rounded-[1.25rem] p-5 focus:outline-none focus:border-zarco-cyan/50 text-white/70 text-sm font-semibold transition-all placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Line Items & Deliverables
                      </label>
                      <Button
                        type="button"
                        onClick={() => {
                          const newItems = [
                            ...editingInvoice.items,
                            { description: "", details: "", quantity: 1, unitPrice: 0, total: 0 },
                          ];
                          setEditingInvoice({ ...editingInvoice, items: newItems });
                        }}
                        className="h-10 px-6 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        Add Deliverable
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {editingInvoice.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 items-start bg-[#0c1417] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="col-span-12 md:col-span-11 space-y-4">
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-12 md:col-span-6 space-y-2">
                                <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Service Item</label>
                                <Input
                                  value={item.description}
                                  onChange={(e) => {
                                    const newItems = [...editingInvoice.items];
                                    newItems[idx].description = e.target.value;
                                    setEditingInvoice({ ...editingInvoice, items: newItems });
                                  }}
                                  placeholder="e.g. UX Design & Prototyping"
                                  className="bg-black/20 border-white/5 h-12 text-sm"
                                />
                              </div>
                              <div className="col-span-12 md:col-span-6 space-y-2">
                                <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Detailed Description</label>
                                <Input
                                  value={item.details || ""}
                                  onChange={(e) => {
                                    const newItems = [...editingInvoice.items];
                                    newItems[idx].details = e.target.value;
                                    setEditingInvoice({ ...editingInvoice, items: newItems });
                                  }}
                                  placeholder="e.g. 3 Rounds of revisions included"
                                  className="bg-black/20 border-white/5 h-12 text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Quantity</label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newItems = [...editingInvoice.items];
                                    const qty = Number(e.target.value);
                                    newItems[idx].quantity = qty;
                                    newItems[idx].total = qty * newItems[idx].unitPrice;
                                    setEditingInvoice({ ...editingInvoice, items: newItems });
                                  }}
                                  className="bg-black/20 border-white/5 h-12 text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Unit Price ({editingInvoice.currency})</label>
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => {
                                    const newItems = [...editingInvoice.items];
                                    const price = Number(e.target.value);
                                    newItems[idx].unitPrice = price;
                                    newItems[idx].total = newItems[idx].quantity * price;
                                    setEditingInvoice({ ...editingInvoice, items: newItems });
                                  }}
                                  className="bg-black/20 border-white/5 h-12 text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Line Total</label>
                                <div className="h-12 flex items-center px-4 bg-white/5 rounded-xl text-zarco-cyan font-bold text-sm">
                                  {(item.total || 0).toLocaleString()} {editingInvoice.currency}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-12 md:col-span-1 flex justify-end pt-6">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                if (editingInvoice.items.length === 1) return;
                                const newItems = editingInvoice.items.filter((_, i) => i !== idx);
                                setEditingInvoice({ ...editingInvoice, items: newItems });
                              }}
                              className="h-12 w-12 p-0 text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        ) : null}
      </main>

      {showFeedbackModal && editingClientProject && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="bg-[#0a1114] border-white/5 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zarco-cyan/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-zarco-cyan" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                    Client Feedback Log
                  </h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-0.5">
                    {editingClientProject.projectName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="text-white/20 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {/* General Feedback block */}
              {editingClientProject.clientFeedback && editingClientProject.clientFeedback.trim() && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#4fd1dc]">
                    <span>📝 General Feedback Notes</span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {editingClientProject.clientFeedback}
                  </p>
                </div>
              )}

              {/* Dynamic feed of workspace submitted notes */}
              {editingClientProject.feedbacksList && editingClientProject.feedbacksList.length > 0 ? (
                editingClientProject.feedbacksList.map((item, idx) => (
                  <div key={item.id || idx} className="p-5 rounded-2xl bg-zarco-purple/5 border border-zarco-purple/10 space-y-3 hover:border-zarco-purple/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zarco-purple animate-pulse" />
                        <span className="text-[10px] text-zarco-purple uppercase tracking-widest font-black">
                          Workspace Note #{idx + 1}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-white/40">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap select-text">
                      {item.text}
                    </p>
                  </div>
                ))
              ) : (
                (!editingClientProject.clientFeedback || !editingClientProject.clientFeedback.trim()) && (
                  <div className="py-12 text-center space-y-2">
                    <span className="text-3xl">📭</span>
                    <p className="text-xs text-white/30 uppercase tracking-widest font-black">
                      No active notes submitted by this client.
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end shrink-0">
              <Button
                onClick={() => setShowFeedbackModal(false)}
                className="bg-white/5 border border-white/5 hover:bg-white/10 text-white font-heavy h-12 px-8 rounded-xl uppercase tracking-widest text-[10px]"
              >
                Close Log
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showAdminEstimatorModal && editingClientProject && (() => {
        const phases = getProjectPhases(editingClientProject);
        const activePhase = phases.find(p => p.id === adminEstimatorMode) || phases[0];

        const lines = activePhase.budgetLines || [];
        const baseSubtotal = lines.reduce((acc, line, idx) => {
          const isSelected = !line.isOptional || !!adminSelectedAddons[idx];
          if (isSelected) {
            return acc + (Number(line.cost) || 0);
          }
          return acc;
        }, 0);

        const customServices = activePhase.customServices || [];

        const customSubtotal = customServices.reduce((acc, item) => {
          return acc + (Number(item.cost) || 0);
        }, 0);

        const subtotalVal = baseSubtotal + customSubtotal;

        const discPct = Number(activePhase.discountPercent || "0") || 0;
        const discountAmtVal = (subtotalVal * discPct) / 100;
        const taxableBaseVal = Math.max(0, subtotalVal - discountAmtVal);
        const applyVat = activePhase.applyVat;
        const vatPct = applyVat
          ? (Number(activePhase.vatPercent !== undefined ? activePhase.vatPercent : "23") || 0)
          : 0;
        const vatAmtVal = (taxableBaseVal * vatPct) / 100;
        const grandTotalVal = taxableBaseVal + vatAmtVal;

        return (
          <div className="fixed inset-0 z-[130] w-full h-full bg-[#080d0f] flex flex-col overflow-y-auto select-text text-white">
            {/* Dynamic top bar */}
            <div className="flex border-b border-white/5 bg-[#0a1114] px-6 py-5 items-center justify-between sticky top-0 z-[140]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zarco-cyan/10 flex items-center justify-center border border-zarco-cyan/20">
                  <Euro className="w-5 h-5 text-zarco-cyan" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white leading-tight">
                    Interactive Project Cost Simulator
                  </h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-0.5">
                    Simulate costs, add services and customize tax elements for Client Portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminEstimatorModal(false)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/25 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                title="Close Estimator"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estimator Split Board */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full">
              {/* Left Side: Builder Controls */}
              <div className="lg:col-span-8 p-6 md:p-10 space-y-8 flex flex-col justify-start pb-16">
                
                {/* Dynamic Custom Services Registry (NOW LISTED ON TOP) */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <span className="text-base font-bold">✨</span>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#4fd1dc]">
                      Add Custom Services & Scope Items
                    </h4>
                  </div>

                  {/* Input Form for Admin Custom Service */}
                  <div className="bg-[#0c1417] border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="col-span-1 md:col-span-3 space-y-1.5">
                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                          Service Title
                        </label>
                        <Input
                          type="text"
                          value={adminNewServiceName}
                          onChange={(e) => setAdminNewServiceName(e.target.value)}
                          placeholder="e.g., Custom API Integration"
                          className="bg-[#080d0f] border-white/10 text-white text-xs h-10 rounded-lg focus:border-zarco-cyan font-bold"
                        />
                        <label
                          htmlFor="adminNewServiceIsOptionalBox"
                          className="flex items-center gap-2.5 bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 h-8 cursor-pointer select-none transition-all justify-start mt-2"
                        >
                          <input
                            type="checkbox"
                            id="adminNewServiceIsOptionalBox"
                            checked={adminNewServiceIsOptional}
                            onChange={(e) => setAdminNewServiceIsOptional(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-zarco-purple bg-[#080d0f] border-white/10 focus:ring-1 focus:ring-zarco-purple cursor-pointer accent-zarco-purple shrink-0"
                          />
                          <div className="flex flex-col text-left select-none leading-[1.1]">
                            <span className="text-[8px] font-black text-white/50 tracking-wider">OPTIONAL</span>
                            <span className="text-[8px] font-black text-zarco-cyan tracking-wider">UPSELL / ADD-ON</span>
                          </div>
                        </label>
                      </div>
                      <div className="col-span-1 md:col-span-3 space-y-1.5">
                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                          Description (Optional)
                        </label>
                        <Input
                          type="text"
                          value={adminNewServiceDesc}
                          onChange={(e) => setAdminNewServiceDesc(e.target.value)}
                          placeholder="e.g., Integration with Stripe"
                          className="bg-[#080d0f] border-white/15 text-white text-xs h-10 rounded-lg focus:border-zarco-cyan font-bold"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                          Qty
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={adminNewServiceQuantity}
                          onChange={(e) => setAdminNewServiceQuantity(e.target.value)}
                          placeholder="1"
                          className="bg-[#080d0f] border-white/10 text-white text-xs h-10 rounded-lg focus:border-zarco-cyan font-mono font-bold"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                          Hours
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={adminNewServiceHours}
                          onChange={(e) => setAdminNewServiceHours(e.target.value)}
                          placeholder="—"
                          className="bg-[#080d0f] border-white/10 text-white text-xs h-10 rounded-lg focus:border-zarco-cyan font-mono font-bold"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                          Price/Cost (€)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-mono">€</span>
                          <Input
                            type="number"
                            min="0"
                            value={adminNewServiceCost}
                            onChange={(e) => setAdminNewServiceCost(e.target.value)}
                            placeholder="500"
                            className="bg-[#080d0f] border-white/10 text-white text-xs h-10 rounded-lg pl-7 focus:border-zarco-cyan font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        onClick={() => {
                          if (!adminNewServiceName.trim()) return;
                          const qtyNum = Number(adminNewServiceQuantity) || 1;
                          const hrsNum = Number(adminNewServiceHours) || 0;
                          const unitPrice = Number(adminNewServiceCost) || 0;

                          let finalCost = unitPrice;
                          if (hrsNum > 0) {
                            finalCost = qtyNum * hrsNum * unitPrice;
                          } else {
                            finalCost = qtyNum * unitPrice;
                          }

                          const newId = 'service-' + Date.now();
                          const newService = {
                            id: newId,
                            item: adminNewServiceName.trim(),
                            cost: finalCost,
                            description: adminNewServiceDesc.trim() || "",
                            isOptional: adminNewServiceIsOptional,
                            quantity: qtyNum,
                            hours: hrsNum > 0 ? hrsNum : 0,
                            unitPrice: unitPrice
                          };
                           if (adminEstimatorMode === 'secondary') {
                            setEditingClientProject({
                              ...editingClientProject,
                              secondaryCustomServices: [...(editingClientProject.secondaryCustomServices || []), newService]
                            });
                          } else if (adminEstimatorMode.startsWith('phase_')) {
                            const idxPhase = parseInt(adminEstimatorMode.split('_')[1], 10);
                            const api = [...(editingClientProject.additionalPhases || [])];
                            if (api[idxPhase]) {
                              api[idxPhase].customServices = [...(api[idxPhase].customServices || []), newService];
                            }
                            setEditingClientProject({
                              ...editingClientProject,
                              additionalPhases: api
                            });
                          } else {
                            setEditingClientProject({
                              ...editingClientProject,
                              customServices: [...(editingClientProject.customServices || []), newService]
                            });
                          }
                          setAdminNewServiceName('');
                          setAdminNewServiceDesc('');
                          setAdminNewServiceCost('');
                          setAdminNewServiceQuantity('1');
                          setAdminNewServiceHours('');
                          setAdminNewServiceIsOptional(false);
                        }}
                        className="bg-zarco-purple hover:bg-zarco-purple/95 text-white font-black uppercase tracking-widest text-[9px] px-6 py-2.5 h-10 rounded-lg flex items-center gap-2 border-none transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Service
                      </Button>
                    </div>
                  </div>

                  {/* Added dynamic services list with manual delete */}
                  {customServices.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-widest font-black text-white/40 text-left">
                        Added Custom Services ({adminEstimatorMode === 'secondary' ? 'Secondary' : 'Primary'})
                      </div>
                      <div className="space-y-2">
                        {customServices.map((item, idx) => (
                          <div
                            key={`modal-item-${item.id}-${idx}`}
                            className="flex items-center justify-between p-4 rounded-xl border border-zarco-cyan/20 bg-zarco-cyan/[0.02] transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base">✨</span>
                              <div className="text-left select-all">
                                <span className="font-bold text-white text-sm uppercase tracking-wider">{item.item}</span>
                                {((item.quantity && item.quantity >= 1) || (item.hours && item.hours > 0)) && (
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-white/50 font-mono font-bold">
                                    {item.quantity && item.quantity >= 1 && (
                                      <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/70">Qty: {item.quantity}</span>
                                    )}
                                    {item.hours && item.hours > 0 && (
                                      <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/70">Hours: {item.hours}</span>
                                    )}
                                    {item.unitPrice !== undefined && (
                                      <span className="text-white/30">@ €{item.unitPrice}/unit</span>
                                    )}
                                  </div>
                                )}
                                {item.description && (
                                  <p className="text-[10px] text-white/40 font-mono font-semibold block mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-zarco-cyan font-mono text-base">
                                €{Number(item.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (adminEstimatorMode === 'secondary') {
                                    const updated = (editingClientProject.secondaryCustomServices || []).filter(c => c.id !== item.id);
                                    setEditingClientProject({ ...editingClientProject, secondaryCustomServices: updated });
                                  } else if (adminEstimatorMode.startsWith('phase_')) {
                                    const idxPhase = parseInt(adminEstimatorMode.split('_')[1], 10);
                                    const api = [...(editingClientProject.additionalPhases || [])];
                                    if (api[idxPhase]) {
                                      api[idxPhase].customServices = (api[idxPhase].customServices || []).filter(c => c.id !== item.id);
                                    }
                                    setEditingClientProject({
                                      ...editingClientProject,
                                      additionalPhases: api
                                    });
                                  } else {
                                    const updated = (editingClientProject.customServices || []).filter(c => c.id !== item.id);
                                    setEditingClientProject({ ...editingClientProject, customServices: updated });
                                  }
                                }}
                                className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all cursor-pointer"
                                title="Remove custom service"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Baseline Scope Items (NOW AFTER CUSTOM SERVICES) */}
                <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <span className="text-base font-bold">📋</span>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#4fd1dc]">
                      Primary Deliverables Checklist
                    </h4>
                  </div>

                  <div className="space-y-2 max-w-5xl">
                    {lines.map((line, idx) => {
                      const isSelected = !line.isOptional || !!adminSelectedAddons[idx];
                      return (
                        <div
                          key={`modal-line-${idx}`}
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                            isSelected 
                              ? 'bg-white/[0.02] border-white/10 text-white' 
                              : 'bg-[#091012] border-white/5 text-white/30'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (line.isOptional) {
                                setAdminSelectedAddons(prev => ({ ...prev, [idx]: !prev[idx] }));
                              }
                            }}
                            disabled={!line.isOptional}
                            className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                              !line.isOptional
                                ? 'bg-zarco-cyan/20 border-zarco-cyan/30 text-zarco-cyan cursor-not-allowed'
                                : !!adminSelectedAddons[idx]
                                  ? 'bg-zarco-purple border-zarco-purple text-white shadow-lg cursor-pointer'
                                  : 'border-white/10 hover:border-white/30 bg-white/5 cursor-pointer'
                            }`}
                          >
                            {(!line.isOptional || !!adminSelectedAddons[idx]) && (
                              <Check className="w-4 h-4 stroke-[3]" />
                            )}
                          </button>

                          <div className="flex-grow select-all text-left">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className={`font-bold uppercase tracking-wider text-sm ${isSelected ? 'text-white' : 'text-white/45 line-through decoration-white/10'}`}>
                                  {line.item}
                                </span>
                                {line.isOptional ? (
                                  <span className="ml-2 px-2 py-0.5 bg-zarco-purple/20 text-zarco-purple text-[8px] font-black uppercase tracking-wider rounded border border-zarco-purple/25">
                                    Optional
                                  </span>
                                ) : (
                                  <span className="ml-2 px-2 py-0.5 bg-zarco-cyan/10 text-zarco-cyan text-[8px] font-black uppercase tracking-wider rounded border border-zarco-cyan/25">
                                    Base Scope
                                  </span>
                                )}
                              </div>
                              <span className={`font-black font-mono text-sm ${isSelected ? 'text-white' : 'text-white/30'}`}>
                                {line.cost !== '—' && line.cost !== '0' && line.cost !== ''
                                  ? `€${Number(line.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                  : '—'}
                              </span>
                            </div>
                            {line.description && (
                              <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-white/50' : 'text-white/20'}`}>
                                {line.description}
                              </p>
                            )}
                          </div>

                          {/* Delete deliverable button right in simulator */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = lines.filter((_, idx2) => idx2 !== idx);
                              if (adminEstimatorMode === 'secondary') {
                                setEditingClientProject({
                                  ...editingClientProject,
                                  secondaryBudgetLines: updated
                                });
                              } else if (adminEstimatorMode.startsWith('phase_')) {
                                const idxPhase = parseInt(adminEstimatorMode.split('_')[1], 10);
                                const api = [...(editingClientProject.additionalPhases || [])];
                                if (api[idxPhase]) {
                                  api[idxPhase].budgetLines = updated;
                                }
                                setEditingClientProject({
                                  ...editingClientProject,
                                  additionalPhases: api
                                });
                              } else {
                                setEditingClientProject({
                                  ...editingClientProject,
                                  budgetLines: updated
                                });
                              }
                              // Re-key selected state
                              const newSelected: Record<number, boolean> = {};
                              let newIdx = 0;
                              lines.forEach((_, oldIdx) => {
                                if (oldIdx !== idx) {
                                  newSelected[newIdx] = !!adminSelectedAddons[oldIdx];
                                  newIdx++;
                                }
                              });
                              setAdminSelectedAddons(newSelected);
                            }}
                            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-100 flex items-center justify-center hover:bg-red-500/20 hover:text-red-100 transition-all cursor-pointer flex-shrink-0 self-start"
                            title="Remove standard deliverable from list"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      );
                    })}
                    {lines.length === 0 && (
                      <div className="p-4 bg-[#091012] border border-white/5 rounded-2xl">
                        <span className="text-white/40 text-xs italic">
                          No template budget lines configured yet. (Type standard price under general information if no budget line items are set).
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Promo Discount and Tax VAT controls with identical styles and mechanics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5 text-left">
                  
                  {/* Promo Discount config block */}
                  <div className="space-y-3 bg-[#0c1417]/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold">🏷️</span>
                        <div className="text-left">
                          <label className="text-[10px] font-black text-[#4fd1dc] uppercase tracking-widest block">
                            Apply Promo Discount
                          </label>
                          <span className="text-[9px] text-white/30 uppercase tracking-widest font-black font-semibold">
                            Enable customized client discount
                          </span>
                        </div>
                      </div>

                      {/* Direct switch toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const hasDiscount = Number(editingClientProject.discountPercent || "0") > 0;
                          setEditingClientProject({
                            ...editingClientProject,
                            discountPercent: hasDiscount ? "0" : "10"
                          });
                        }}
                        className={`w-12 h-6 rounded-full p-0.5 transition-all select-none border border-white/5 cursor-pointer flex items-center ${
                          Number(editingClientProject.discountPercent || "0") > 0 ? 'bg-[#4fd1dc]' : 'bg-[#080d0f]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full transition-all transform ${
                          Number(editingClientProject.discountPercent || "0") > 0 ? 'bg-black translate-x-6' : 'bg-[#4fd1dc] translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {Number(editingClientProject.discountPercent || "0") > 0 ? (
                      <div className="grid grid-cols-12 gap-2 items-center pt-2 text-left">
                        <span className="col-span-8 text-[11px] font-bold text-white/55">
                          Discount Percentage Rate:
                        </span>
                        <div className="col-span-4 relative">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={editingClientProject.discountPercent !== undefined ? editingClientProject.discountPercent : "0"}
                            onChange={(e) => setEditingClientProject({ ...editingClientProject, discountPercent: e.target.value })}
                            className="bg-[#080d0f] border-white/10 text-white text-xs h-8 pr-6 text-center focus:border-zarco-cyan font-mono"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/30 font-mono">%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] uppercase font-bold text-white/20 text-center py-2">
                        No Discount Applied (0%)
                      </div>
                    )}
                  </div>

                  {/* VAT config block */}
                  <div className="space-y-3 bg-[#0c1417]/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold">💼</span>
                        <div className="text-left">
                          <label className="text-[10px] font-black text-[#4fd1dc] uppercase tracking-widest block">
                            Taxation / VAT Support
                          </label>
                          <span className="text-[9px] text-white/30 uppercase tracking-widest font-black font-semibold">
                            Enable general sales tax
                          </span>
                        </div>
                      </div>

                      {/* Direct switch toggle */}
                      <button
                        type="button"
                        onClick={() => setEditingClientProject({ ...editingClientProject, applyVat: !applyVat })}
                        className={`w-12 h-6 rounded-full p-0.5 transition-all select-none border border-white/5 cursor-pointer flex items-center ${
                          applyVat ? 'bg-[#4fd1dc]' : 'bg-[#080d0f]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full transition-all transform ${
                          applyVat ? 'bg-black translate-x-6' : 'bg-[#4fd1dc] translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {applyVat ? (
                      <div className="grid grid-cols-12 gap-2 items-center pt-2 text-left">
                        <span className="col-span-8 text-[11px] font-bold text-white/55">
                          Standard VAT Rate Charge:
                        </span>
                        <div className="col-span-4 relative">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={editingClientProject.vatPercent !== undefined ? editingClientProject.vatPercent : "23"}
                            onChange={(e) => setEditingClientProject({ ...editingClientProject, vatPercent: e.target.value })}
                            className="bg-[#080d0f] border-white/10 text-white text-xs h-8 pr-6 text-center focus:border-zarco-cyan font-mono"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/30 font-mono">%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] uppercase font-bold text-white/20 text-center py-2">
                        VAT Exempt (0%)
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Right Side: Calculated Live Breakdown Board */}
              <div className="lg:col-span-4 bg-[#0a1114] border-t lg:border-t-0 lg:border-l border-white/5 p-6 md:p-10 flex flex-col justify-between space-y-8 select-all text-left">
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#4fd1dc] pb-4 border-b border-white/5 flex items-center gap-2">
                    <span>📉</span>
                    Proposal Invoice Simulation
                  </h4>

                  {/* Break items flow list */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {/* Primary Deliverables selected */}
                    {lines.filter((_, idx) => !lines[idx].isOptional || !!adminSelectedAddons[idx]).map((line, idx) => (
                      <div key={`summary-b-${idx}`} className="flex justify-between items-start text-xs text-white/60">
                        <span className="uppercase tracking-wider text-[9px] text-[#4fd1dc]/80 font-bold max-w-[70%] text-left">
                          • {line.item}
                        </span>
                        <span className="font-mono font-medium text-right">
                          €{Number(line.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                    {/* Custom services added */}
                    {(editingClientProject.customServices || []).map((item, idx) => (
                      <div key={`summary-c-${idx}`} className="flex justify-between items-start text-xs text-white/80">
                        <span className="uppercase tracking-wider text-[9px] text-zarco-cyan font-bold max-w-[70%] text-left">
                          ✨ {item.item}
                        </span>
                        <span className="font-mono font-bold text-zarco-cyan text-right">
                          €{Number(item.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                    {lines.filter((_, idx) => !lines[idx].isOptional || !!adminSelectedAddons[idx]).length === 0 && (editingClientProject.customServices || []).length === 0 && (
                      <div className="text-center py-4 text-white/20 italic text-[10px] uppercase font-bold tracking-widest">
                        No Deliverables Simulated
                      </div>
                    )}
                  </div>

                  {/* Mathematical Totals layout */}
                  <div className="space-y-3 pt-6 border-t border-white/5 select-all">
                    <div className="flex justify-between items-center text-xs text-white/40">
                      <span className="uppercase tracking-widest text-[9px] font-black">Gross Subtotal:</span>
                      <span className="font-mono font-bold text-white text-sm text-right">
                        €{subtotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {discountAmtVal > 0 && (
                      <div className="flex justify-between items-center text-xs text-green-400">
                        <span className="uppercase tracking-widest text-[9px] font-black">Promo Discount: ({discPct}%)</span>
                        <span className="font-mono font-black text-right">
                          -€{discountAmtVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    {discountAmtVal > 0 && (
                      <div className="flex justify-between items-center text-xs text-white/40 border-t border-white/5 pt-3">
                        <span className="uppercase tracking-widest text-[9px] font-black">Taxable Base:</span>
                        <span className="font-mono font-bold text-right">
                          €{taxableBaseVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    {applyVat && vatAmtVal > 0 && (
                      <div className="flex justify-between items-center text-xs text-zarco-purple">
                        <span className="uppercase tracking-widest text-[9px] font-black">Sales VAT: ({vatPct}%)</span>
                        <span className="font-mono font-black text-right">
                          +€{vatAmtVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-white/10 shrink-0">
                  <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-5 rounded-2xl select-all">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-black leading-none">
                        GRAND PORTAL TOTAL
                      </span>
                      <span className="text-[8px] text-zarco-cyan font-black uppercase mt-1 leading-none">
                        Calculated price simulation values
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-zarco-cyan font-sans block tracking-tight">
                        €{grandTotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={async () => {
                      const selectedLines = lines.filter((_, idx) => !lines[idx].isOptional || !!adminSelectedAddons[idx]);
                      const finalPrice = grandTotalVal.toFixed(2);
                      
                      let updatedProj: ClientProject;
                      if (adminEstimatorMode === 'secondary') {
                        updatedProj = {
                          ...editingClientProject,
                          secondaryPrice: finalPrice,
                          secondaryBudgetLines: selectedLines,
                          secondaryApplyVat: applyVat,
                          secondaryVatPercent: editingClientProject.secondaryVatPercent !== undefined ? editingClientProject.secondaryVatPercent : "23",
                          secondaryDiscountPercent: editingClientProject.secondaryDiscountPercent || "0",
                          secondaryPaidStatus: editingClientProject.secondaryPaidStatus || "Pending"
                        };
                      } else {
                        updatedProj = {
                          ...editingClientProject,
                          price: finalPrice,
                          budgetLines: selectedLines,
                          applyVat,
                          vatPercent: editingClientProject.vatPercent !== undefined ? editingClientProject.vatPercent : "23",
                          discountPercent: editingClientProject.discountPercent || "0"
                        };
                      }
                      
                      setEditingClientProject(updatedProj);
                      
                      // Auto-save existing project to Firestore immediately
                      if (editingClientProject.id && !editingClientProject.id.startsWith("client-proj-temp-")) {
                        try {
                          const projectData = { ...updatedProj }; Object.keys(projectData).forEach(k => { if ((projectData as any)[k] === undefined) delete (projectData as any)[k]; });
                          const projectId = projectData.id;
                          delete (projectData as any).id;
                          
                          await updateDoc(doc(db, "clientProjects", projectId), {
                            ...projectData,
                            updatedAt: serverTimestamp(),
                          });
                          await fetchClientProjects();
                        } catch (err) {
                          console.error("Auto-saving simulated invoice rates error:", err);
                        }
                      }
                      
                      setShowAdminEstimatorModal(false);
                    }}
                    className="w-full bg-[#4fd1dc] hover:bg-[#4fd1dc]/90 text-black font-black uppercase tracking-widest text-[11px] h-12 rounded-xl border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Confirm & Save Simulation Rates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {showFullDescModal && editingClientProject && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="bg-[#0a1114] border border-white/10 w-[90%] max-w-[90vw] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col h-[80vh]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zarco-cyan/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-zarco-cyan" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                    Detailed Architecture & Scope
                  </h3>
                  <p className="text-[10px] text-[#4fd1dc]/70 uppercase tracking-widest font-black mt-0.5">
                    Editing build brief for: {editingClientProject.projectName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullDescModal(false)}
                className="text-white/20 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 cursor-pointer flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sub-header instructions */}
            <div className="bg-[#0d1518] border border-white/5 rounded-2xl p-4 mb-6 shrink-0">
              <p className="text-xs text-white/50 leading-relaxed">
                Describe the comprehensive technical architecture, frontend/backend stack details, sitemap pages, services included, database integrations, and overall scope. This information will be displayed to the client under their <strong>Project Overview</strong> in the Client Hub.
              </p>
            </div>

            {/* Textarea Area */}
            <div className="flex-1 flex flex-col min-h-0 mb-6">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2 shrink-0">
                Detailed Scope Markdown / Raw Text
              </label>
              <textarea
                value={editingClientProject.fullDescription || ""}
                onChange={(e) =>
                  setEditingClientProject({
                    ...editingClientProject,
                    fullDescription: e.target.value,
                  })
                }
                autoFocus
                placeholder="Enter detailed scope, architecture layers, features list, sitemap structure and page expectations..."
                className="w-full h-full bg-[#070d0f] border border-white/10 rounded-2xl p-6 text-sm text-white/80 focus:outline-none focus:border-zarco-cyan resize-none flex-1 font-mono leading-relaxed"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-white/5 pt-6 shrink-0">
              <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">
                {(editingClientProject.fullDescription || "").length} Characters
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowFullDescModal(false)}
                  className="bg-transparent text-white/50 hover:text-white hover:bg-white/5 border border-white/10 uppercase tracking-widest text-[10px] font-black rounded-xl h-12 px-6"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowFullDescModal(false)}
                  className="bg-zarco-cyan hover:bg-zarco-cyan/90 text-black uppercase tracking-widest text-[11px] font-black rounded-xl h-12 px-8 flex items-center gap-2 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
                >
                  <Check className="w-4 h-4" />
                  Apply Specifications
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

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
    </div>
  );
}


