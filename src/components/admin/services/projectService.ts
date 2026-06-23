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
import { Project, ClientProject } from "../types/project";

export async function fetchPortfolioProjects(): Promise<Project[]> {
  const snapshot = await getDocs(collection(db, "projects"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
}

export async function savePortfolioProject(project: Partial<Project>): Promise<string> {
  if (project.id) {
    const ref = doc(db, "projects", project.id);
    await setDoc(ref, project, { merge: true });
    return project.id;
  } else {
    const ref = await addDoc(collection(db, "projects"), project);
    return ref.id;
  }
}

export async function deletePortfolioProject(id: string): Promise<void> {
  await deleteDoc(doc(db, "projects", id));
}

export async function fetchClientProjects(): Promise<ClientProject[]> {
  const snapshot = await getDocs(collection(db, "clientProjects"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClientProject));
}

export async function saveClientProject(proj: Partial<ClientProject>): Promise<string> {
  if (proj.id) {
    const ref = doc(db, "clientProjects", proj.id);
    await setDoc(ref, { ...proj, updatedAt: new Date() }, { merge: true });
    return proj.id;
  } else {
    const ref = await addDoc(collection(db, "clientProjects"), {
      ...proj,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return ref.id;
  }
}

export async function deleteClientProject(id: string): Promise<void> {
  await deleteDoc(doc(db, "clientProjects", id));
}
