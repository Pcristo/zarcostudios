import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { Invoice } from "../types/invoice";

export async function fetchInvoices(): Promise<Invoice[]> {
  const snapshot = await getDocs(collection(db, "invoices"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
}

export async function saveInvoice(invoice: Partial<Invoice>): Promise<string> {
  if (invoice.id) {
    const ref = doc(db, "invoices", invoice.id);
    await setDoc(ref, { ...invoice, updatedAt: new Date() }, { merge: true });
    return invoice.id;
  } else {
    const ref = await addDoc(collection(db, "invoices"), {
      ...invoice,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return ref.id;
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  await deleteDoc(doc(db, "invoices", id));
}
