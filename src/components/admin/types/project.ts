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
  additionalPhases?: any[];
}

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
