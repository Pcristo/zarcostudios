import { useState, useCallback } from "react";
import { Project, ClientProject } from "../types/project";
import {
  getProjects,
  saveProject as saveProjectService,
  deleteProject as deleteProjectService,
  toggleProjectStatusField as toggleProjectStatusFieldService,
  getClientProjects,
  saveClientProject as saveClientProjectService,
  deleteClientProject as deleteClientProjectService,
} from "../services/projectService";

export function useProjects(showAdminToast: (msg: string, type?: "success" | "error" | "warning") => void) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [loadingClientProjects, setLoadingClientProjects] = useState(false);
  const [savingClientProject, setSavingClientProject] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error: any) {
      console.error("Fetch projects error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProject = useCallback(async (project: Project, isNew: boolean) => {
    setSavingProject(true);
    try {
      await saveProjectService(project, isNew);
      showAdminToast(
        isNew ? "Project created successfully!" : "Project updated successfully!",
        "success"
      );
      await fetchProjects();
      return true;
    } catch (error: any) {
      console.error("Save project error:", error);
      showAdminToast(`Failed to save project: ${error.message || error}`, "error");
      return false;
    } finally {
      setSavingProject(false);
    }
  }, [fetchProjects, showAdminToast]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const project = projects.find((p) => p.id === id);
      if (!project) return false;
      await deleteProjectService(id, project);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showAdminToast("Portfolio project moved to Trash Bin", "success");
      return true;
    } catch (error: any) {
      console.error("Delete project error:", error);
      showAdminToast(`Failed to delete project: ${error.message || error}`, "error");
      return false;
    }
  }, [projects, showAdminToast]);

  const toggleProjectStatusField = useCallback(async (id: string, field: "isActive" | "isFeatured", currentVal: boolean) => {
    try {
      await toggleProjectStatusFieldService(id, field, currentVal);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: !currentVal } : p))
      );
      showAdminToast(`Project status updated successfully!`, "success");
      return true;
    } catch (error: any) {
      console.error("Toggle project status error:", error);
      showAdminToast(`Failed to update status: ${error.message || error}`, "error");
      return false;
    }
  }, [showAdminToast]);

  // --- Client Projects (Managed Projects) ---

  const fetchClientProjects = useCallback(async () => {
    setLoadingClientProjects(true);
    try {
      const data = await getClientProjects();
      setClientProjects(data);
    } catch (error: any) {
      console.error("Fetch client projects error:", error);
    } finally {
      setLoadingClientProjects(false);
    }
  }, []);

  const saveClientProject = useCallback(async (project: ClientProject) => {
    setSavingClientProject(true);
    try {
      await saveClientProjectService(project);
      const isNew = project.id.startsWith("client-proj-temp-");
      showAdminToast(
        isNew ? "Internal project created successfully!" : "Internal project updated successfully!",
        "success"
      );
      await fetchClientProjects();
      return true;
    } catch (error: any) {
      console.error("Save client project error:", error);
      showAdminToast(`Failed to save client project: ${error.message || error}`, "error");
      return false;
    } finally {
      setSavingClientProject(false);
    }
  }, [fetchClientProjects, showAdminToast]);

  const deleteClientProject = useCallback(async (id: string) => {
    try {
      const project = clientProjects.find((p) => p.id === id);
      if (!project) return false;
      await deleteClientProjectService(id, project);
      setClientProjects((prev) => prev.filter((p) => p.id !== id));
      showAdminToast("Client project moved to Trash Bin", "success");
      return true;
    } catch (error: any) {
      console.error("Delete client project error:", error);
      showAdminToast(`Failed to delete client project: ${error.message || error}`, "error");
      return false;
    }
  }, [clientProjects, showAdminToast]);

  return {
    projects,
    setProjects,
    loading,
    savingProject,
    fetchProjects,
    saveProject,
    deleteProject,
    toggleProjectStatusField,
    
    clientProjects,
    setClientProjects,
    loadingClientProjects,
    savingClientProject,
    fetchClientProjects,
    saveClientProject,
    deleteClientProject,
  };
}
