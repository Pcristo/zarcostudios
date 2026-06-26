import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Invoice, CompanySettings } from "../types/invoice";

export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
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
          details: item.details || "",
        })),
      };
    }) as Invoice[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "invoices");
    throw error;
  }
};

export const saveInvoice = async (
  invoice: Invoice,
  companySettings: CompanySettings
): Promise<{ id: string }> => {
  const isNew = invoice.id.startsWith("invoice-temp-");
  try {
    const { id, ...data } = invoice;
    const invoiceData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    let savedId = id;

    if (isNew) {
      const docRef = await addDoc(collection(db, "invoices"), {
        ...invoiceData,
        createdAt: serverTimestamp(),
      });
      savedId = docRef.id;

      // Update next sequence number in settings if auto-gen is enabled
      if (companySettings.autoGenerateInvoices !== false) {
        const numMatch = invoice.invoiceNumber.match(/(\d+)$/);
        const usedSeq = numMatch ? parseInt(numMatch[1], 10) : 0;
        const currentSettingSeq = Number(companySettings.nextInvoiceNumber) || 1;

        if (!isNaN(usedSeq) && usedSeq >= currentSettingSeq) {
          const nextSeq = usedSeq + 1;
          await setDoc(
            doc(db, "settings", "company-legal"),
            {
              nextInvoiceNumber: nextSeq,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
    } else {
      await setDoc(doc(db, "invoices", id), invoiceData, { merge: true });
    }

    return { id: savedId };
  } catch (error) {
    handleFirestoreError(
      error,
      isNew ? OperationType.CREATE : OperationType.UPDATE,
      "invoices"
    );
    throw error;
  }
};

export const deleteInvoice = async (id: string, invoice: Invoice): Promise<void> => {
  try {
    // Move to Trash
    await setDoc(doc(db, "trash", id), {
      originalId: id,
      type: "bill",
      name: invoice.invoiceNumber || "Unnamed Invoice",
      details: invoice.amount ? `€${invoice.amount}` : "",
      deletedAt: new Date().toISOString(),
      originalCollection: "invoices",
      data: invoice,
    });
    // Delete from main collection
    await deleteDoc(doc(db, "invoices", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `invoices/${id}`);
    throw error;
  }
};
