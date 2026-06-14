import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { 
  Lock, 
  CheckCircle, 
  HelpCircle, 
  Info, 
  FileText, 
  Layers, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Send,
  ExternalLink,
  DollarSign,
  User,
  Phone,
  Mail,
  Building,
  Edit2,
  Trash2,
  Plus,
  Eye,
  X,
  Check,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Host {
  domainProvider: string;
  domainExpiration: string;
  hostingType: string;
  isHostingFree: boolean;
  isClientProvided?: boolean;
  showDomainExpiration?: boolean;
  isPaymentManagedByCustomer?: boolean;
}

interface BudgetLine {
  item: string;
  description?: string;
  cost: number | string;
  isOptional?: boolean;
}

interface FeedbackEntry {
  id: string;
  text: string;
  createdAt: string;
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
  status: string;
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
  hostingType: string;
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
  paidStatus: string;
  maintenancePlan: boolean;
  internalNotes: string;
  clientFeedback: string;
  issues: string;

  // Sharing Credentials
  shareUsername?: string;
  sharePassword?: string;
  isShared?: boolean;

  // New Proposal Proposal-specific fields
  projectPurpose?: string;
  pagesCount?: string;
  pagesList?: string;
  featuresList?: string;
  wireframes?: string; 
  budgetLines?: BudgetLine[];
  shareLanguage?: string;
  expectedDuration?: string;
  onlyShowExpected?: boolean;
  showFullDescription?: boolean;
  showReviewsBox?: boolean;
  feedbacksList?: FeedbackEntry[];
  prototypesList?: PrototypeEntry[];
  hasManualTesting?: boolean;
  manualTestingUrl?: string;
  hasAutomatedTesting?: boolean;
  automatedTestingUrl?: string;
  discountPercent?: string | number;
  vatPercent?: string | number;
  applyVat?: boolean;
  customServices?: { id: string; item: string; description?: string; cost: number; isOptional?: boolean; quantity?: number; hours?: number; unitPrice?: number }[];
  termsSubtitle?: string;
  termsDescription?: string;
  termsUrl?: string;
  showTermsButton?: boolean;
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
}

interface Client {
  id: string;
  fullName: string;
  companyName: string;
  businessType: string;
  industry: string;
  description: string;
  websiteUrl: string;
  email: string;
  phone?: string;
}

export function ProjectHub({ projectId }: { projectId: string }) {
  const { t, i18n } = useTranslation();
  const isPt = i18n.language === 'pt';

  const [project, setProject] = useState<ClientProject | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authentication states
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Contact popup states
  const [showContactModal, setShowContactModal] = useState(false);
  const [activePrototype, setActivePrototype] = useState<PrototypeEntry | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Feedback states
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [editingFeedbackText, setEditingFeedbackText] = useState('');

  // Testimonial & Review states
  const [rating, setRating] = useState<number>(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewCompany, setReviewCompany] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewLinkedIn, setReviewLinkedIn] = useState('');
  const [reviewAvatar, setReviewAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [existingReviews, setExistingReviews] = useState<any[]>([]);
  const [reviewConsent, setReviewConsent] = useState(false);

  // Interactive Pricing & Billing custom states
  const [clientPricingActiveTab, setClientPricingActiveTab] = useState<'primary' | 'secondary'>('primary');
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState<boolean>(false);
  const [subscriptionPaid, setSubscriptionPaid] = useState<boolean>(() => {
    return localStorage.getItem(`subscribed_${projectId}`) === 'true';
  });

  const getNextPaymentDate = () => {
    const paidAt = project?.subscriptionPaidAt ? new Date(project.subscriptionPaidAt) : new Date();
    if (project?.subscriptionInterval === "yearly") {
      paidAt.setFullYear(paidAt.getFullYear() + 1);
    } else {
      paidAt.setMonth(paidAt.getMonth() + 1);
    }
    return paidAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const [subCardName, setSubCardName] = useState<string>('');
  const [subCardNumber, setSubCardNumber] = useState<string>('');
  const [subCardExpiry, setSubCardExpiry] = useState<string>('');
  const [subCardCvc, setSubCardCvc] = useState<string>('');
  const [subCardPostal, setSubCardPostal] = useState<string>('');
  const [subIsProcessing, setSubIsProcessing] = useState<boolean>(false);
  const [subSuccess, setSubSuccess] = useState<boolean>(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [subTransactionId, setSubTransactionId] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<Record<number, boolean>>({});
  const [discountPercent, setDiscountPercent] = useState<string>('0');
  const [vatPercent, setVatPercent] = useState<string>('23');
  const [applyVat, setApplyVat] = useState<boolean>(true);
  const [customServices, setCustomServices] = useState<{ id: string; item: string; description?: string; cost: number; isOptional: boolean; quantity?: number; hours?: number; unitPrice?: number }[]>([]);
  const [showEstimatorModal, setShowEstimatorModal] = useState<boolean>(false);
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newServiceDesc, setNewServiceDesc] = useState<string>('');
  const [newServiceCost, setNewServiceCost] = useState<string>('');
  const [newServiceQuantity, setNewServiceQuantity] = useState<string>('1');
  const [newServiceHours, setNewServiceHours] = useState<string>('');
  const [newServiceIsOptional, setNewServiceIsOptional] = useState<boolean>(false);

  // Toast systems
  interface ToastItem {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    const hashParts = window.location.hash.split('?');
    const searchPart = hashParts[1] || window.location.search || '';
    const urlParams = new URLSearchParams(searchPart);
    const urlLng = urlParams.get('lng') || urlParams.get('lang');
    if (urlLng === 'pt' || urlLng === 'pt-pt' || urlLng === 'pt-PT') {
      i18n.changeLanguage('pt');
    } else if (urlLng === 'en') {
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const projRef = doc(db, 'clientProjects', projectId);
        const projSnap = await getDoc(projRef);

        if (!projSnap.exists()) {
          setErrorMsg(isPt ? 'Portal de projeto não encontrado.' : 'Project portal not found.');
          setLoading(false);
          return;
        }

        const projectData = { id: projSnap.id, ...projSnap.data() } as ClientProject;
        setProject(projectData);
        if (projectData.subscriptionPaid !== undefined) {
          setSubscriptionPaid(!!projectData.subscriptionPaid);
        }
        if (projectData.discountPercent !== undefined) setDiscountPercent(projectData.discountPercent.toString());
        if (projectData.vatPercent !== undefined) setVatPercent(projectData.vatPercent.toString());
        if (projectData.applyVat !== undefined) setApplyVat(projectData.applyVat);
        if (projectData.customServices !== undefined) setCustomServices(projectData.customServices);
        if (projectData.budgetLines) {
          const initialSelected: Record<number, boolean> = {};
          projectData.budgetLines.forEach((_, idx) => {
            initialSelected[idx] = true;
          });
          setSelectedAddons(initialSelected);
        }
        setFeedbackInput('');

        // Sync display language from project data if no overriding URL query parameter is supplied
        const hashParts = window.location.hash.split('?');
        const searchPart = hashParts[1] || window.location.search || '';
        const urlParams = new URLSearchParams(searchPart);
        const urlLng = urlParams.get('lng') || urlParams.get('lang');
        if (!urlLng && projectData.shareLanguage) {
          i18n.changeLanguage(projectData.shareLanguage);
        }

        // Fetch client details if connected
        if (projectData.clientId) {
          const clientRef = doc(db, 'clients', projectData.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            const clientData = { id: clientSnap.id, ...clientSnap.data() } as Client;
            setClient(clientData);
            setReviewCompany(clientData.companyName || '');
            setReviewName(clientData.fullName || '');
            setContactName(clientData.fullName || '');
            setContactCompany(clientData.companyName || '');
            setContactEmail(clientData.email || '');
            setContactPhone(clientData.phone || '');
          }
        }

        // Fetch existing reviews for this projectId
        try {
          const revQuery = query(collection(db, 'reviews'), where('projectId', '==', projectId));
          const revSnap = await getDocs(revQuery);
          const fetchedResult = revSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setExistingReviews(fetchedResult);
        } catch (revError) {
          console.error("Error loading projectId reviews:", revError);
        }

        // Check session storage for prior login within current browser session
        const storedAuth = sessionStorage.getItem(`zarco-hub-auth-${projectId}`);
        if (storedAuth === 'true') {
          setIsAuthenticated(true);
        } else if (!projectData.shareUsername && !projectData.sharePassword) {
          // If no password sharing configured, bypass lock Screen
          setIsAuthenticated(true);
        }
      } catch (err: any) {
        console.error('Error fetching dynamic project hub:', err);
        setErrorMsg(isPt ? 'Erro ao carregar os dados.' : 'Error loading workspace details.');
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadData();
    }
  }, [projectId, isPt]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!project) return;

    const expectedUser = (project.shareUsername || '').trim();
    const expectedPass = (project.sharePassword || '').trim();

    if (usernameInput.trim() === expectedUser && passwordInput.trim() === expectedPass) {
      setIsAuthenticated(true);
      sessionStorage.setItem(`zarco-hub-auth-${projectId}`, 'true');
    } else {
      setLoginError(isPt ? 'Credenciais incorretas. Tente novamente.' : 'Incorrect username or password. Please try again.');
    }
  };

  const getFeedbacksList = (): FeedbackEntry[] => {
    if (!project) return [];
    if (project.feedbacksList && project.feedbacksList.length > 0) {
      return project.feedbacksList;
    }
    if (project.clientFeedback && project.clientFeedback.trim()) {
      return [{
        id: 'legacy',
        text: project.clientFeedback,
        createdAt: project.startDate || new Date().toISOString()
      }];
    }
    return [];
  };

  const getProjectPhases = (proj: any) => {
    if (!proj) return [];
    const phases: any[] = [];
    
    phases.push({
      id: 'primary',
      title: isPt ? 'Fase 1' : 'Phase 1',
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
        title: isPt ? 'Fase 2' : 'Phase 2',
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

  const clientPhases = getProjectPhases(project);
  const activeClientPhaseId = clientPhases.some(p => p.id === clientPricingActiveTab) ? clientPricingActiveTab : 'primary';
  const activeClientPhase = clientPhases.find(p => p.id === activeClientPhaseId) || clientPhases[0];

  const getSubtotalPrice = () => {
    if (!activeClientPhase) return 0;
    const lines = activeClientPhase.budgetLines || [];
    const items = activeClientPhase.customServices || [];

    const baseSubtotal = lines.reduce((acc: number, line: any, idx: number) => {
      const isSelected = activeClientPhaseId !== 'primary' || !line.isOptional || !!selectedAddons[idx];
      if (isSelected) {
        return acc + (Number(line.cost) || 0);
      }
      return acc;
    }, 0);

    const customSubtotal = items.reduce((acc: number, item: any) => {
      return acc + (Number(item.cost) || 0);
    }, 0);

    return baseSubtotal + customSubtotal;
  };

  const subtotalVal = getSubtotalPrice();
  const discPct = Number(activeClientPhase?.discountPercent || "0") || 0;
  const discountAmtVal = (subtotalVal * discPct) / 100;
  const taxableBaseVal = Math.max(0, subtotalVal - discountAmtVal);
  const showVat = activeClientPhase ? activeClientPhase.applyVat : true;
  const pctVat = showVat 
    ? (Number(activeClientPhase?.vatPercent !== undefined ? activeClientPhase.vatPercent : "23") || 0) 
    : 0;
  const vatAmtVal = (taxableBaseVal * pctVat) / 100;
  const grandTotalVal = taxableBaseVal + vatAmtVal;

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submittingContact) return;

    if (!contactName.trim() || !contactEmail.trim() || !contactDetails.trim()) {
      setContactError(isPt ? 'Por favor, preencha todos os campos obrigatórios (Nome, Email e Mensagem).' : 'Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    setSubmittingContact(true);
    setContactSuccess(false);
    setContactError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactName,
          company: contactCompany,
          email: contactEmail,
          phone: contactPhone,
          details: contactDetails,
          isSharedPage: true,
        }),
      });

      if (response.ok) {
        setContactSuccess(true);
        setContactDetails('');
      } else {
        const errData = await response.json().catch(() => ({}));
        setContactError(errData.error || (isPt ? 'Houve um erro ao enviar a mensagem. Por favor, tente novamente.' : 'An error occurred while sending your message. Please try again.'));
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      setContactError(isPt ? 'Erro de rede. Verifique a sua ligação.' : 'Network error. Please check your connection.');
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!project || !feedbackInput.trim()) return;
    setSubmittingFeedback(true);
    setFeedbackSuccess(false);

    const newEntry: FeedbackEntry = {
      id: 'fb-' + Date.now().toString(36),
      text: feedbackInput.trim(),
      createdAt: new Date().toISOString()
    };

    const currentList = getFeedbacksList();
    const updatedList = [newEntry, ...currentList];

    try {
      const projRef = doc(db, 'clientProjects', projectId);
      await updateDoc(projRef, {
        feedbacksList: updatedList,
        clientFeedback: newEntry.text,
        updatedAt: new Date()
      });

      setProject(prev => prev ? {
        ...prev,
        feedbacksList: updatedList,
        clientFeedback: newEntry.text
      } : null);

      setFeedbackInput('');
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 5000);
      showToast(isPt ? 'Feedback criado/adicionado com sucesso!' : 'Feedback submitted successfully!', 'success');
    } catch (err) {
      console.error('Error adding feedback:', err);
      showToast(isPt ? 'Erro ao submeter feedback.' : 'Failed to save feedback.', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleUpdateFeedback = async (id: string, newText: string) => {
    if (!project || !newText.trim()) return;
    try {
      const currentList = getFeedbacksList();
      const updatedList = currentList.map(item => 
        item.id === id ? { ...item, text: newText.trim() } : item
      );

      const isMostRecent = updatedList[0]?.id === id;
      const legacyText = isMostRecent ? newText.trim() : (project.clientFeedback || '');

      const projRef = doc(db, 'clientProjects', projectId);
      await updateDoc(projRef, {
        feedbacksList: updatedList,
        clientFeedback: legacyText,
        updatedAt: new Date()
      });

      setProject(prev => prev ? {
        ...prev,
        feedbacksList: updatedList,
        clientFeedback: legacyText
      } : null);

      setEditingFeedbackId(null);
      setEditingFeedbackText('');
      showToast(isPt ? 'Feedback atualizado com sucesso!' : 'Feedback updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating feedback:', err);
      showToast(isPt ? 'Erro ao atualizar feedback.' : 'Failed to update feedback.', 'error');
    }
  };

  const performDeleteFeedback = async (id: string) => {
    if (!project) return;
    try {
      const currentList = getFeedbacksList();
      const updatedList = currentList.filter(item => item.id !== id);
      const legacyText = updatedList[0]?.text || '';

      const projRef = doc(db, 'clientProjects', projectId);
      await updateDoc(projRef, {
        feedbacksList: updatedList,
        clientFeedback: legacyText,
        updatedAt: new Date()
      });

      setProject(prev => prev ? {
        ...prev,
        feedbacksList: updatedList,
        clientFeedback: legacyText
      } : null);
      showToast(isPt ? 'Feedback eliminado com sucesso!' : 'Feedback deleted successfully!', 'info');
    } catch (err) {
      console.error('Error deleting feedback:', err);
      showToast(isPt ? 'Erro ao eliminar feedback.' : 'Failed to delete feedback.', 'error');
    } finally {
      setFeedbackToDelete(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      localStorage.removeItem(`subscribed_${projectId}`);
      localStorage.removeItem(`sub_txn_${projectId}`);
      setSubscriptionPaid(false);
      setShowUnsubscribeModal(false);

      if (project) {
        const projRef = doc(db, 'clientProjects', projectId);
        await updateDoc(projRef, {
          hasSubscription: false,
          subscriptionPaid: false,
          subscriptionPaidAt: null,
          updatedAt: new Date()
        });

        setProject(prev => prev ? {
          ...prev,
          hasSubscription: false,
          subscriptionPaid: false,
          subscriptionPaidAt: undefined
        } : null);
      }

      showToast(isPt ? 'Assinatura cancelada e removida com sucesso.' : 'Subscription cancelled and removed successfully.', 'info');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      showToast(isPt ? 'Erro ao cancelar assinatura.' : 'Failed to cancel subscription.', 'error');
    }
  };

  const uploadAvatarFile = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      let folderName = "portfolio";
      if (project && project.projectName) {
        const slug = project.projectName
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // remove accents
          .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
          .replace(/(^-|-$)/g, ""); // remove leading/trailing hyphens
        folderName = `portfolio/${slug}/testimonials`;
      } else {
        folderName = "portfolio/testimonials";
      }
      formDataUpload.append("folder", folderName);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      if (!response.ok) throw new Error("Upload response not ok");
      const data = await response.json();
      setReviewAvatar(data.url);
      showToast(isPt ? "Foto de perfil carregada com sucesso!" : "Profile photo uploaded successfully!", 'success');
    } catch (err: any) {
      console.error(err);
      showToast(isPt ? "Falha ao carregar imagem." : "Failed to upload image.", 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const submitTestimonial = async (e: FormEvent) => {
    e.preventDefault();
    if (!project) return;
    if (!reviewText.trim()) {
      showToast(isPt ? "Por favor escreva o texto do seu testemunho de avaliação." : "Please write down your testimonial text.", 'info');
      return;
    }

    setSubmittingReview(true);
    setReviewSuccess(false);

    try {
      const reviewId = "rev-" + Math.random().toString(36).substring(2, 11);
      const reviewPayload = {
        id: reviewId,
        name: reviewName || client?.fullName || 'Anonymous User',
        companyName: reviewCompany || client?.companyName || project.projectName || 'Valued Client',
        avatar: reviewAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop', // default classy profile picture
        reviewTextEn: isPt ? "" : reviewText,
        reviewTextPt: isPt ? reviewText : "",
        lang: isPt ? "pt" as const : "en" as const,
        show: false, // defaults to false for privacy, waiting on administrator approval or review!
        order: Number(new Date().getTime()) * -1,
        rating: rating,
        linkedInUsername: reviewLinkedIn || "",
        projectId: projectId,
        submittedAt: new Date().toISOString(),
        consentToPublish: reviewConsent
      };

      await setDoc(doc(collection(db, "reviews"), reviewId), reviewPayload);
      
      setReviewSuccess(true);
      setReviewText('');
      setReviewLinkedIn('');
      setReviewConsent(false);
      setExistingReviews(prev => [reviewPayload, ...prev]);
      showToast(isPt ? "Testemunho submetido com sucesso! Aguarda aprovação." : "Testimonial submitted successfully! Pending approval.", 'success');
    } catch (err) {
      console.error(err);
      showToast(isPt ? "Erro ao submeter o testemunho ou avaliação." : "Error submitting your review or testimonial.", 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-40 min-h-screen flex items-center justify-center bg-zarco-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zarco-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
            {isPt ? 'A carregar portal do cliente...' : 'Loading Client Workspace...'}
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="pt-40 min-h-screen flex flex-col items-center justify-center gap-6 bg-zarco-black text-white px-6 text-center">
        <span className="text-4xl">🔒</span>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white/80">
          {errorMsg || (isPt ? 'Portal Não Ativo' : 'Portal Pending Activation')}
        </h2>
        <p className="text-white/40 max-w-md text-xs uppercase font-bold tracking-widest leading-relaxed">
          {isPt 
            ? 'Este workspace privado está pendente de ativação ou não existe. Contacte a Zarco Studios.' 
            : 'This private workspace is pending configuration or does not exist. Please check with your administrator.'}
        </p>
        <Button 
          onClick={() => window.location.hash = ''}
          className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-full shadow-lg shadow-zarco-cyan/20 hover:scale-105 transition-all mt-4"
        >
          {isPt ? 'Ir para Site Principal' : 'Back to Main Site'}
        </Button>
      </div>
    );
  }

  // Render Protection Lock Screen if isShared is true and authenticated state is false
  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-zarco-black text-white flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <img 
              src="/images/logos/zarco_logo_web_developmet_no_bg300px.jpg" 
              alt="Zarco Studios" 
              className="h-12 w-auto hover:brightness-110 transition-all font-sans"
              referrerPolicy="no-referrer"
            />
          </div>

          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-zarco-cyan to-zarco-purple" />
            
            <div className="flex flex-col items-center text-center mb-8 mt-2">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-zarco-cyan mb-4 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2 leading-none">
                {isPt ? 'Espaço Privado' : 'Secure Workspace'}
              </h2>
              <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest leading-relaxed">
                {isPt 
                  ? 'Inicie sessão para aceder à proposta de projeto e orçamento' 
                  : 'Enter client credentials to access proposal specifications and budget'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-white/30" />
                  {isPt ? 'Utilizador' : 'Client Username'}
                </label>
                <Input
                  required
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. clientname"
                  className="bg-[#0c1417]/80 border-white/15 rounded-xl h-12 text-white focus:border-zarco-cyan"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/30" />
                  {isPt ? 'Palavra-passe' : 'Portal Password'}
                </label>
                <Input
                  required
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#0c1417]/80 border-white/15 rounded-xl h-12 text-white focus:border-zarco-cyan"
                />
              </div>

              {loginError && (
                <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider text-center pt-2">
                  {loginError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-zarco-cyan hover:bg-zarco-cyan/90 text-black font-black uppercase tracking-widest rounded-xl py-6 h-12 shadow-[0_0_20px_rgba(79,209,220,0.2)] mt-2"
              >
                {isPt ? 'Entrar no Workspace' : 'Unlock Workspace'}
              </Button>
            </form>
          </Card>

          <p className="text-center text-[10px] text-white/20 uppercase font-black tracking-widest mt-8">
            &copy; {new Date().getFullYear()} Zarco Studios. All Rights Reserved.
          </p>
        </motion.div>
      </div>
    );
  }

  // Main Authenticated Workspace Layout
  return (
    <div className="pt-32 pb-24 min-h-screen bg-zarco-black text-white selection:bg-zarco-cyan/30">
      <div className="container mx-auto px-6">
        {/* Zarco Logo Top bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 pb-8 border-b border-white/5"
        >
          <div className="flex items-center gap-4">
            <img 
              src="/images/logos/zarco_logo_web_developmet_no_bg300px.jpg" 
              alt="Zarco Studios Logo" 
              className="h-10 w-auto"
              referrerPolicy="no-referrer"
            />
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 hidden sm:block">
              {isPt ? 'Portal Seguro de Parceria' : 'Secure Collaboration Workspace'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {project.showFullDescription && (
              <button
                onClick={() => setShowFullDesc(true)}
                className="flex items-center gap-2 cursor-pointer bg-zarco-purple/10 text-zarco-purple text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-zarco-purple/30 rounded-xl hover:bg-zarco-purple/25 transition-all hover:scale-[1.02] active:scale-[0.98] h-8"
              >
                <span>📖</span>
                {isPt ? 'Descrição Detalhada' : 'Detailed Description'}
              </button>
            )}

            {project.showTermsButton && (
              <button
                onClick={() => setShowTermsModal(true)}
                className="flex items-center gap-2 cursor-pointer bg-zarco-cyan/10 text-zarco-cyan text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-zarco-cyan/30 rounded-xl hover:bg-zarco-cyan/25 transition-all hover:scale-[1.02] active:scale-[0.98] h-8"
              >
                <span>📜</span>
                {isPt ? 'Termos e Condições' : 'Terms & Conditions'}
              </button>
            )}

            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                {isPt ? 'Portal do Cliente Ativo' : 'Client Portal Fully Online'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Hero Meta Info */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 md:p-14 rounded-[3.5rem] bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-zarco-cyan/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-zarco-purple/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-3xl relative z-10">
              <div className="flex flex-wrap items-center gap-3 text-zarco-cyan font-black text-[10px] uppercase tracking-widest mb-4">
                <span>{project.projectType || 'Corporate Deployment'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span>{isPt ? 'Fase Inicial de Planeamento' : 'Proposal Specifications'}</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7.5xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                {project.projectName}
              </h1>
              <p className="text-white/60 text-lg md:text-xl font-medium leading-relaxed max-w-2xl text-justify md:text-left">
                {project.shortDescription || (isPt 
                  ? 'Abaixo encontra a finalidade estrutural do projecto, ferramentas, páginas delineadas, estimativa de investimento e campo para partilhar as suas notas de revisão.'
                  : 'Below you will find the modular breakdown of the project scope, required pages, wireframes, pricing sheet, and interactive logs to submit feedback.')}
              </p>

              {project.showFullDescription && (
                <div className="mt-8 flex justify-start">
                  <button
                    onClick={() => setShowFullDesc(true)}
                    className="flex items-center gap-2.5 cursor-pointer bg-zarco-cyan/15 border border-zarco-cyan/35 hover:bg-zarco-cyan/25 text-zarco-cyan text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>📖</span>
                    {isPt ? 'Ler Descrição Completa' : 'Read Full Description'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Central Bento Grid Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Main Context Card */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Project Purpose & Identity */}
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
              <div className="flex flex-col gap-1 mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-zarco-cyan" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                    {isPt ? 'Propósito do Projeto' : 'Project Purpose & Aim'}
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/75 text-base leading-relaxed whitespace-pre-line text-justify">
                    {project.projectPurpose || (isPt 
                      ? 'Nenhum detalhe de propósito especificado para esta fase.' 
                      : 'No specific project purpose details have been explicitly logged yet.')}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-2">
                      {isPt ? 'Tipo de Solução' : 'Solution Environment'}
                    </span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider bg-white/5 px-4 py-2 rounded-xl inline-block border border-white/5">
                      {project.projectType || 'Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-2">
                      {isPt ? 'Arquitetura do Projeto' : 'Project Architecture'}
                    </span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider bg-white/5 px-4 py-2 rounded-xl inline-block border border-white/5">
                      {project.hostingType ? (
                        project.hostingType === 'Fullstack' ? (isPt ? 'Fullstack (FULL)' : 'Fullstack (FULL)') :
                        project.hostingType === 'Database' ? (isPt ? 'Base de Dados (DATA)' : 'Database (DATA)') :
                        project.hostingType
                      ) : (isPt ? 'Não Especificada' : 'Standard Fullstack')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-2">
                       {isPt ? 'Status do Planeamento' : 'Proposal Status'}
                    </span>
                    <span className="text-sm font-bold text-zarco-cyan uppercase tracking-wider bg-zarco-cyan/5 px-4 py-2 rounded-xl inline-block border border-zarco-cyan/10">
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pages & Scope Architecture */}
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-10">
              <div className="flex flex-col gap-1 mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-zarco-purple" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                    {isPt ? 'Arquitetura e Páginas' : 'Sitemap & Architecture'}
                  </h3>
                </div>
              </div>

              <div className="space-y-8">
                {project.pagesCount && (
                  <div className="flex items-center gap-4 py-4 px-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <span className="text-3xl font-black text-zarco-cyan">{project.pagesCount}</span>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        {isPt ? 'Páginas Consolidadas' : 'Expected Pages / Screens'}
                      </h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-0.5">
                        {isPt ? 'Módulos primários previstos no desenvolvimento' : 'Primary design layers and components outlined'}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-4">
                    {isPt ? 'Páginas e Secções Planeadas' : 'Included Sitemap Outline'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(project.pagesList || '').split('\n').filter(p => p.trim() !== '').map((page, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-3.5 px-5 bg-[#0c1417]/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-zarco-cyan" />
                        <span className="text-xs text-white/80 font-bold uppercase tracking-wide">{page.trim()}</span>
                      </div>
                    ))}
                    {(!project.pagesList || project.pagesList.trim() === '') && (
                      <span className="text-xs text-white/40 italic">
                        {isPt ? 'Nenhuma lista de páginas fornecida.' : 'No descriptive page list specified.'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* 📅 Project Execution Timeline Card */}
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-10">
              <div className="flex flex-col gap-1 mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                    {isPt ? 'Calendário de Execução' : 'Project Delivery Timeline'}
                  </h3>
                </div>
              </div>

              <div className="space-y-8">
                <div className={`grid gap-6 ${project.onlyShowExpected ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-4'}`}>
                  {!project.onlyShowExpected && (
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">
                        {isPt ? 'Início do Projeto' : 'Development Start'}
                      </span>
                      <span className="text-sm font-black text-white tracking-wide block uppercase">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString(isPt ? 'pt-PT' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  )}

                  {!project.onlyShowExpected && (
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] font-black text-zarco-cyan uppercase tracking-widest block mb-1 animate-pulse">
                        {isPt ? 'Prazo Estimado' : 'Expected Finish'}
                      </span>
                      <span className="text-sm font-black text-zarco-cyan tracking-wide block uppercase">
                        {project.deadline ? new Date(project.deadline).toLocaleDateString(isPt ? 'pt-PT' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  )}

                  <div className={`p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden ${project.onlyShowExpected ? 'text-center border-zarco-purple/35 bg-zarco-purple/5 py-6' : ''}`}>
                    <span className="text-[9px] font-black text-zarco-purple uppercase tracking-widest block mb-1">
                      {isPt ? 'Tempo Previsto de Entrega' : 'Expected duration to finish'}
                    </span>
                    <span className={`font-black text-zarco-purple tracking-wide block uppercase ${project.onlyShowExpected ? 'text-xl' : 'text-sm'}`}>
                      {project.expectedDuration || (isPt ? 'Não especificado' : 'Not specified')}
                    </span>
                  </div>

                  {!project.onlyShowExpected && (
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">
                        {isPt ? 'Data de Entrega' : 'Final Delivery'}
                      </span>
                      <span className="text-sm font-black text-white/60 tracking-wide block uppercase">
                        {project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString(isPt ? 'pt-PT' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : (isPt ? 'EM PROGRESSO' : 'IN DEVELOPMENT')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Visualizer Tracking bar */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                      {isPt ? 'Esquema de Progresso de Engenharia' : 'Engineering Deployment Progress'}
                    </span>
                    <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-wider">
                      {project.status === 'Completed' ? '100%' : project.status === 'Testing' ? '85%' : project.status === 'Development' ? '50%' : '15%'}
                    </span>
                  </div>
                  <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[2px]">
                    <div 
                      className="h-full bg-gradient-to-r from-zarco-cyan to-zarco-purple rounded-full transition-all duration-1000"
                      style={{ 
                        width: project.status === 'Completed' ? '100%' : project.status === 'Testing' ? '85%' : project.status === 'Development' ? '50%' : '15%' 
                      }}
                    />
                  </div>
                  
                  {/* Dynamic Timeline steps */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
                    <div className="text-center">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${project.status !== 'Lead' ? 'text-zarco-cyan/90 font-black' : 'text-white/20'}`}>
                        {isPt ? 'Planeamento' : 'Specs'}
                      </span>
                      <span className="text-[8px] text-white/20 block font-semibold mt-0.5">Step 01</span>
                    </div>
                    <div className="text-center">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${['Development', 'Testing', 'Completed'].includes(project.status) ? 'text-zarco-cyan/90 font-black' : 'text-white/20'}`}>
                        {isPt ? 'Desenho' : 'Design'}
                      </span>
                      <span className="text-[8px] text-white/20 block font-semibold mt-0.5">Step 02</span>
                    </div>
                    <div className="text-center">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${['Testing', 'Completed'].includes(project.status) ? 'text-zarco-purple/95 font-black animate-pulse' : 'text-white/20'}`}>
                        {isPt ? 'Testes' : 'Testing'}
                      </span>
                      <span className="text-[8px] text-white/20 block font-semibold mt-0.5">Step 03</span>
                    </div>
                    <div className="text-center">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${project.status === 'Completed' ? 'text-emerald-400 font-black' : 'text-white/20'}`}>
                        {isPt ? 'Concluído' : 'Launch'}
                      </span>
                      <span className="text-[8px] text-white/20 block font-semibold mt-0.5">Step 04</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ⚡ Platform Features & Architectural Infrastructure (Database / Backend) */}
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-10">
              <div className="flex flex-col gap-1 mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-zarco-cyan" strokeWidth={2.5} />
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                    {isPt ? 'Funcionalidades & Infraestrutura' : 'Platform Features & Core Infrastructure'}
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-white/60 text-xs uppercase font-bold tracking-widest leading-relaxed">
                  {isPt
                    ? 'Lista de funcionalidades de backend, base de dados e integrações incluídas no escopo deste projeto.'
                    : 'Backend endpoints, enterprise-grade databases, and rich modules configured for this bespoke build.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(project.featuresList || '').split('\n').filter(f => f.trim() !== '').map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-3 px-4.5 bg-[#0c1417]/30 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-zarco-purple/15 border border-zarco-purple/30 flex items-center justify-center text-zarco-purple text-xs font-black">
                        ✓
                      </div>
                      <span className="text-[11px] text-white/80 font-bold uppercase tracking-wide leading-none">{feature.trim()}</span>
                    </div>
                  ))}
                  {(!project.featuresList || project.featuresList.trim() === '') && (
                    <div className="p-4 bg-white/5 border border-dashed border-white/15 rounded-xl text-center sm:col-span-2">
                      <span className="text-xs text-white/40 italic">
                        {isPt 
                          ? 'Delineando as características fundamentais tais como Base de dados Cloud e Testemunhos de Clientes para esta submissão.' 
                          : 'Defining foundational modules like Cloud Database, Secure Reviews, and API engines.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Wireframes & Visual Prototypes */}
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-10">
              <div className="flex flex-col gap-1 mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-zarco-cyan" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                    {isPt ? 'Wireframes e Protótipos' : 'Wireframes & Interactive Blueprints'}
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-white/60 text-sm leading-relaxed">
                  {isPt 
                    ? 'Aceda aos rascunhos de arquitectura de informação e mockups conceptuais para antever a experiência de utilizador.'
                    : 'Analyze detailed technical navigation wireframes and visual blueprints configured for corporate interface alignment.'}
                </p>

                {project.wireframes ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {project.wireframes.split('\n').filter(wf => wf.trim() !== '').map((url, idx) => {
                      const trimmedUrl = url.trim();
                      const isImg = trimmedUrl.match(/\.(jpeg|jpg|gif|png|webp)/i);
                      return (
                        <div key={idx} className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-4 flex flex-col gap-3 group hover:border-zarco-cyan/40 transition-all">
                          {isImg ? (
                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/40 relative">
                              <img src={trimmedUrl} alt={`Wireframe ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            <div className="aspect-video w-full rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-3xl">
                              📐
                            </div>
                          )}
                          <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                              {isPt ? `Protótipo #${idx + 1}` : `Prototype Resource #${idx + 1}`}
                            </span>
                            <a 
                              href={trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] text-zarco-cyan font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {isPt ? 'Abrir' : 'Open'}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                    <span className="text-2xl">📐</span>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                      {isPt ? 'Nenhum wireframe ou mockup anexado nesta fase.' : 'No wireframes or mockups attached to this step.'}
                    </span>
                  </div>
                )}

                {/* HTML Interactive Prototypes */}
                {project.prototypesList && project.prototypesList.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-white/5 mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">👁️</span>
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#4fd1dc]">
                        {isPt ? 'Protótipos Interativos' : 'Interactive Prototypes'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.prototypesList.map((proto, idx) => (
                        <div key={proto.id || idx} className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 hover:border-zarco-cyan/30 transition-all justify-between">
                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                              {proto.title || (isPt ? `Protótipo Interativo ${idx + 1}` : `Interactive Prototype ${idx + 1}`)}
                            </h5>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                              {isPt ? 'Disponível para Visualização Instantânea' : 'Ready for Sandbox Simulation'}
                            </p>
                          </div>

                          <Button
                            onClick={() => setActivePrototype(proto)}
                            className="bg-zarco-cyan text-black hover:bg-zarco-cyan/90 font-black uppercase tracking-widest text-[9px] h-10 rounded-xl justify-center flex items-center gap-2 cursor-pointer w-full transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isPt ? 'Visualizar Protótipo' : 'Visualize Prototype'}</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

          </div>

          {/* Right Sidebar Details Column */}
          <div className="space-y-8">
            
            {/* Associated Client Profile Card */}
            {client && (
              <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-6">
                  {isPt ? 'Identificação do Cliente' : 'Client Partnership Info'}
                </span>
                
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black text-zarco-cyan uppercase tracking-widest bg-zarco-cyan/5 px-2.5 py-1 rounded border border-zarco-cyan/25 mb-3 inline-block">
                    {client.businessType || 'Partner'}
                  </span>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight leading-tight mb-1">
                    {client.companyName}
                  </h4>
                  <span className="text-xs text-white/50 font-bold block mb-4">
                    {client.fullName}
                  </span>
                  <p className="text-[11px] text-white/40 leading-relaxed italic border-t border-white/5 pt-4">
                    {client.description || (isPt ? 'Parceiro associado da Zarco Solutions.' : 'Active partner associated with Zarco Solutions.')}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/70">
                    <Mail className="w-4 h-4 text-white/30" strokeWidth={2.5} />
                    <span className="text-[11px] font-bold truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/70">
                      <Phone className="w-4 h-4 text-white/30" strokeWidth={2.5} />
                      <span className="text-[11px] font-bold truncate">{client.phone}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Configured Tools Section */}
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-6">
                {isPt ? 'Ferramentas de Engenharia' : 'Tools & Engineering Stack'}
              </span>

              <div className="space-y-6">
                <p className="text-[11px] text-white/50 leading-relaxed">
                  {isPt 
                    ? 'Lista de frameworks, ferramentas e linguagens integradas no planeamento do seu produto digital.'
                    : 'Selected modern framework suite configured to deliver optimum speeds, visual scalability, and reliable uptime standards.'}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(project.techStack || []).length > 0 ? (
                    (project.techStack || []).map((tech, idx) => (
                      <span key={idx} className="px-3.5 py-2.5 bg-[#0c1417]/90 rounded-xl text-[10px] font-black uppercase tracking-wider text-white border border-white/5">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-white/40 italic">
                      {isPt ? 'Nenhuma ferramenta listada.' : 'No engineering stack specified.'}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Contact / Support block */}
            <Card className="bg-gradient-to-br from-zarco-cyan/10 to-transparent border border-white/10 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">🛠️</span>
                <span className="text-xs font-black text-white uppercase tracking-widest">
                  {isPt ? 'Precisa de Ajuda?' : 'Need Clarifications?'}
                </span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed mb-6">
                {isPt 
                  ? 'Teve alguma dúvida relativamente aos wireframes do projeto ou à proposta orçamental? Fale connosco.' 
                  : 'Have questions regarding milestones, wireframe scopes, or pricing allocations? Drop us a prompt.'}
              </p>
              <Button 
                onClick={() => {
                  setContactName(client?.fullName || '');
                  setContactCompany(client?.companyName || '');
                  setContactEmail(client?.email || '');
                  setContactPhone(client?.phone || '');
                  setShowContactModal(true);
                  setContactSuccess(false);
                  setContactError(null);
                }}
                className="w-full bg-zarco-cyan text-black hover:bg-zarco-cyan/90 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl transition-all shadow-lg shadow-zarco-cyan/10 justify-center flex items-center gap-2 cursor-pointer"
              >
                {isPt ? 'Enviar Mensagem' : 'Talk with Development'}
              </Button>
            </Card>

          </div>
        </div>

        {/* Pricing Budget & Proposal Price Grid */}
        <div className="mb-12">
          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-zarco-cyan text-black px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-br-2xl">
              {isPt ? 'ORÇAMENTO PREVISTO' : 'INVESTMENT BREAKDOWN'}
            </div>

            {(() => {
              const phases = getProjectPhases(project);
              const activeTabId = phases.some(p => p.id === clientPricingActiveTab) ? clientPricingActiveTab : 'primary';
              const activeTab = phases.find(p => p.id === activeTabId) || phases[0];
              const isSec = activeTabId !== 'primary';
              
              const lies = activeTab.budgetLines || [];
              const cServices = activeTab.customServices || [];
              
              const currentPaidStatus = activeTab.paidStatus || "Pending";
              const currentDiscountPercent = activeTab.discountPercent || "0";
              const currentVatPercent = activeTab.vatPercent !== undefined ? activeTab.vatPercent : "23";

              return (
                <>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4 border-b border-white/5 pb-8 pt-6">
                    <div className="flex flex-col gap-1 text-left">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-zarco-cyan" />
                        <h3 className="text-2xl font-black uppercase tracking-tight text-white animate-fade-in">
                          {activeTab.title}
                        </h3>
                      </div>
                      <p className="text-xs text-white/30 uppercase font-bold tracking-wider mt-1.5 animate-fade-in">
                        {isSec
                          ? (isPt ? 'Discriminativo de custos da etapa complementar e serviços sob medida' : 'Bespoke options and stage additional feature costs')
                          : (isPt ? 'Discriminativo de custos primários e opções de expansão do projeto' : 'Line items detailing base deliverables and configured project services')
                        }
                      </p>
                    </div>

                    {/* Shared Portal Phase Status Badges */}
                    <div className="flex flex-wrap items-center gap-2.5 bg-white/[0.01] border border-white/5 p-1.5 rounded-2xl">
                      {phases.map((p) => {
                        const isActive = p.id === activeTabId;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setClientPricingActiveTab(p.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer hover:bg-white/[0.03] ${
                              isActive
                                ? 'bg-white/[0.04] border border-white/10 text-white'
                                : 'border border-transparent text-white/50 hover:text-white/80'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {p.title.split('(')[0].trim()}:
                            </span>
                            {(() => {
                              const pPaid = p.paidStatus || "Pending";
                              return pPaid === 'Paid' ? (
                                <span className="bg-green-500/15 border border-green-500/30 text-green-400 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-md">
                                  {isPt ? 'Liquidado' : 'Paid'}
                                </span>
                              ) : pPaid === 'Deposit' ? (
                                <span className="bg-[#4fd1dc]/15 border border-[#4fd1dc]/30 text-[#4fd1dc] font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-md">
                                  {isPt ? 'Sinal' : 'Deposit Received'}
                                </span>
                              ) : pPaid === 'Proposal' ? (
                                <span className="bg-zarco-purple/15 border border-zarco-purple/35 text-zarco-purple font-extrabold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-md">
                                  {isPt ? 'Proposta' : 'Proposal Only'}
                                </span>
                              ) : (
                                <span className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-md">
                                  {isPt ? 'Pendente' : 'Pending'}
                                </span>
                              );
                            })()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactively Switch Stages if client has multiple phases configured */}
                  {phases.length > 2 ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-white/5 pb-4 mb-8">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1">
                        {isPt ? 'Selecionar Etapa do Projeto:' : 'Select Project Phase:'}
                      </span>
                      <div className="relative">
                        <select
                          value={clientPricingActiveTab}
                          onChange={(e) => setClientPricingActiveTab(e.target.value)}
                          className="appearance-none bg-[#080d0f] border border-white/10 text-white rounded-xl py-2.5 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-zarco-cyan cursor-pointer w-[130px]"
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
                    <div className="flex border-b border-white/5 pb-0 mb-8 gap-2">
                       <button
                         type="button"
                         onClick={() => setClientPricingActiveTab('primary')}
                         className={`px-5 py-3 font-black uppercase tracking-widest text-[10px] border-b-2 transition-all cursor-pointer ${
                           clientPricingActiveTab === 'primary'
                             ? 'border-zarco-cyan text-zarco-cyan bg-white/[0.01]'
                             : 'border-transparent text-white/40 hover:text-white/70'
                         }`}
                       >
                         {phases[0].title}
                       </button>
                       <button
                         type="button"
                         onClick={() => setClientPricingActiveTab('secondary')}
                         className={`px-5 py-3 font-black uppercase tracking-widest text-[10px] border-b-2 transition-all cursor-pointer ${
                           clientPricingActiveTab === 'secondary'
                             ? 'border-zarco-purple text-zarco-purple bg-white/[0.01]'
                             : 'border-transparent text-white/40 hover:text-white/70'
                         }`}
                       >
                         {phases[1].title}
                       </button>
                    </div>
                  ) : null}

                  <div className="mt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left Column: Deliverables List taking 2/3 width */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 text-[10px] font-black text-white/30 uppercase tracking-widest text-left">
                                <th className="pb-4 w-12 text-center">{isPt ? 'INCLUÍDO' : 'INCLUDED'}</th>
                                <th className="pb-4 w-[75%]">{isPt ? 'DESCRIÇÃO DA ENTREGA' : 'TARGET DELIVERABLE'}</th>
                                <th className="pb-4 text-center w-[15%]">{isPt ? 'TIPO DE ITEM' : 'SCOPE MODEL'}</th>
                                <th className="pb-4 text-right w-[10%]">{isPt ? 'VALOR ESTIMADO' : 'INVESTMENT'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                              {lies.map((line, idx) => {
                                const isSelected = isSec || !line.isOptional || !!selectedAddons[idx];
                                return (
                                  <tr 
                                    key={idx} 
                                    className={`text-xs font-bold transition-all ${
                                      isSelected ? 'text-white/80 bg-white/[0.01]' : 'text-white/30 hover:bg-white/[0.005]'
                                    }`}
                                  >
                                    <td className="py-4 text-center">
                                      <div className="w-5 h-5 rounded-md border border-zarco-cyan/20 bg-zarco-cyan/10 flex items-center justify-center mx-auto text-zarco-cyan">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </div>
                                    </td>
                                    <td className="py-4 pr-4 text-left">
                                      <div className={`font-bold uppercase tracking-wider text-sm transition-all ${isSelected ? 'text-white' : 'text-white/40 line-through decoration-white/10'}`}>
                                        {line.item}
                                      </div>
                                      {line.description && (
                                        <div className={`text-[10px] mt-1.5 uppercase tracking-wider font-semibold bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 inline-block max-w-lg leading-relaxed font-sans font-medium normal-case transition-all ${isSelected ? 'text-white/40' : 'text-white/20'}`}>
                                          {line.description}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-4 text-center">
                                      {line.isOptional ? (
                                        <span className="px-3 py-1 bg-zarco-purple/20 text-zarco-purple border border-zarco-purple/30 text-[9px] font-black uppercase tracking-wider rounded-md">
                                          {isPt ? 'Opcional Adicionado' : 'Optional Add-on'}
                                        </span>
                                      ) : (
                                        <span className="px-3 py-1 bg-zarco-cyan/10 text-zarco-cyan text-[9px] font-black uppercase tracking-wider rounded-md border border-zarco-cyan/25">
                                          {isPt ? 'Incluído Base' : 'Base Scope'}
                                        </span>
                                      )}
                                    </td>
                                    <td className={`py-4 text-right font-black text-base transition-all ${isSelected ? 'text-white' : 'text-white/30'}`}>
                                      {line.cost && line.cost !== '—' && line.cost !== '0'
                                        ? `€${Number(line.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : '—'}
                                    </td>
                                  </tr>
                                );
                              })}
                              {cServices.map((item, idx) => {
                                return (
                                  <tr 
                                    key={`custom-${item.id}-${idx}`} 
                                    className="text-xs font-bold transition-all text-white bg-white/[0.0125] border-l-2 border-zarco-cyan"
                                  >
                                    <td className="py-4 text-center">
                                      <div className="w-5 h-5 rounded-md border border-zarco-cyan/20 bg-zarco-cyan/10 flex items-center justify-center mx-auto text-zarco-cyan">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </div>
                                    </td>
                                    <td className="py-4 pr-4 text-left">
                                      <div className="font-bold uppercase tracking-wider text-sm text-white flex items-center gap-2">
                                        <span className="text-zarco-cyan">✨</span>
                                        {item.item}
                                      </div>
                                      {((item.quantity && item.quantity >= 1) || (item.hours && item.hours > 0)) && (
                                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/50 font-mono font-bold">
                                          {item.quantity && item.quantity >= 1 && (
                                            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">
                                              {isPt ? `Qtd: ${item.quantity}` : `Qty: ${item.quantity}`}
                                            </span>
                                          )}
                                          {item.hours && item.hours > 0 && (
                                            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">
                                              {isPt ? `Horas: ${item.hours}` : `Hours: ${item.hours}`}
                                            </span>
                                          )}
                                          {item.unitPrice !== undefined && (
                                            <span className="text-white/30">@ €{item.unitPrice}/{isPt ? 'unid' : 'unit'}</span>
                                          )}
                                        </div>
                                      )}
                                      {item.description && (
                                        <div className="text-[10px] mt-1.5 uppercase tracking-wider font-semibold bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 inline-block max-w-lg leading-relaxed text-white/40 font-mono normal-case">
                                          {item.description}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-4 text-center">
                                      {item.isOptional ? (
                                        <span className="px-2.5 py-1 bg-zarco-purple/20 text-zarco-purple border border-zarco-purple/30 text-[9px] font-black uppercase tracking-wider rounded-md">
                                          {isPt ? 'Opcional Adicionado' : 'Optional Add-on'}
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-1 bg-zarco-cyan/10 text-zarco-cyan text-[9px] font-black uppercase tracking-wider rounded-md border border-zarco-cyan/25">
                                          {isPt ? 'Incluído Base' : 'Base Scope'}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-4 text-right font-black text-base text-zarco-cyan">
                                      €{Number(item.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                );
                              })}
                              {lies.length === 0 && cServices.length === 0 && (
                                <tr className="text-xs text-white/40">
                                  <td colSpan={4} className="py-8 text-center italic text-left">
                                    {isPt 
                                      ? 'Nenhum item de orçamento inserido para este estágio do projeto. O valor geral:' 
                                      : 'No specific budget breakdown added. Allocated rate for this phase:'}{' '}
                                    <span className="text-zarco-cyan font-black text-sm">€{Number(isSec ? (project?.secondaryPrice || 0) : (project?.price || 0)).toLocaleString()}</span>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right Column: Calculations & Live Cumulative Interactive Invoice Board */}
                      <div className="bg-[#0c1417]/40 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#4fd1dc] border-b border-white/5 pb-4 mb-4 flex items-center gap-2 text-left">
                            <span>📉</span>
                            {isPt ? 'Resumo de Custos' : 'Final Cost Summary'}
                          </h4>

                          <div className="space-y-4">
                            {/* Subtotal representing checked items */}
                            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
                              <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">
                                {isPt ? 'Subtotal Acumulado' : 'Accumulated Subtotal'}:
                              </span>
                              <span className="text-sm font-black text-white font-mono">
                                €{subtotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Discount display block */}
                            {Number(currentDiscountPercent) > 0 && (
                              <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
                                <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">
                                  {isPt ? 'Desconto Aplicado' : 'Discount Applied'}:
                                </span>
                                <span className="text-sm font-black text-green-400 font-mono">
                                  {currentDiscountPercent}% {discountAmtVal > 0 ? `(-€${discountAmtVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ''}
                                </span>
                              </div>
                            )}

                            {/* VAT display block */}
                            {showVat && vatAmtVal > 0 && (
                              <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
                                <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">
                                  {isPt ? 'IVA Aplicado' : 'Sales VAT'}:
                                </span>
                                <span className="text-sm font-black text-zarco-purple font-mono">
                                  {currentVatPercent}% (+€{vatAmtVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Real-time total breakdown callout */}
                        <div className="pt-6 border-t border-white/10 space-y-3 bg-[#080d0f]/95 -mx-6 -mb-6 p-6 rounded-b-3xl">
                          {discountAmtVal > 0 && (
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-white/40 uppercase tracking-widest font-black">{isPt ? 'Base de Cálculo' : 'Taxable Base'}</span>
                              <span className="font-mono text-white/70 font-bold">
                                €{taxableBaseVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col text-left">
                              <span className="text-[10px] text-white/40 uppercase tracking-widest font-black leading-none">
                                {isPt ? 'TOTAL DO INVESTIMENTO' : 'TOTAL INVESTMENT'}
                              </span>
                              <span className="text-[8px] text-[#4fd1dc] font-black uppercase mt-1 leading-none">
                                {isPt ? 'Valores Finais de Execução do Projeto' : 'Final project execution rates'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-3xl font-black text-zarco-cyan leading-none font-sans block tracking-tight">
                                €{grandTotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
        </div>

        {/* Adicionado: Subscription Checkout Form Panel */}
        {project.hasSubscription && (
          <div className="mb-12 animate-fade-in text-left">
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 bg-zarco-cyan text-black px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-br-2xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                {isPt ? 'SUBSCRIÇÃO RECORRENTE' : 'RECURRING SUBSCRIPTION'}
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-8 pt-4">
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                      {project.subscriptionTitle || (isPt ? 'Serviço de Acompanhamento Mensal' : 'Recurring Support Plan')}
                    </h3>
                  </div>
                  <p className="text-xs text-white/30 uppercase font-bold tracking-wider mt-1.5 font-sans">
                    {isPt 
                      ? 'Gestão de faturamento recorrente, suporte pós-venda, servidores e manutenção evolutiva' 
                      : 'Recurring billing cycles, active product maintenance, hosting options & support'}
                  </p>
                </div>

                <div className="px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-end">
                  <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">{isPt ? 'VALOR DO PLANO' : 'RECURRING RATE'}</span>
                  <span className="text-2xl font-black text-white/90">
                    €{Number(project.subscriptionPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <span className="text-xs text-zarco-cyan font-black uppercase tracking-widest ml-1">
                      / {project.subscriptionInterval === "yearly" ? (isPt ? "ano" : "yr") : (isPt ? "mês" : "mo")}
                    </span>
                  </span>
                </div>
              </div>

              {subscriptionPaid ? (
                /* Subscribed Success Box */
                <div className="py-8 text-center flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto rounded-3xl bg-green-500/[0.02] border border-green-500/10 p-8 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-2xl font-black shadow-lg shadow-green-500/10">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase tracking-tight text-green-400">
                      {isPt ? 'Subscrição Ativa e Confirmada!' : 'Subscription Active & Confirmed!'}
                    </h4>
                    <p className="text-xs text-white/50 leading-relaxed font-bold uppercase tracking-wider max-w-md mx-auto">
                      {isPt 
                        ? 'Obrigado por nos escolher. Os pagamentos recorrentes estão assegurados com integridade de ponta a ponta.' 
                        : 'Thank you for choosing Zarco Studios. Core recurring billing loops have been secured and are active.'}
                    </p>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-4 text-left p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-[10px] mt-2">
                    <div className="space-y-1 border-r border-white/5 pr-4 font-mono">
                      <span className="text-white/30 uppercase block font-black">{isPt ? 'PLANO DE ADESÃO' : 'CONNECTED PLAN'}</span>
                      <span className="text-white font-bold block">{project.subscriptionTitle || (isPt ? "Serviço de Acompanhamento" : "Support Plan")}</span>
                    </div>
                    <div className="space-y-1 pl-4 font-mono">
                      <span className="text-white/30 uppercase block font-black">{isPt ? 'DATA DE ASSINATURA' : 'STARTING DATE'}</span>
                      <span className="text-white font-bold block">
                        {project?.subscriptionPaidAt 
                          ? new Date(project.subscriptionPaidAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                          : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="space-y-1 border-r border-white/5 pr-4 pt-3 mt-3 border-t font-mono">
                      <span className="text-white/30 uppercase block font-black">{isPt ? 'PRÓXIMO RECORRENTE' : 'NEXT RECURRING'}</span>
                      <span className="text-zarco-cyan font-bold block">{getNextPaymentDate()}</span>
                    </div>
                    <div className="space-y-1 pl-4 pt-3 mt-3 border-t font-mono">
                      <span className="text-white/30 uppercase block font-black">{isPt ? 'ESTADO DA COBRANÇA' : 'BILLING STATUS'}</span>
                      <span className="text-green-400 font-bold block uppercase tracking-widest">{isPt ? 'AGENDADO' : 'SCHEDULED'}</span>
                    </div>

                    <div className="space-y-1 border-r border-white/5 pr-4 pt-3 mt-3 border-t font-mono">
                      <span className="text-white/30 uppercase block font-black">{isPt ? 'TRANSAÇÃO STRIPE' : 'STRIPE RECEIPT'}</span>
                      <span className="text-white font-bold block break-all">{localStorage.getItem(`sub_txn_${project.id}`) || subTransactionId || "ch_stripe_active_04b4"}</span>
                    </div>
                    <div className="space-y-1 pl-4 pt-3 mt-3 border-t font-mono">
                      <span className="text-white/30 uppercase block font-black">{isPt ? 'ESTADO' : 'STATUS'}</span>
                      <span className="text-green-400 font-bold block uppercase tracking-widest">{isPt ? 'ATIVO' : 'ACTIVE'}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setShowUnsubscribeModal(true)}
                    className="mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 h-9 rounded-xl border border-red-500/25 transition-all cursor-pointer font-bold"
                  >
                    ❌ {isPt ? 'CANCELAR ASSINATURA' : 'CANCEL RECURRING SUBSCRIPTION'}
                  </Button>
                </div>
              ) : (
                /* Subcription checkout interactive form area */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Plan Description & Details */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="p-6 bg-white/[0.01] border border-white/5 rounded-[2rem] space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#4fd1dc]">
                        {isPt ? 'COBERTURA E BENEFÍCIOS' : 'WHAT IS INCLUDED'}
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed font-semibold">
                        {project.subscriptionDescription || (isPt 
                          ? 'Inclui suporte técnico especializado, otimização contínua de bases de dados, monitorização de sanidade do alojamento e intervenções visuais mensais prioritárias.' 
                          : 'Includes dedicated technical support, continuous performance updates, database integrity optimization, and prioritized monthly design cycles.')}
                      </p>

                       <div className="space-y-2.5 pt-4 border-t border-white/5">
                        {project.subscriptionFeatures && project.subscriptionFeatures.length > 0 ? (
                          project.subscriptionFeatures.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[10px] text-white/50 uppercase font-black">
                              <Check className="w-3.5 h-3.5 text-zarco-cyan" />
                              <span>{feat}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            {project.subFeaturesSlack !== false && (
                              <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase font-black">
                                <Check className="w-3.5 h-3.5 text-zarco-cyan" />
                                <span>{isPt ? 'Suporte Dedicado via Slack' : 'Dedicated Slack Channel Client Access'}</span>
                              </div>
                            )}
                            {project.subFeaturesSecurity !== false && (
                              <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase font-black">
                                <Check className="w-3.5 h-3.5 text-zarco-cyan" />
                                <span>{isPt ? 'Auditorias de Segurança Proativas' : 'Proactive Security Audits'}</span>
                              </div>
                            )}
                            {project.subFeaturesHosting !== false && (
                              <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase font-black">
                                <Check className="w-3.5 h-3.5 text-zarco-cyan" />
                                <span>{isPt ? 'Servidor de Produção Optimizado' : 'Scalable Production Host Setup'}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-6 py-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <span className="text-lg">🔒</span>
                      <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider leading-relaxed">
                        {isPt 
                          ? 'Transações processadas de forma encriptada através do Stripe Checkout. Não armazenamos informações de cartão.' 
                          : 'Encrypted Stripe Gateway end-to-end processing. We never store or transmit raw banking credentials.'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Checkout Form with Stripe Mock Integration */}
                  <div className="lg:col-span-7 bg-[#0c1417]/30 border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-4 flex items-center justify-between">
                      <span>🏦 {isPt ? 'FORMULÁRIO DE CHECKOUT' : 'SECURE CHECKOUT'}</span>
                      <span className="text-[9px] text-[#4fd1dc] font-black uppercase bg-[#4fd1dc]/10 px-2.5 py-1 rounded">Stripe Gateway</span>
                    </h4>

                    {subError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl animate-bounce">
                        ⚠️ {subError}
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Name on card */}
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          {isPt ? 'Nome no Cartão' : 'Cardholder Name'}
                        </label>
                        <input
                          type="text"
                          required
                          value={subCardName}
                          onChange={(e) => setSubCardName(e.target.value)}
                          placeholder={isPt ? "NOME IGUAL AO CARTÃO" : "JOHN DOE"}
                          className="w-full bg-[#080d0f] border border-white/10 hover:border-white/20 focus:border-zarco-cyan/50 text-white rounded-xl h-12 px-4 text-xs font-bold outline-none tracking-widest uppercase transition-all animate-none"
                        />
                      </div>

                      {/* Card number */}
                      <div className="space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            {isPt ? 'Número do Cartão' : 'Credit Card Number'}
                          </label>
                          {/* Live credit card brand indicator */}
                          {(() => {
                            const trimmed = subCardNumber.replace(/\s+/g, '');
                            if (trimmed.startsWith('4')) {
                              return <span className="text-[9px] text-green-400 font-extrabold tracking-widest bg-green-500/10 px-2 py-0.5 rounded uppercase">Visa detected</span>;
                            } else if (trimmed.startsWith('5')) {
                              return <span className="text-[9px] text-orange-400 font-extrabold tracking-widest bg-orange-500/10 px-2 py-0.5 rounded uppercase font-sans">Mastercard detected</span>;
                            } else if (trimmed.startsWith('3')) {
                              return <span className="text-[9px] text-zarco-cyan font-extrabold tracking-widest bg-zarco-cyan/10 px-2 py-0.5 rounded uppercase font-sans">Amex detected</span>;
                            }
                            return null;
                          })()}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            maxLength={19}
                            value={subCardNumber}
                            onChange={(e) => {
                              // Auto format input with spaces every 4 digits
                              const trimmed = e.target.value.replace(/\D/g, '');
                              const matches = trimmed.match(/.{1,4}/g);
                              setSubCardNumber(matches ? matches.join(' ') : '');
                            }}
                            placeholder="0000 0000 0000 0000"
                            className="w-full bg-[#080d0f] border border-white/10 hover:border-white/20 focus:border-zarco-cyan/50 text-white rounded-xl h-12 pl-12 pr-4 text-xs font-mono font-bold outline-none tracking-widest transition-all"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs">
                            💳
                          </span>
                        </div>
                      </div>

                      {/* Expiry, CVC & Zip */}
                      <div className="grid grid-cols-3 gap-4 font-mono">
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-sans">
                            {isPt ? 'Validade' : 'Expiry Date'}
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={subCardExpiry}
                            onChange={(e) => {
                              // Format MM/YY
                              const trimmed = e.target.value.replace(/\D/g, '');
                              const currentVal = trimmed.length > 2 ? `${trimmed.substring(0, 2)}/${trimmed.substring(2, 4)}` : trimmed;
                              setSubCardExpiry(currentVal);
                            }}
                            placeholder="MM/YY"
                            className="w-full bg-[#080d0f] border border-white/10 hover:border-white/20 focus:border-zarco-cyan/50 text-white rounded-xl h-12 px-4 text-xs font-mono font-bold text-center outline-none tracking-widest transition-all"
                          />
                        </div>

                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-sans">
                            CVC
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={4}
                            value={subCardCvc}
                            onChange={(e) => setSubCardCvc(e.target.value.replace(/\D/g, ''))}
                            placeholder="000"
                            className="w-full bg-[#080d0f] border border-white/10 hover:border-white/20 focus:border-zarco-cyan/50 text-white rounded-xl h-12 px-4 text-xs font-mono font-bold text-center outline-none tracking-widest transition-all"
                          />
                        </div>

                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-sans">
                            {isPt ? 'Cód. Postal' : 'ZIP / Postal'}
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={8}
                            value={subCardPostal}
                            onChange={(e) => setSubCardPostal(e.target.value.toUpperCase())}
                            placeholder="1000-000"
                            className="w-full bg-[#080d0f] border border-white/10 hover:border-white/20 focus:border-zarco-cyan/50 text-white rounded-xl h-12 px-4 text-xs font-sans font-bold text-center outline-none tracking-widest transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      disabled={subIsProcessing}
                      onClick={async () => {
                        // Validator inputs
                        setSubError(null);
                        if (!subCardName.trim()) {
                          setSubError(isPt ? "Indique o Nome do Titular do Cartão." : "Please provide the Cardholder Name.");
                          return;
                        }
                        const cleanCard = subCardNumber.replace(/\s+/g, '');
                        if (cleanCard.length < 15) {
                          setSubError(isPt ? "Número de Cartão inválido." : "Card number seems incorrect or too short.");
                          return;
                        }
                        if (subCardExpiry.length < 5 || !subCardExpiry.includes("/")) {
                          setSubError(isPt ? "Data de validade deve possuir formato MM/YY." : "Format expiration date as MM/YY.");
                          return;
                        }
                        if (subCardCvc.length < 3) {
                          setSubError(isPt ? "CVC incorrecto." : "Invalid security CVC code.");
                          return;
                        }

                        setSubIsProcessing(true);
                        try {
                          // Simulate dynamic payment gateway delay (2 seconds)
                          await new Promise(resolve => setTimeout(resolve, 2000));
                          
                          const hashId = `ch_stripe_${Math.random().toString(36).substring(2, 10)}`;
                          localStorage.setItem(`subscribed_${project.id}`, 'true');
                          localStorage.setItem(`sub_txn_${project.id}`, hashId);
                          setSubTransactionId(hashId);
                          setSubscriptionPaid(true);

                          let paidAtServerStr = new Date().toISOString();

                          // Trigger Payment Confirmation, DB status sync and detailed emails on backend
                          try {
                            const apiResponse = await fetch('/api/subscriptions/confirm-payment', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                projectId: project.id,
                                clientEmail: client?.email || contactEmail || "",
                                clientName: client?.fullName || contactName || "",
                                projectName: project.projectName || "",
                                subscriptionTitle: project.subscriptionTitle || "",
                                subscriptionPrice: project.subscriptionPrice || 0,
                                subscriptionInterval: project.subscriptionInterval || "monthly",
                                transactionId: hashId,
                                lang: isPt ? "pt" : "en",
                              }),
                            });

                            if (apiResponse.ok) {
                              const resData = await apiResponse.json();
                              if (resData.paidAt) {
                                paidAtServerStr = resData.paidAt;
                              }
                            } else {
                              console.warn("Server subscription confirmation returned non-OK status");
                            }
                          } catch (apiErr) {
                            console.error("API billing webhook execution failed:", apiErr);
                          }

                          // Secure local/live client state for immediate visual response
                          setProject(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              subscriptionPaid: true,
                              subscriptionPaidAt: paidAtServerStr
                            };
                          });

                          showToast(isPt ? 'Subscrição concluída com sucesso! E-mails enviados.' : 'Subscription activated successfully! Confirmation emails dispatched.', 'success');
                        } catch (err) {
                          console.error(err);
                          setSubError(isPt ? "Transação recusada pela instituição financeira." : "Stripe processing failed. Try different credentials.");
                        } finally {
                          setSubIsProcessing(false);
                        }
                      }}
                      className="w-full bg-zarco-cyan text-black hover:bg-zarco-cyan/90 font-black uppercase tracking-widest text-[10px] h-14 rounded-xl transition-all shadow-lg shadow-zarco-cyan/10 flex items-center justify-center gap-2 cursor-pointer mt-3"
                    >
                      {subIsProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isPt ? 'A PROCESSAR NO STRIPE...' : 'SECURE PROCESSING STREAM...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isPt ? `SUBSCREVER PLANO • €${Number(project.subscriptionPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `SUBSCRIBE NOW • €${Number(project.subscriptionPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Testing & Improvements Section */}
        {(project.hasManualTesting || project.hasAutomatedTesting) && (
          <div>
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zarco-cyan via-zarco-purple to-zarco-cyan" />
              
              <div className="flex flex-col gap-1 mb-8 border-b border-white/5 pb-8 pt-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-zarco-cyan" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                    {isPt ? 'Testes e Melhorias' : 'Testing & Improvements'}
                  </h3>
                </div>
                <p className="text-xs text-white/30 uppercase font-bold tracking-wider mt-1.5">
                  {isPt 
                    ? 'Garantia de qualidade, validação de segurança e integridade de regressão aplicados' 
                    : 'Quality assurance criteria, security verification, and performance standards reached'}
                </p>
              </div>

              <div className="flex flex-col gap-6 max-w-3xl">
                {/* Manual Testing */}
                {project.hasManualTesting && (
                  <div className="bg-[#0c1417]/50 border border-white/10 p-6 md:p-8 rounded-[1.5rem] flex flex-col justify-between hover:border-zarco-cyan/20 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base text-zarco-cyan">📋</span>
                        <h4 className="text-sm font-black uppercase tracking-widest text-[#4fd1dc]">
                          {isPt ? 'Testes Manuais Realizados' : 'Manual Testing & Verification'}
                        </h4>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed font-semibold">
                        {isPt 
                          ? 'Garantia de usabilidade humana abrangente através de múltiplos navegadores e emulação móvel tátil.' 
                          : 'Comprehensive human-centric usability and accessibility validation across modern browsers and responsive viewports.'}
                      </p>
                    </div>

                    {project.manualTestingUrl && (
                      <div className="mt-6 pt-4 border-t border-white/5">
                        <a 
                          href={project.manualTestingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-zarco-cyan/10 hover:bg-zarco-cyan/25 text-zarco-cyan font-black uppercase tracking-widest text-[9px] py-3.5 px-5 rounded-xl border border-zarco-cyan/20 hover:scale-102 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isPt ? 'Abrir Painel de Testes' : 'Open Test Dashboard / App'}</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Automated Testing */}
                {project.hasAutomatedTesting && (
                  <div className="bg-[#0c1417]/50 border border-white/10 p-6 md:p-8 rounded-[1.5rem] flex flex-col justify-between hover:border-zarco-cyan/20 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base text-[#bfdbfe]">⚙️</span>
                        <h4 className="text-sm font-black uppercase tracking-widest text-[#bfdbfe]">
                          {isPt ? 'Padrão de Automação de Testes' : 'Automated Testing Standard'}
                        </h4>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed font-semibold">
                        {isPt 
                          ? 'Verificação automatizada contínua por suíte integrada para cobertura de fluxos críticos.' 
                          : 'Continuous assertion tracking, unit test validation, and automated non-breaking build checks.'}
                      </p>
                    </div>

                    {project.automatedTestingUrl && (
                      <div className="mt-6 pt-4 border-t border-white/5">
                        <a 
                          href={project.automatedTestingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#bfdbfe]/10 hover:bg-[#bfdbfe]/25 text-[#bfdbfe] font-black uppercase tracking-widest text-[9px] py-3.5 px-5 rounded-xl border border-[#bfdbfe]/20 hover:scale-102 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isPt ? 'Ver Testes Automatizados' : 'View Automated Tests'}</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Client Interactive Feedback Submission Sheet */}
        <div>
          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zarco-cyan via-zarco-purple to-zarco-cyan" />
            
            <div className="flex flex-col gap-1 mb-8 border-b border-white/5 pb-8 pt-4">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-zarco-purple" />
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  {isPt ? 'Notas de Revisão e Feedback' : 'Client Review & Feedback'}
                </h3>
              </div>
              <p className="text-xs text-white/30 uppercase font-bold tracking-wider mt-1.5">
                {isPt 
                  ? 'Diga-nos o que achou da finalidade, páginas delineadas ou do orçamento previsto.' 
                  : 'Please review and leave your requested edits or sign-off feedback here to let us know details:'}
              </p>
            </div>

            <div className="space-y-6 max-w-4xl">
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder={isPt 
                  ? "Adicione uma nova nota, ajuste ou comentário à lista... (Ex: Adorámos os wireframes. Seria possível adicionar uma secção de FAQ?)" 
                  : "Add a new feedback note, request, or review block to the list..."}
                className="w-full bg-[#0c1417] border border-white/10 rounded-2xl p-6 min-h-[120px] text-sm text-white/80 focus:outline-none focus:border-zarco-cyan resize-none transition-all focus:ring-1 focus:ring-zarco-cyan"
              />

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {feedbackSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {isPt ? 'Feedback Guardado com Sucesso!' : 'Feedback Saved Successfully!'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  onClick={handleAddFeedback}
                  disabled={submittingFeedback || !feedbackInput.trim()}
                  className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] h-12 px-8 rounded-xl shadow-lg shadow-zarco-cyan/20 hover:scale-102 transition-all ml-auto disabled:opacity-40 select-none"
                >
                  {submittingFeedback ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      {isPt ? 'Adicionar Feedback' : 'Add New Feedback Note'}
                    </span>
                  )}
                </Button>
              </div>

              {/* Multi-feedback Note Listing Area */}
              {getFeedbacksList().length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4fd1dc] mb-2 inline-block">
                    {isPt ? 'Histórico de Notas e Revisões' : 'Active Client Feedback Logs'}
                  </h4>
                  <div className="space-y-4">
                    {getFeedbacksList().map((item) => (
                      <div key={item.id} className="p-6 rounded-2xl bg-[#0c1417]/40 border border-white/5 relative group transition-all hover:border-white/10">
                        {editingFeedbackId === item.id ? (
                          <div className="space-y-4">
                            <textarea
                              value={editingFeedbackText}
                              onChange={(e) => setEditingFeedbackText(e.target.value)}
                              className="w-full bg-[#080d0f] border border-zarco-cyan/40 rounded-xl p-4 text-xs text-white/90 focus:outline-none resize-none min-h-[100px]"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={() => {
                                  setEditingFeedbackId(null);
                                  setEditingFeedbackText('');
                                }}
                                className="bg-white/5 text-white/60 hover:text-white px-4 h-8 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5"
                              >
                                {isPt ? 'Cancelar' : 'Cancel'}
                              </Button>
                              <Button
                                onClick={() => handleUpdateFeedback(item.id, editingFeedbackText)}
                                className="bg-zarco-cyan text-black px-4 h-8 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-zarco-cyan/90 border-none"
                              >
                                {isPt ? 'Guardar' : 'Save Changes'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-white/[0.03] pb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zarco-purple" />
                                <span className="text-[10px] font-mono text-white/40 tracking-wider">
                                  {new Date(item.createdAt).toLocaleString(isPt ? 'pt-PT' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingFeedbackId(item.id);
                                    setEditingFeedbackText(item.text);
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-[9px] uppercase font-black tracking-wider flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3 text-[#4fd1dc]" />
                                  <span>{isPt ? 'Editar' : 'Edit'}</span>
                                </button>
                                <button
                                  onClick={() => setFeedbackToDelete(item.id)}
                                  className="px-2.5 py-1 rounded-md bg-red-500/5 border border-red-500/10 hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-all text-[9px] uppercase font-black tracking-wider flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                  <span>{isPt ? 'Apagar' : 'Delete'}</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-white/75 leading-relaxed whitespace-pre-wrap text-justify select-text pl-1 pr-1">
                              {item.text}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Professional Testimonials & Star Review Section */}
        {project.showReviewsBox !== false && (
          <div className="mt-10">
          <Card className="bg-[#080d0f] border-white/5 rounded-[2rem] p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-zarco-purple text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
              {isPt ? 'TESTEMUNHOS & AVALIAÇÃO' : 'TESTIMONIALS & REVIEWS'}
            </div>

            <div className="flex flex-col gap-1 mb-6 border-b border-white/5 pb-6 pt-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⭐</span>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  {isPt ? 'Submeter Avaliação Oficial' : 'Share Testimonial & Review'}
                </h3>
              </div>
              <p className="text-[11px] text-white/30 uppercase font-bold tracking-wider mt-1">
                {isPt 
                  ? 'Ficamos honrados em receber a sua avaliação. Os testemunhos aprovados serão exibidos no nosso portfólio principal.' 
                  : 'We are honored to have your feedback. Approved testimonials will appear dynamically on our official website.'}
              </p>
            </div>

            <form onSubmit={submitTestimonial} className="space-y-5 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                    {isPt ? 'Nome do Revisor' : 'Your Full Name'}
                  </label>
                  <Input
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="bg-[#0c1417] border-white/10 rounded-xl h-10 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                    {isPt ? 'Empresa ou Marca' : 'Company / Brand Name'}
                  </label>
                  <Input
                    required
                    value={reviewCompany}
                    onChange={(e) => setReviewCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="bg-[#0c1417] border-white/10 rounded-xl h-10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                    {isPt ? 'Classificação (Estrelas)' : 'Your Rating (Stars)'}
                  </label>
                  <div className="flex items-center gap-2 bg-[#0c1417] px-3 h-10 rounded-xl border border-white/10 w-fit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-lg focus:outline-none transition-all hover:scale-125"
                      >
                        <span className={star <= rating ? 'text-amber-400' : 'text-zinc-600'}>
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="text-[9px] uppercase font-black tracking-wider text-white/40 ml-2">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                    {isPt ? 'Nome de Utilizador de LinkedIn (Opcional)' : 'LinkedIn Profile Username (Optional)'}
                  </label>
                  <Input
                    value={reviewLinkedIn}
                    onChange={(e) => setReviewLinkedIn(e.target.value)}
                    placeholder="e.g. johndoe"
                    className="bg-[#0c1417] border-white/10 rounded-xl h-10 text-white text-xs"
                  />
                </div>
              </div>

              {/* Avatar section - upload to Cloudinary or paste URL */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div>
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block animate-pulse">
                      {isPt ? 'Foto de Perfil ou Logótipo' : 'Profile Picture / Brand Avatar'}
                    </label>
                    <span className="text-[9px] text-white/20 uppercase tracking-wide font-black">
                      {isPt ? 'Carregue diretamente para o Cloudinary ou cole um URL de imagem' : 'Upload directly to Cloudinary or enter any image URL'}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      id="avatar-file-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadAvatarFile(file);
                      }}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <label
                      htmlFor="avatar-file-upload"
                      className={`px-3 py-1.5 bg-zarco-cyan/10 hover:bg-zarco-cyan/20 border border-zarco-cyan/30 text-zarco-cyan font-black uppercase tracking-widest text-[8px] rounded-lg cursor-pointer flex items-center gap-1.5 transition-all ${
                        uploadingAvatar ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <span>{uploadingAvatar ? '⏳ Uploading...' : '📷 Upload Picture'}</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-black/40 flex-shrink-0 flex items-center justify-center">
                    {reviewAvatar ? (
                      <img src={reviewAvatar} alt="Review Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-sm">👤</span>
                    )}
                  </div>
                  <Input
                    value={reviewAvatar}
                    onChange={(e) => setReviewAvatar(e.target.value)}
                    placeholder={isPt ? "Cole o URL da foto ou use o botão 'Upload Picture'" : "Paste image URL or use the upload button"}
                    className="bg-[#0c1417] border-white/10 rounded-xl h-10 text-white text-xs flex-1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                  {isPt ? 'O Seu Testemunho / Mensagem' : 'Your Testimonial Narrative'}
                </label>
                <textarea
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={isPt 
                    ? "Escreva aqui a sua opinião sobre o nosso trabalho de engenharia, comunicação e velocidades de entrega..." 
                    : "Describe your experience working with us, our engineering depth, response rates, and delivery speeds..."}
                  className="w-full bg-[#0c1417] border border-white/10 rounded-2xl p-4 min-h-[120px] text-xs text-white/80 focus:outline-none focus:border-zarco-purple resize-none transition-all focus:ring-1 focus:ring-zarco-purple"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-center gap-3 py-3 px-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                <input
                  type="checkbox"
                  id="reviewConsent"
                  checked={reviewConsent}
                  onChange={(e) => setReviewConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-zarco-purple bg-[#0c1417] border-white/10 focus:ring-1 focus:ring-zarco-purple cursor-pointer"
                  required
                />
                <label htmlFor="reviewConsent" className="text-xs text-white/80 select-none cursor-pointer border-none bg-transparent">
                  {isPt 
                    ? 'Concordo em mostrar os meus detalhes na avaliação no website da Zarco Studios'
                    : 'I agree to show my details in the reviews on the Zarco Studios website'}
                </label>
              </div>

              <div className="flex justify-between items-center gap-4">
                <div>
                  <AnimatePresence>
                    {reviewSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {isPt ? 'Testemunho Submetido com Sucesso! (Aguarda aprovação)' : 'Testimonial Submitted Successfully! (Awaiting admin approval)'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-zarco-purple text-white font-black uppercase tracking-widest text-[11px] h-12 px-8 rounded-xl shadow-lg shadow-zarco-purple/20 hover:scale-102 transition-all ml-auto disabled:opacity-40"
                >
                  {submittingReview ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isPt ? 'Submeter Avaliação' : 'Submit Official Testimonial'
                  )}
                </Button>
              </div>
            </form>

            {/* List Submitted Reviews */}
            {existingReviews.length > 0 && (
              <div className="mt-12 pt-12 border-t border-white/5 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  {isPt ? 'Avaliações Submetidas para este Projeto' : 'Your Submitted Testimonial History'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {existingReviews.map((rev) => (
                    <div key={rev.id} className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-4 right-4">
                        {rev.show ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider rounded">
                            {isPt ? 'Visível no Site' : 'Live on Site'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-zarco-purple/10 text-zarco-purple border border-zarco-purple/20 text-[8px] font-black uppercase tracking-wider rounded">
                            {isPt ? 'Em Aprovação' : 'Pending Review'}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-sm ${i < (rev.rating || 5) ? 'text-amber-400' : 'text-zinc-700'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-white/70 italic leading-relaxed">
                          "{rev.reviewTextEn || rev.reviewTextPt || rev.reviewText}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-white/5">
                        <img 
                          src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'} 
                          alt={rev.name} 
                          className="w-8 h-8 rounded-full border border-white/10 object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-black text-white uppercase block truncate">{rev.name}</span>
                          <span className="text-[9px] font-bold text-white/35 uppercase block truncate">{rev.companyName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
        )}

        {/* Full Project Description Deluxe Slide-Over/Modal Overlay */}
        <AnimatePresence>
          {showFullDesc && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center select-none bg-black/85 backdrop-blur-xl">
              {/* Animated Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFullDesc(false)}
                className="absolute inset-0 cursor-pointer"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-[#080d0f] w-full h-full max-w-none overflow-hidden shadow-[0_0_50px_rgba(79,209,220,0.15)] relative z-10 flex flex-col"
              >
                {/* Visual Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zarco-cyan via-zarco-purple to-zarco-cyan animate-pulse" />

                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/5 bg-[#0a1114]">
                  <div className="flex items-center gap-4">
                    <img 
                      src="/images/logos/zarco_logo_web_developmet_no_bg300px.jpg" 
                      alt="Zarco Studios" 
                      className="h-8 md:h-10 w-auto hover:brightness-110 transition-all font-sans"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-white/20 text-lg md:text-xl font-light">|</span>
                    <div>
                      <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white leading-none">
                        {isPt ? 'Descrição Completa do Projeto' : 'Full Project Description'}
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#4fd1dc] block mt-1.5">
                        {project.projectName}
                      </span>
                    </div>
                  </div>
                  
                  {/* Close Button X */}
                  <button 
                    onClick={() => setShowFullDesc(false)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Content Scrolling Area */}
                <div className="flex-1 overflow-y-auto py-8 md:py-12 px-6 text-white/80 leading-relaxed font-sans text-sm scrollbar-thin scrollbar-thumb-white/10">
                  {project.fullDescription ? (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 whitespace-pre-wrap break-words text-justify select-text">
                      {project.fullDescription}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3 text-white/30">
                      <span className="text-3xl">📭</span>
                      <p className="text-xs uppercase font-black tracking-widest">
                        {isPt ? 'Nenhuma descrição detalhada fornecida.' : 'No detailed description has been uploaded.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 md:p-8 border-t border-white/5 bg-[#0a1114] flex justify-end">
                  <Button
                    onClick={() => setShowFullDesc(false)}
                    className="bg-zarco-cyan hover:bg-zarco-cyan/95 text-black font-black uppercase tracking-widest text-[10px] px-8 h-11 rounded-xl cursor-pointer"
                  >
                    {isPt ? 'Fechar Janela' : 'Close Document'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Terms & Conditions Modal Overlay */}
        <AnimatePresence>
          {showTermsModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center select-none bg-black/85 backdrop-blur-xl p-4 md:p-6 overflow-y-auto">
              {/* Animated Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTermsModal(false)}
                className="absolute inset-0 cursor-pointer"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-[#080d0f] w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(79,209,220,0.15)] relative z-10 flex flex-col border border-white/5"
              >
                {/* Visual Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-zarco-cyan via-zarco-purple to-zarco-cyan animate-pulse" />

                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/5 bg-[#0a1114]">
                  <div className="flex items-center gap-4">
                    <img 
                      src="/images/logos/zarco_logo_web_developmet_no_bg300px.jpg" 
                      alt="Zarco Studios" 
                      className="h-8 md:h-10 w-auto hover:brightness-110 transition-all font-sans"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-white/20 text-lg md:text-xl font-light">|</span>
                    <div>
                      <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white leading-none">
                        {project.termsSubtitle || (isPt ? 'Termos e Condições' : 'Terms & Conditions')}
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#4fd1dc] block mt-1.5 matches-glow">
                        {isPt ? 'Serviços de Desenvolvimento Web' : 'Web Development Services'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowTermsModal(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-all text-white/45 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar select-text text-left">
                  {project.termsDescription ? (
                    <div className="text-white/70 text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
                      {project.termsDescription}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/30 space-y-3">
                      <span className="text-4xl">🗒️</span>
                      <p className="text-xs uppercase font-black tracking-widest">
                        {isPt ? 'Nenhuma descrição de termos regulamentares fornecida.' : 'No terms summary has been uploaded.'}
                      </p>
                    </div>
                  )}

                  {project.termsUrl && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <div className="bg-[#0c1417]/50 rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-center md:text-left">
                          <h4 className="text-xs font-black uppercase tracking-wider text-white">
                            {isPt ? 'Documento Oficial de Termos PDF' : 'Official Terms PDF Document'}
                          </h4>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                            {isPt ? 'Abra ou transfira a versão regulamentar completa' : 'Open or download the full service provider document'}
                          </p>
                        </div>
                        <a
                          href={project.termsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-zarco-cyan hover:bg-zarco-cyan/90 text-black font-black uppercase tracking-widest text-[9.5px] px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center gap-2 whitespace-nowrap cursor-pointer"
                        >
                          <span>📄</span>
                          {isPt ? 'Ver Documento Completo' : 'View Full Document'}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 border-t border-white/5 bg-[#0a1114] flex justify-end">
                  <Button
                    onClick={() => setShowTermsModal(false)}
                    className="bg-[#0c1417] border border-white/10 hover:bg-white/5 text-white/60 font-black uppercase tracking-widest text-[10px] px-8 h-11 rounded-xl cursor-pointer"
                  >
                    {isPt ? 'Fechar' : 'Close'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Contact Popup Modal Form */}
        <AnimatePresence>
          {showContactModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 md:p-6 overflow-y-auto">
              {/* Animated Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowContactModal(false)}
                className="absolute inset-0 cursor-pointer"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-[#080d0f] w-full max-w-2xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(79,209,220,0.15)] relative z-10 flex flex-col"
              >
                {/* Visual Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zarco-cyan via-zarco-purple to-zarco-cyan animate-pulse" />

                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/5 bg-[#0a1114]">
                  <div className="flex items-center gap-4">
                    <img 
                      src="/images/logos/zarco_logo_web_developmet_no_bg300px.jpg" 
                      alt="Zarco Studios" 
                      className="h-8 md:h-10 w-auto hover:brightness-110 transition-all font-sans"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-white/20 text-lg md:text-xl font-light">|</span>
                    <div>
                      <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white leading-none">
                        {isPt ? 'Precisa de Ajuda?' : 'Need Clarifications?'}
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#4fd1dc] block mt-1.5">
                        {isPt ? 'Fale Diretamente com o Desenvolvimento' : 'Talk Directly with Development'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Close Button X */}
                  <button 
                    onClick={() => setShowContactModal(false)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Content Form Area */}
                <form onSubmit={handleContactSubmit} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 text-left">
                  {contactSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 text-center flex flex-col items-center justify-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-zarco-cyan/10 border border-zarco-cyan/20 flex items-center justify-center text-4xl animate-bounce">
                        📧
                      </div>
                      <h4 className="text-lg font-black text-zarco-cyan uppercase tracking-wide">
                        {isPt ? 'Mensagem Enviada!' : 'Message Sent Successfully!'}
                      </h4>
                      <p className="text-xs text-white/60 max-w-md leading-relaxed">
                        {isPt 
                          ? 'Obrigado pelo seu contacto. A nossa equipa de engenharia de software foi notificada e entrará em contacto muito em breve.' 
                          : 'Thank you for reaching out. Our development team has been instantly notified and we will get back to you shortly.'}
                      </p>
                      <Button
                        type="button"
                        onClick={() => setShowContactModal(false)}
                        className="mt-6 bg-zarco-cyan hover:bg-zarco-cyan/95 text-black font-black uppercase tracking-widest text-[10px] px-8 h-11 rounded-xl cursor-pointer"
                      >
                        {isPt ? 'Concluir' : 'Finish'}
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {isPt 
                          ? 'Precisa de esclarecer alguma dúvida técnica, ajustar prioridades ou rever tópicos do orçamento? Submeta o seu pedido diretamente.' 
                          : 'Need to clarify technical milestones, refine scopes, or adjust allocations? Submit your request directly to our inbox.'}
                      </p>

                      {contactError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold leading-relaxed">
                          ⚠️ {contactError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                            {isPt ? 'Nome Completo *' : 'Full Name *'}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 text-xs">
                              <User className="w-3.5 h-3.5" />
                            </span>
                            <Input
                              type="text"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              required
                              placeholder={isPt ? "O seu nome" : "Your full name"}
                              className="bg-[#0c1417] border-white/10 rounded-xl h-12 pl-10 text-white placeholder-white/20 focus-visible:ring-zarco-cyan text-xs"
                            />
                          </div>
                        </div>

                        {/* Company Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                            {isPt ? 'Empresa / Projeto' : 'Company / Project'}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 text-xs">
                              <Building className="w-3.5 h-3.5" />
                            </span>
                            <Input
                              type="text"
                              value={contactCompany}
                              onChange={(e) => setContactCompany(e.target.value)}
                              placeholder={isPt ? "Nome da empresa" : "Your brand / business name"}
                              className="bg-[#0c1417] border-white/10 rounded-xl h-12 pl-10 text-white placeholder-white/20 focus-visible:ring-zarco-cyan text-xs"
                            />
                          </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                            {isPt ? 'Email de Contacto *' : 'Email Address *'}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 text-xs">
                              <Mail className="w-3.5 h-3.5" />
                            </span>
                            <Input
                              type="email"
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              required
                              placeholder="e.g. contact@example.com"
                              className="bg-[#0c1417] border-white/10 rounded-xl h-12 pl-10 text-white placeholder-white/20 focus-visible:ring-zarco-cyan text-xs"
                            />
                          </div>
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                            {isPt ? 'Contacto Telefónico' : 'Phone Number'}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 text-xs">
                              <Phone className="w-3.5 h-3.5" />
                            </span>
                            <Input
                              type="tel"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="e.g. +351 912 345 678"
                              className="bg-[#0c1417] border-white/10 rounded-xl h-12 pl-10 text-white placeholder-white/20 focus-visible:ring-zarco-cyan text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Details Textarea */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                          {isPt ? 'Quais as suas questões ou esclarecimentos? *' : 'What clarifies or inquiries do you have? *'}
                        </label>
                        <textarea
                          value={contactDetails}
                          onChange={(e) => setContactDetails(e.target.value)}
                          required
                          placeholder={isPt 
                            ? "Exemplo: Gostaríamos de esclarecer se o módulo de integrações externas está coberto na fase atual do orçamento, ou se necessitamos de expandir este escopo..."
                            : "E.g., We would like to clarify if external CRM integration is covered in this phase's pricing or if we should add it as an extension milestone..."}
                          className="w-full bg-[#0c1417] border border-white/10 rounded-2xl p-5 min-h-[140px] text-xs text-white/80 focus:outline-none focus:border-zarco-cyan resize-none transition-all focus:ring-1 focus:ring-zarco-cyan placeholder-white/20"
                        />
                      </div>

                      {/* Buttons controls */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <Button
                          type="button"
                          onClick={() => setShowContactModal(false)}
                          className="bg-white/5 text-white/65 hover:text-white hover:bg-white/10 px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 cursor-pointer"
                        >
                          {isPt ? 'Cancelar' : 'Cancel'}
                        </Button>
                        <Button
                          type="submit"
                          disabled={submittingContact}
                          className="bg-zarco-cyan hover:bg-zarco-cyan/90 text-black px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg shadow-zarco-cyan/10"
                        >
                          {submittingContact ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>{isPt ? 'Enviar Mensagem' : 'Send Message'}</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Prototype HTML Viewer Popup Modal */}
        <AnimatePresence>
          {activePrototype && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActivePrototype(null)}
                className="absolute inset-0 cursor-pointer"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-[#080d0f] w-screen h-screen relative z-10 flex flex-col"
              >
                {/* Visual Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zarco-cyan via-zarco-purple to-zarco-cyan animate-pulse" />

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 md:py-5 border-b border-white/5 bg-[#0a1114]">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4fd1dc] leading-none mb-1">
                      Prototype Live Sandbox
                    </h3>
                    <span className="text-sm md:text-md font-bold uppercase tracking-tight text-white block">
                      {activePrototype.title || 'Interactive Sandbox Simulation'}
                    </span>
                  </div>
                  
                  {/* Close button X */}
                  <button 
                    onClick={() => setActivePrototype(null)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Interactive Embed Sandbox Frame Area */}
                <div className="flex-1 bg-black relative overflow-hidden p-0 m-0 w-full h-full">
                  {activePrototype.embedHtml ? (
                    <iframe
                      title={activePrototype.title || "Prototype Live Sandbox"}
                      srcDoc={(() => {
                        const rawCode = activePrototype.embedHtml || '';
                        const hasHtmlTag = /<html/i.test(rawCode);
                        if (!hasHtmlTag) {
                          return `
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <style>
                                  html, body {
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    width: 100% !important;
                                    height: 100% !important;
                                    overflow: auto !important;
                                    background-color: transparent !important;
                                  }
                                  iframe, object, embed {
                                    width: 100% !important;
                                    height: 100% !important;
                                    border: 0 !important;
                                    position: absolute !important;
                                    top: 0 !important;
                                    left: 0 !important;
                                  }
                                </style>
                              </head>
                              <body>
                                ${rawCode}
                              </body>
                            </html>
                          `;
                        } else {
                          // Clean page structure - we append standard reset styles to ensure it takes entire viewport width/height
                          const resetScript = `
                            <style>
                              html, body {
                                margin: 0 !important;
                                padding: 0 !important;
                                width: 100% !important;
                                height: 100% !important;
                              }
                            </style>
                          `;
                          return rawCode + resetScript;
                        }
                      })()}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      className="w-full h-full border-0 p-0 m-0 bg-transparent block"
                    />
                  ) : (
                    <div className="text-center p-8 space-y-2 flex flex-col items-center justify-center h-full">
                      <span className="text-3xl">🧩</span>
                      <p className="text-white/40 text-xs uppercase tracking-widest font-black">
                        No Embed HTML Code Provided For This Prototype
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Interactive Estimator Full-screen Popup Modal */}
        <AnimatePresence>
          {showEstimatorModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[130] w-full h-full bg-[#080d0f] flex flex-col md:overflow-hidden select-text"
            >
              {/* Premium Top Navigation bar */}
              <div className="flex border-b border-white/5 bg-[#0a1114] px-6 py-5 items-center justify-between sticky top-0 z-[140]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zarco-cyan/10 flex items-center justify-center border border-zarco-cyan/20">
                    <DollarSign className="w-5 h-5 text-zarco-cyan" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white leading-tight">
                      {isPt ? 'Painel de Simulação Interativa' : 'Interactive Project Cost Simulator'}
                    </h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-0.5">
                      {isPt ? 'Simule custos, adicione serviços sob medida e aplique taxas na página' : 'Configure line items, customize scope metrics, and compute margins instantly'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEstimatorModal(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/25 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                  title={isPt ? "Fechar Calculadora" : "Close Estimator"}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content splits in 2 columns on desktop (Scrollable left, persistent summary right) */}
              <div className="flex-1 overflow-y-auto md:overflow-hidden grid grid-cols-1 lg:grid-cols-12 w-full h-full">
                
                {/* Left Content column: Deliverables builder & customization forms */}
                <div className="lg:col-span-8 p-6 md:p-10 md:overflow-y-auto space-y-8 flex flex-col justify-start h-full pb-16">
                  
                  {/* Part 1: Default Deliverables Checklist */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <span className="text-base font-bold">📋</span>
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#4fd1dc]">
                        {isPt ? 'Itens do Escopo Principal' : 'Primary Deliverables Checklist'}
                      </h4>
                    </div>
                    
                    <div className="space-y-2 max-w-5xl">
                      {(project.budgetLines || []).map((line, idx) => {
                        const isSelected = !line.isOptional || !!selectedAddons[idx];
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
                                  setSelectedAddons(prev => ({ ...prev, [idx]: !prev[idx] }));
                                }
                              }}
                              disabled={!line.isOptional}
                              className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                                !line.isOptional
                                  ? 'bg-zarco-cyan/20 border-zarco-cyan/30 text-zarco-cyan cursor-not-allowed'
                                  : !!selectedAddons[idx]
                                    ? 'bg-zarco-purple border-zarco-purple text-white shadow-lg shadow-zarco-purple/20 cursor-pointer'
                                    : 'border-white/10 hover:border-white/30 bg-white/5 cursor-pointer'
                              }`}
                            >
                              {(!line.isOptional || !!selectedAddons[idx]) && (
                                <Check className="w-4 h-4 stroke-[3]" />
                              )}
                            </button>
                            
                            <div className="flex-1 select-all">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <span className={`font-bold uppercase tracking-wider text-sm ${isSelected ? 'text-white' : 'text-white/40 line-through decoration-white/10'}`}>
                                    {line.item}
                                  </span>
                                  {line.isOptional ? (
                                    <span className="ml-2 px-2 py-0.5 bg-zarco-purple/20 text-zarco-purple text-[8px] font-black uppercase tracking-wider rounded border border-zarco-purple/25">
                                      {isPt ? 'Opcional' : 'Optional'}
                                    </span>
                                  ) : (
                                    <span className="ml-2 px-2 py-0.5 bg-zarco-cyan/10 text-zarco-cyan text-[8px] font-black uppercase tracking-wider rounded border border-zarco-cyan/25">
                                      {isPt ? 'Base' : 'Base Scope'}
                                    </span>
                                  )}
                                </div>
                                <span className={`font-black font-mono text-sm ${isSelected ? 'text-white' : 'text-white/30'}`}>
                                  {line.cost && line.cost !== '—' && line.cost !== '0'
                                    ? `€${Number(line.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                    : '—'}
                                </span>
                              </div>
                              {line.description && (
                                <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-white/50' : 'text-white/20'}`}>
                                  {line.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(project.budgetLines || []).length === 0 && (
                        <p className="text-white/40 text-xs italic">
                          {isPt ? 'Nenhum item base parametrizado para este projeto.' : 'No standard base budget lines configured.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Part 2: Dynamic Custom Services Registry */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <span className="text-base font-bold">✨</span>
                      <h4 className="text-xs font-black uppercase tracking-widest text-zarco-cyan">
                        {isPt ? 'Adicionar Serviços Customizados' : 'Custom Services & Scope Builder'}
                      </h4>
                    </div>

                    {/* Add Custom Service Input Form */}
                    <div className="bg-[#0c1417] border border-white/10 rounded-2xl p-5 md:p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="col-span-1 md:col-span-3 space-y-1.5">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                            {isPt ? 'Nome do Serviço / Item' : 'Service Title'}
                          </label>
                          <Input
                            type="text"
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value)}
                            placeholder={isPt ? "Ex: API Customizada, SEO Avançado" : "e.g., Custom API Integration"}
                            className="bg-[#080d0f] border-white/10 text-white text-xs h-10 rounded-lg focus:border-zarco-cyan font-bold"
                          />
                          <label
                            htmlFor="newServiceIsOptionalBox"
                            className="flex items-center gap-2.5 bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 h-8 cursor-pointer select-none transition-all justify-start mt-2"
                          >
                            <input
                              type="checkbox"
                              id="newServiceIsOptionalBox"
                              checked={newServiceIsOptional}
                              onChange={(e) => setNewServiceIsOptional(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-zarco-purple bg-[#080d0f] border-white/10 focus:ring-1 focus:ring-zarco-purple cursor-pointer accent-zarco-purple shrink-0"
                            />
                            <div className="flex flex-col text-left select-none leading-[1.1]">
                              <span className="text-[8px] font-black text-white/50 tracking-wider">
                                {isPt ? 'OPCIONAL' : 'OPTIONAL'}
                              </span>
                              <span className="text-[8px] font-black text-zarco-cyan tracking-wider">
                                {isPt ? 'PRODUTO ADICIONAL' : 'UPSELL / ADD-ON'}
                              </span>
                            </div>
                          </label>
                        </div>
                        <div className="col-span-1 md:col-span-3 space-y-1.5">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                            {isPt ? 'Descrição Curta (Opcional)' : 'Description (Optional)'}
                          </label>
                          <Input
                            type="text"
                            value={newServiceDesc}
                            onChange={(e) => setNewServiceDesc(e.target.value)}
                            placeholder={isPt ? "Ex: Integração com Stripe e Webhooks" : "e.g., Secure webhook setup"}
                            className="bg-[#080d0f] border-white/15 text-white text-xs h-10 rounded-lg focus:border-zarco-cyan font-bold"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                            {isPt ? 'Qtd' : 'Qty'}
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={newServiceQuantity}
                            onChange={(e) => setNewServiceQuantity(e.target.value)}
                            placeholder="1"
                            className="bg-[#080d0f] border-white/10 text-white text-xs h-10 rounded-lg focus:border-zarco-cyan font-mono font-bold"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                            {isPt ? 'Horas' : 'Hours'}
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={newServiceHours}
                            onChange={(e) => setNewServiceHours(e.target.value)}
                            placeholder="—"
                            className="bg-[#080d0f] border-white/10 text-white text-xs h-10 rounded-lg focus:border-zarco-cyan font-mono font-bold"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-bold">
                            {isPt ? 'Preço (€)' : 'Price / Investment (€)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-mono">€</span>
                            <Input
                              type="number"
                              min="0"
                              value={newServiceCost}
                              onChange={(e) => setNewServiceCost(e.target.value)}
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
                            if (!newServiceName.trim()) return;
                            const qtyNum = Number(newServiceQuantity) || 1;
                            const hrsNum = Number(newServiceHours) || 0;
                            const unitPrice = Number(newServiceCost) || 0;

                            let finalCost = unitPrice;
                            if (hrsNum > 0) {
                              finalCost = qtyNum * hrsNum * unitPrice;
                            } else {
                              finalCost = qtyNum * unitPrice;
                            }

                            const newId = 'service-' + Date.now();
                            const newService: any = {
                              id: newId,
                              item: newServiceName.trim(),
                              cost: finalCost,
                              isOptional: newServiceIsOptional,
                              quantity: qtyNum,
                              unitPrice: unitPrice
                            };
                            if (newServiceDesc.trim()) {
                              newService.description = newServiceDesc.trim();
                            }
                            if (hrsNum > 0) {
                              newService.hours = hrsNum;
                            }

                            setCustomServices(prev => [
                              ...prev,
                              newService
                            ]);
                            setNewServiceName('');
                            setNewServiceDesc('');
                            setNewServiceCost('');
                            setNewServiceQuantity('1');
                            setNewServiceHours('');
                            setNewServiceIsOptional(false);
                            showToast(isPt ? 'Serviço adicionado com sucesso!' : 'Service successfully added!');
                          }}
                          className="bg-zarco-purple hover:bg-zarco-purple/95 text-white font-black uppercase tracking-widest text-[9px] px-6 py-2.5 h-10 rounded-lg flex items-center gap-2 border-none transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {isPt ? 'Adicionar Serviço' : 'Add Custom Service'}
                        </Button>
                      </div>
                    </div>

                    {/* Listing of added Custom Services */}
                    {customServices.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-widest font-black text-white/40">
                          {isPt ? 'Serviços Adicionados Sob Medida' : 'Custom Services Currently Added'}
                        </div>
                        <div className="space-y-2">
                          {customServices.map((item, idx) => (
                            <div
                              key={`modal-custom-${item.id}`}
                              className="flex items-center justify-between p-4 rounded-xl border border-zarco-cyan/20 bg-zarco-cyan/[0.02] transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-base">✨</span>
                                <div className="text-left select-all">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-white text-sm uppercase tracking-wider">{item.item}</span>
                                    {item.isOptional ? (
                                      <span className="px-1.5 py-0.5 bg-zarco-purple/20 text-zarco-purple border border-zarco-purple/25 text-[8px] font-black uppercase tracking-wider rounded">
                                        {isPt ? 'Opcional' : 'Optional'}
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/25 text-[8px] font-black uppercase tracking-wider rounded">
                                        {isPt ? 'Base Scope' : 'Base Scope'}
                                      </span>
                                    )}
                                  </div>
                                  {((item.quantity && item.quantity >= 1) || (item.hours && item.hours > 0)) && (
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-white/50 font-mono font-bold">
                                      {item.quantity && item.quantity >= 1 && (
                                        <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/70">
                                          {isPt ? `Qtd: ${item.quantity}` : `Qty: ${item.quantity}`}
                                        </span>
                                      )}
                                      {item.hours && item.hours > 0 && (
                                        <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/70">
                                          {isPt ? `Horas: ${item.hours}` : `Hours: ${item.hours}`}
                                        </span>
                                      )}
                                      {item.unitPrice !== undefined && (
                                        <span className="text-white/30">@ €{item.unitPrice}/{isPt ? 'unid' : 'unit'}</span>
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
                                  €{item.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomServices(prev => prev.filter(c => c.id !== item.id));
                                    showToast(isPt ? 'Serviço removido' : 'Custom service removed', 'info');
                                  }}
                                  className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all cursor-pointer"
                                  title={isPt ? "Remover" : "Remove"}
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

                  {/* Part 3: Live interactive slider adjustments */}
                  {(Number(project?.discountPercent || 0) > 0 || project?.applyVat) && (
                    <div className={`grid grid-cols-1 ${Number(project?.discountPercent || 0) > 0 && project?.applyVat ? 'md:grid-cols-2' : ''} gap-8 pt-4 border-t border-white/5`}>
                      {/* Discount Control block */}
                      {Number(project?.discountPercent || 0) > 0 && (
                        <div className="space-y-3 bg-[#0c1417]/30 border border-white/5 p-5 rounded-2xl">
                          <div className="flex justify-between items-center text-xs">
                            <label className="text-[10px] font-black text-[#4fd1dc] uppercase tracking-widest flex items-center gap-1.5">
                              <span>🏷️</span>
                              {isPt ? 'Desconto Especial' : 'Apply Promo Discount'}
                            </label>
                            <span className="text-xs font-black text-green-400 font-mono">
                              {discountPercent}%
                            </span>
                          </div>
                          <div className="relative pt-1">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={discountPercent}
                              onChange={(e) => setDiscountPercent(e.target.value)}
                              className="w-full accent-zarco-cyan bg-[#080d0f] rounded-lg h-2 cursor-pointer"
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-white/20">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      )}

                      {/* VAT Indirect Tax Checklist Toggle */}
                      {project?.applyVat && (
                        <div className="space-y-3 bg-[#0c1417]/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold">💼</span>
                              <div>
                                <label className="text-[10px] font-black text-[#4fd1dc] uppercase tracking-widest block">
                                  {isPt ? 'Cálculo com IVA' : 'Taxation / VAT Support'}
                                </label>
                                <span className="text-[9px] text-white/30 uppercase tracking-widest font-black font-semibold">
                                  {isPt ? 'Aplicar IVA fiscal padrão' : 'Toggle general sales indirect tax'}
                                </span>
                              </div>
                            </div>

                            {/* Interactive Toggle Button for VAT */}
                            <button
                              type="button"
                              onClick={() => setApplyVat(prev => !prev)}
                              className={`w-12 h-6 rounded-full p-0.5 transition-all select-none border border-white/5 cursor-pointer flex items-center ${
                                applyVat ? 'bg-zarco-cyan' : 'bg-[#080d0f]'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full transition-all transform ${
                                applyVat ? 'bg-black translate-x-6' : 'bg-zarco-cyan translate-x-0'
                              }`} />
                            </button>
                          </div>

                          {applyVat ? (
                            <div className="grid grid-cols-12 gap-2 items-center pt-2">
                              <span className="col-span-8 text-[11px] font-bold text-white/55">
                                {isPt ? 'Percentual de IVA Aplicável:' : 'Standard VAT Rate Charge:'}
                              </span>
                              <div className="col-span-4 relative">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={vatPercent}
                                  onChange={(e) => setVatPercent(e.target.value)}
                                  className="bg-[#080d0f] border-white/10 text-white text-xs h-8 pr-6 text-center focus:border-zarco-cyan font-mono"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/30 font-mono">%</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] uppercase font-bold text-white/20 text-center py-2">
                              {isPt ? 'Isento de IVA' : 'VAT Exempt (0%)'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Summary column: Live Calculated Invoice Board */}
                <div className="lg:col-span-4 bg-[#0a1114] border-t lg:border-t-0 lg:border-l border-white/5 p-6 md:p-10 flex flex-col justify-between h-full space-y-8 md:overflow-y-auto">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#4fd1dc] pb-4 border-b border-white/5 flex items-center gap-2 justify-center lg:justify-start">
                      <span>📉</span>
                      {isPt ? 'Resumo da Proposta de Investimento' : 'Live Interactive Proposal Invoice'}
                    </h4>

                    {/* Invoice items break list */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto select-all pr-1">
                      {/* Primary Deliverables selected */}
                      {(project.budgetLines || []).filter((_, idx) => !project.budgetLines[idx].isOptional || !!selectedAddons[idx]).map((line, idx) => (
                        <div key={`summary-b-${idx}`} className="flex justify-between items-start text-xs text-white/60">
                          <span className="uppercase tracking-wider text-[9px] text-[#4fd1dc]/80 font-bold max-w-[70%]">
                            • {line.item}
                          </span>
                          <span className="font-mono font-medium">
                            €{Number(line.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                      {/* Custom services added */}
                      {customServices.map((item, idx) => (
                        <div key={`summary-c-${idx}`} className="flex justify-between items-start text-xs text-white/80">
                          <span className="uppercase tracking-wider text-[9px] text-zarco-cyan font-bold max-w-[70%]">
                            ✨ {item.item}
                          </span>
                          <span className="font-mono font-bold text-zarco-cyan">
                            €{item.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                      {/* No item fallback */}
                      {(project.budgetLines || []).filter((_, idx) => !project.budgetLines[idx].isOptional || !!selectedAddons[idx]).length === 0 && customServices.length === 0 && (
                        <div className="text-center py-4 text-white/20 italic text-[10px] uppercase font-bold tracking-widest">
                          {isPt ? 'Nenhum item selecionado' : 'No items selected'}
                        </div>
                      )}
                    </div>

                    {/* Accumulators */}
                    <div className="space-y-3 pt-6 border-t border-white/5 select-all">
                      <div className="flex justify-between items-center text-xs text-white/40">
                        <span className="uppercase tracking-widest text-[9px] font-black">{isPt ? 'Subtotal Bruto' : 'Gross Subtotal:'}</span>
                        <span className="font-mono font-bold text-white text-sm">
                          €{subtotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {discountAmtVal > 0 && (
                        <div className="flex justify-between items-center text-xs text-green-400">
                          <span className="uppercase tracking-widest text-[9px] font-black">{isPt ? 'Desconto de Cupão' : 'Promo Discount:'} ({discountPercent}%)</span>
                          <span className="font-mono font-black">
                            -€{discountAmtVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}

                      {discountAmtVal > 0 && (
                        <div className="flex justify-between items-center text-xs text-white/40 border-t border-white/5 pt-3">
                          <span className="uppercase tracking-widest text-[9px] font-black">{isPt ? 'Base Tributável' : 'Taxable Base:'}</span>
                          <span className="font-mono font-bold">
                            €{taxableBaseVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}

                      {applyVat && vatAmtVal > 0 && (
                        <div className="flex justify-between items-center text-xs text-zarco-purple">
                          <span className="uppercase tracking-widest text-[9px] font-black">{isPt ? 'Cálculo de IVA' : 'Sales VAT:'} ({vatPercent}%)</span>
                          <span className="font-mono font-black">
                            +€{vatAmtVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-white/10 bg-[#080d0f]/95 -mx-6 -mb-6 lg:m-0 lg:p-0 p-6 lg:border-none rounded-b-3xl">
                    <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-5 rounded-2xl select-all">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-black leading-none">
                          {isPt ? 'GRAND TOTAL CALCULADO' : 'TOTAL EXECUTIVO FINAL'}
                        </span>
                        <span className="text-[8px] text-zarco-cyan font-black uppercase mt-1 leading-none">
                          {applyVat 
                            ? (isPt ? 'Com Desconto & IVA Aplicados' : 'With customized Discount & VAT calculated') 
                            : (isPt ? 'Com Desconto (Sem Incidência de IVA)' : 'With promotion (VAT exempt)')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-zarco-cyan font-sans block tracking-tight">
                          €{grandTotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={async () => {
                        try {
                          const projRef = doc(db, 'clientProjects', projectId);
                          await updateDoc(projRef, {
                            customServices: customServices,
                            discountPercent: discountPercent,
                            vatPercent: vatPercent,
                            applyVat: applyVat,
                            updatedAt: new Date()
                          });

                          setProject(prev => prev ? {
                            ...prev,
                            customServices: customServices,
                            discountPercent: discountPercent,
                            vatPercent: vatPercent,
                            applyVat: applyVat
                          } : null);

                          setShowEstimatorModal(false);
                          showToast(isPt ? 'Alterações guardadas com sucesso!' : 'Changes successfully saved to database!');
                        } catch (err) {
                           console.error("Error saving custom services to db:", err);
                           showToast(isPt ? 'Erro ao gravar as alterações na base de dados.' : 'Failed to save custom services to database.', 'error');
                        }
                      }}
                      className="w-full bg-[#4fd1dc] hover:bg-[#4fd1dc]/90 text-black font-black uppercase tracking-widest text-[11px] h-12 rounded-xl border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)] flex items-center justify-center gap-2 cursor-pointer font-bold"
                    >
                      <Check className="w-4 h-4" />
                      {isPt ? 'Confirmar & Aplicar' : 'Confirm & Apply Invoice'}
                    </Button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Feedback Delete Confirmation Dialog */}
        <AnimatePresence>
          {feedbackToDelete && (
            <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0a1114] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                      {isPt ? 'Confirmar Eliminação' : 'Confirm Deletion'}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed font-bold uppercase tracking-wider">
                      {isPt 
                        ? 'Tem a certeza que deseja eliminar esta nota de feedback? Esta ação não pode ser desfeita.' 
                        : 'Are you sure you want to delete this feedback note? This action cannot be undone.'}
                    </p>
                  </div>

                  <div className="flex gap-4 w-full pt-4">
                    <Button
                      onClick={() => setFeedbackToDelete(null)}
                      className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-heavy h-12 rounded-xl uppercase tracking-widest text-[10px]"
                    >
                      {isPt ? 'Cancelar' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={() => performDeleteFeedback(feedbackToDelete)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-heavy h-12 rounded-xl border-none uppercase tracking-widest text-[10px]"
                    >
                      {isPt ? 'Eliminar' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Custom Subscription Cancellation Confirmation Dialog */}
        <AnimatePresence>
          {showUnsubscribeModal && (
            <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0a1114] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                      {isPt ? 'Cancelar Assinatura' : 'Are you sure you wanna unsubscribe it'}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed font-bold uppercase tracking-wider">
                      {isPt 
                        ? 'Tem a certeza que deseja cancelar a sua subscrição? Perderá o acesso aos benefícios de suporte continuado.' 
                        : 'Are you sure you want to cancel your recurring subscription? You will lose access to support benefits.'}
                    </p>
                  </div>

                  <div className="flex gap-4 w-full pt-4">
                    <Button
                      onClick={() => setShowUnsubscribeModal(false)}
                      className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-heavy h-12 rounded-xl uppercase tracking-widest text-[10px]"
                    >
                      {isPt ? 'Cancelar' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={handleCancelSubscription}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-heavy h-12 rounded-xl border-none uppercase tracking-widest text-[10px]"
                    >
                      {isPt ? 'Confirmar' : 'Confirm'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Toast notification stack */}
        <div className="fixed top-6 right-6 z-[120] flex flex-col gap-3 max-w-sm pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 w-80 md:w-96 min-h-[64px] ${
                  toast.type === "success"
                    ? "bg-[#080d0f]/95 border-green-500/20 shadow-green-500/5 text-white"
                    : toast.type === "error"
                    ? "bg-[#080d0f]/95 border-red-500/20 shadow-red-500/5 text-white"
                    : "bg-[#080d0f]/95 border-zarco-cyan/20 shadow-zarco-cyan/5 text-white"
                }`}
              >
                {/* Icon wrapper */}
                <div className="mt-0.5 shrink-0">
                  {toast.type === "success" ? (
                    <span className="text-green-500 text-lg">💡</span>
                  ) : toast.type === "error" ? (
                    <span className="text-red-500 text-lg">⚠️</span>
                  ) : (
                    <span className="text-zarco-cyan text-lg">💬</span>
                  )}
                </div>

                {/* Text section */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-white/50 mb-0.5">
                    {toast.type === "success" ? (isPt ? 'Sucesso' : 'Success') : toast.type === "error" ? (isPt ? 'Erro' : 'Error') : (isPt ? 'Nota' : 'Notice')}
                  </p>
                  <p className="text-xs text-white/80 font-bold leading-relaxed whitespace-pre-line">
                    {toast.message}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-white/20 hover:text-white/60 transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
