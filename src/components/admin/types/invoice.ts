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
