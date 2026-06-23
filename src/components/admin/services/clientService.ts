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
import { Client, Subscriber } from "../types/client";

export async function fetchClients(): Promise<Client[]> {
  const snapshot = await getDocs(collection(db, "clients"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Client));
}

export async function saveClient(client: Partial<Client>): Promise<string> {
  if (client.id) {
    const ref = doc(db, "clients", client.id);
    await setDoc(ref, { ...client, updatedAt: new Date() }, { merge: true });
    return client.id;
  } else {
    // Add new client
    const ref = await addDoc(collection(db, "clients"), { 
      ...client, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    });
    return ref.id;
  }
}

export async function deleteClient(id: string): Promise<void> {
  const ref = doc(db, "clients", id);
  await deleteDoc(ref);
}

export async function fetchActiveSubscribers(lang: "en" | "pt" = "en"): Promise<Subscriber[]> {
  const collectionName = lang === "pt" ? "pt_subscribers" : "subscribers";
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subscriber));
}
