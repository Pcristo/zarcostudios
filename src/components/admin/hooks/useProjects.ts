import { useState, useCallback } from "react";
import { Project, ClientProject } from "../types/project";
import { 
  fetchPortfolioProjects, 
  savePortfolioProject, 
  deletePortfolioProject,
  fetchClientProjects,
  saveClientProject,
  deleteClientProject
} from "../services/projectService";

export function useProjects() {
  const [portfolioProjects, setPortfolioProjects] = useState<Project[]>([]);
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPortfolioProjects();
      setPortfolioProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClientProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClientProjects();
      setClientProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePortfolio = useCallback(async (project: Partial<Project>) => {
    try {
      const id = await savePortfolioProject(project);
      await loadPortfolio();
      return id;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadPortfolio]);

  const removePortfolio = useCallback(async (id: string) => {
    try {
      await deletePortfolioProject(id);
      await loadPortfolio();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadPortfolio]);

  const saveClientProj = useCallback(async (proj: Partial<ClientProject>) => {
    try {
      const id = await saveClientProject(proj);
      await loadClientProjects();
      return id;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadClientProjects]);

  const removeClientProj = useCallback(async (id: string) => {
    try {
      await deleteClientProject(id);
      await loadClientProjects();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadClientProjects]);

  return {
    portfolioProjects,
    setPortfolioProjects,
    clientProjects,
    setClientProjects,
    loading,
    loadPortfolio,
    loadClientProjects,
    savePortfolio,
    removePortfolio,
    saveClientProj,
    removeClientProj
  };
}
