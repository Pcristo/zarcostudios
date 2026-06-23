import { useState, useCallback } from "react";
import { Invoice } from "../types/invoice";
import { fetchInvoices, saveInvoice as apiSaveInvoice, deleteInvoice as apiDeleteInvoice } from "../services/invoiceService";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveInvoice = useCallback(async (invoice: Partial<Invoice>) => {
    try {
      const id = await apiSaveInvoice(invoice);
      await loadInvoices();
      return id;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadInvoices]);

  const removeInvoice = useCallback(async (id: string) => {
    try {
      await apiDeleteInvoice(id);
      await loadInvoices();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadInvoices]);

  return {
    invoices,
    setInvoices,
    loading,
    loadInvoices,
    saveInvoice,
    removeInvoice
  };
}
