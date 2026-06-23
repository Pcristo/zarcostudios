import { useState, useCallback } from "react";
import { Client } from "../types/client";
import { fetchClients, saveClient as apiSaveClient, deleteClient as apiDeleteClient } from "../services/clientService";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveClient = useCallback(async (client: Partial<Client>) => {
    setLoading(true);
    try {
      const id = await apiSaveClient(client);
      await loadClients();
      return id;
    } finally {
      setLoading(false);
    }
  }, [loadClients]);

  const removeClient = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await apiDeleteClient(id);
      await loadClients();
    } finally {
      setLoading(false);
    }
  }, [loadClients]);

  return {
    clients,
    setClients,
    loading,
    loadClients,
    saveClient,
    removeClient
  };
}
