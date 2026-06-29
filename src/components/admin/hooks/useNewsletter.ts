import { useState, useCallback } from "react";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Subscriber } from "../types/pricing";

export function useNewsletter(showAdminToast: (msg: string, type?: "success" | "error" | "warning") => void) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [isDeletingSubscriber, setIsDeletingSubscriber] = useState<string | null>(null);

  const [archivedNewsletters, setArchivedNewsletters] = useState<any[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [savingNewsletter, setSavingNewsletter] = useState(false);

  const [newsletterForm, setNewsletterForm] = useState({
    subject: "",
    content: "",
    lang: "en" as "en" | "pt" | "all" | "selected",
  });
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [editingNewsletterId, setEditingNewsletterId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoadingSubscribers(true);
    try {
      const qEn = query(collection(db, "subscribers"), orderBy("subscribedAt", "desc"));
      const qPt = query(collection(db, "pt_subscribers"), orderBy("subscribedAt", "desc"));

      const [snapshotEn, snapshotPt] = await Promise.all([getDocs(qEn), getDocs(qPt)]);

      const dataEn = snapshotEn.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lang: "en" as const,
      })) as Subscriber[];
      const dataPt = snapshotPt.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lang: "pt" as const,
      })) as Subscriber[];

      const merged = [...dataEn, ...dataPt].sort((a, b) => {
        const dateA = a.subscribedAt?.toDate?.() || new Date(a.subscribedAt);
        const dateB = b.subscribedAt?.toDate?.() || new Date(b.subscribedAt);
        return dateB - dateA;
      });

      setSubscribers(merged);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoadingSubscribers(false);
    }
  }, []);

  const fetchArchives = useCallback(async () => {
    setLoadingArchives(true);
    try {
      const q = query(collection(db, "newsletters"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setArchivedNewsletters(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching archives:", error);
    } finally {
      setLoadingArchives(false);
    }
  }, []);

  const toggleSubscriberStatus = useCallback(async (email: string, lang: "en" | "pt", currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";
    try {
      await updateDoc(doc(db, collectionName, email), { active: newStatus });
      setSubscribers((prev) =>
        prev.map((s) => (s.email === email && s.lang === lang ? { ...s, active: newStatus } : s))
      );
      showAdminToast(`Subscriber subscriber status updated to ${newStatus ? "Active" : "Inactive"}!`, "success");
    } catch (error) {
      console.error("Error toggling status:", error);
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${email}`);
    }
  }, [showAdminToast]);

  const deleteSubscriber = useCallback(async (id: string, email: string, lang: "en" | "pt") => {
    setIsDeletingSubscriber(id);
    const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";
    try {
      await deleteDoc(doc(db, collectionName, id));
      setSubscribers((prev) => prev.filter((s) => !(s.id === id && s.lang === lang)));
      showAdminToast("Subscriber deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    } finally {
      setIsDeletingSubscriber(null);
    }
  }, [showAdminToast]);

  const saveNewsletter = useCallback(async (isSent = false) => {
    if (!newsletterForm.subject || !newsletterForm.content) {
      showAdminToast("Please fill in the newsletter content before saving.", "warning");
      return false;
    }

    setSavingNewsletter(true);
    try {
      const payload = {
        ...newsletterForm,
        isSent,
        sentAt: isSent ? serverTimestamp() : (newsletterForm as any).sentAt || null,
        updatedAt: serverTimestamp(),
        recipientsCount: newsletterForm.lang === "selected" ? selectedEmails.length : "audience-wide",
        status: isSent ? "sent" : "draft",
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
          newsletterForm.lang === "pt"
            ? "Rascunho da newsletter guardado com sucesso!"
            : "Newsletter draft saved successfully!",
          "success"
        );
        setIsComposing(false);
        setNewsletterForm({ subject: "", content: "", lang: "en" });
        setEditingNewsletterId(null);
      }
      await fetchArchives();
      return true;
    } catch (error) {
      console.error("Error saving newsletter:", error);
      showAdminToast(
        newsletterForm.lang === "pt" ? "Falha ao guardar rascunho." : "Failed to save newsletter.",
        "error"
      );
      return false;
    } finally {
      setSavingNewsletter(false);
    }
  }, [newsletterForm, editingNewsletterId, selectedEmails, fetchArchives, showAdminToast]);

  const deleteNewsletter = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "newsletters", id));
      setArchivedNewsletters((prev) => prev.filter((n) => n.id !== id));
      showAdminToast("Newsletter archived campaign deleted successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error deleting newsletter archive:", error);
      handleFirestoreError(error, OperationType.DELETE, `newsletters/${id}`);
      return false;
    }
  }, [showAdminToast]);

  const sendNewsletter = useCallback(async () => {
    if (!newsletterForm.subject || !newsletterForm.content) {
      showAdminToast("Please fill in both subject and content.", "warning");
      return false;
    }

    if (newsletterForm.lang === "selected" && selectedEmails.length === 0) {
      showAdminToast("Please select at least one subscriber.", "warning");
      return false;
    }

    setSendingNewsletter(true);
    try {
      const payload = {
        ...newsletterForm,
        emails: newsletterForm.lang === "selected" ? selectedEmails : undefined,
      };

      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : "";

      const response = await fetch("/api/admin/send-newsletter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const isPt = newsletterForm.lang === "pt";
        let feedbackMessage = isPt ? "Newsletter enviada com sucesso!" : "Newsletter sent successfully!";
        let toastType: "success" | "warning" | "error" = "success";

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
        return true;
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to send newsletter");
      }
    } catch (error: any) {
      console.error("Error sending newsletter:", error);
      showAdminToast(`Error: ${error.message}`, "error");
      return false;
    } finally {
      setSendingNewsletter(false);
    }
  }, [newsletterForm, selectedEmails, saveNewsletter, showAdminToast]);

  const loadDraft = useCallback((newsletter: any) => {
    setNewsletterForm({
      subject: newsletter.subject,
      content: newsletter.content,
      lang: newsletter.lang || "en",
    });
    setEditingNewsletterId(newsletter.id);
    setIsComposing(true);
  }, []);

  return {
    subscribers,
    setSubscribers,
    loadingSubscribers,
    isDeletingSubscriber,
    archivedNewsletters,
    setArchivedNewsletters,
    loadingArchives,
    sendingNewsletter,
    savingNewsletter,
    newsletterForm,
    setNewsletterForm,
    selectedEmails,
    setSelectedEmails,
    editingNewsletterId,
    setEditingNewsletterId,
    isComposing,
    setIsComposing,
    fetchSubscribers,
    fetchArchives,
    toggleSubscriberStatus,
    deleteSubscriber,
    saveNewsletter,
    deleteNewsletter,
    sendNewsletter,
    loadDraft,
  };
}
