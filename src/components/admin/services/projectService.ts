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
import { Project, ClientProject } from "../types/project";

// --- Portfolio Projects Service ---

export const getProjects = async (): Promise<Project[]> => {
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "projects");
    throw error;
  }
};

export const saveProject = async (project: Project, isNew: boolean): Promise<void> => {
  try {
    const projectData = { ...project };
    const projectId = projectData.id;
    delete (projectData as any).id;

    if (isNew) {
      await addDoc(collection(db, "projects"), {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      if (projectData.createdAt) delete (projectData as any).createdAt;
      await updateDoc(doc(db, "projects", projectId), {
        ...projectData,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      isNew ? OperationType.CREATE : OperationType.UPDATE,
      "projects"
    );
    throw error;
  }
};

export const deleteProject = async (id: string, project: Project): Promise<void> => {
  try {
    // Move to Trash
    await setDoc(doc(db, "trash", id), {
      originalId: id,
      type: "project",
      name: project.title || project.titlePt || "Unnamed Project",
      details: project.category || "",
      deletedAt: new Date().toISOString(),
      originalCollection: "projects",
      data: project,
    });
    // Delete from projects
    await deleteDoc(doc(db, "projects", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    throw error;
  }
};

export const toggleProjectStatusField = async (
  id: string,
  field: "isActive" | "isFeatured",
  currentVal: boolean
): Promise<void> => {
  try {
    const projectRef = doc(db, "projects", id);
    await updateDoc(projectRef, {
      [field]: !currentVal,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
    throw error;
  }
};

// --- Client (Managed) Projects Service ---

export const getClientProjects = async (): Promise<ClientProject[]> => {
  try {
    const q = query(collection(db, "clientProjects"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ClientProject[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "clientProjects");
    throw error;
  }
};

export const saveClientProject = async (project: ClientProject): Promise<void> => {
  const isNew = project.id.startsWith("client-proj-temp-");
  try {
    const projectData = { ...project };
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
    } else {
      if (projectData.createdAt) delete (projectData as any).createdAt;
      await updateDoc(doc(db, "clientProjects", projectId), {
        ...projectData,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      isNew ? OperationType.CREATE : OperationType.UPDATE,
      "clientProjects"
    );
    throw error;
  }
};

export const deleteClientProject = async (id: string, project: ClientProject): Promise<void> => {
  try {
    // Move to Trash
    await setDoc(doc(db, "trash", id), {
      originalId: id,
      type: "project",
      name: project.projectName || "Unnamed Project",
      details: project.status || "",
      deletedAt: new Date().toISOString(),
      originalCollection: "clientProjects",
      data: project,
    });
    // Delete from clientProjects
    await deleteDoc(doc(db, "clientProjects", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `clientProjects/${id}`);
    throw error;
  }
};
