import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Client } from "../types/client";

export const getClients = async (): Promise<Client[]> => {
  try {
    const q = query(collection(db, "clients"), orderBy("fullName", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Client[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "clients");
    throw error;
  }
};

export const saveClient = async (client: Client): Promise<void> => {
  const isNew = client.id.startsWith("client-temp-");
  try {
    const clientData = { ...client };
    const clientId = clientData.id;
    delete (clientData as any).id;

    if (isNew) {
      await addDoc(collection(db, "clients"), {
        ...clientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      if (clientData.createdAt) delete (clientData as any).createdAt;
      await updateDoc(doc(db, "clients", clientId), {
        ...clientData,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      isNew ? OperationType.CREATE : OperationType.UPDATE,
      "clients"
    );
    throw error;
  }
};

export const deleteClient = async (id: string, client: Client): Promise<void> => {
  try {
    // Move to Trash
    await setDoc(doc(db, "trash", id), {
      originalId: id,
      type: "client",
      name: client.fullName || client.companyName || "Unnamed Client",
      details: client.email || client.companyName || "",
      deletedAt: new Date().toISOString(),
      originalCollection: "clients",
      data: client,
    });
    // Delete from main collection
    await deleteDoc(doc(db, "clients", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
    throw error;
  }
};
