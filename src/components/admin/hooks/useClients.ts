import { useState, useCallback } from "react";
import { Client } from "../types/client";
import { getClients as getClientsService, saveClient as saveClientService, deleteClient as deleteClientService } from "../services/clientService";

export function useClients(showAdminToast: (msg: string, type?: "success" | "error" | "warning") => void) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [savingClient, setSavingClient] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const data = await getClientsService();
      setClients(data);
    } catch (error: any) {
      console.error("Fetch clients error:", error);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const saveClient = useCallback(async (client: Client) => {
    setSavingClient(true);
    try {
      await saveClientService(client);
      const isNew = client.id.startsWith("client-temp-");
      showAdminToast(
        isNew ? "Client onboarded successfully!" : "Profile updated successfully!",
        "success"
      );
      await fetchClients();
      return true;
    } catch (error: any) {
      console.error("Save client error:", error);
      showAdminToast(`Failed to save client: ${error.message || error}`, "error");
      return false;
    } finally {
      setSavingClient(false);
    }
  }, [fetchClients, showAdminToast]);

  const deleteClient = useCallback(async (id: string) => {
    try {
      const client = clients.find((c) => c.id === id);
      if (!client) return false;
      await deleteClientService(id, client);
      setClients((prev) => prev.filter((c) => c.id !== id));
      showAdminToast("Client moved to Trash Bin", "success");
      return true;
    } catch (error: any) {
      console.error("Delete client error:", error);
      showAdminToast(`Failed to delete client: ${error.message || error}`, "error");
      return false;
    }
  }, [clients, showAdminToast]);

  return {
    clients,
    setClients,
    loadingClients,
    savingClient,
    fetchClients,
    saveClient,
    deleteClient,
  };
}
