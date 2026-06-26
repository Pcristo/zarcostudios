import { useState, useCallback } from "react";
import { Invoice, CompanySettings } from "../types/invoice";
import {
  getInvoices,
  saveInvoice as saveInvoiceService,
  deleteInvoice as deleteInvoiceService,
} from "../services/invoiceService";

export function useInvoices(showAdminToast: (msg: string, type?: "success" | "error" | "warning") => void) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error: any) {
      console.error("Fetch invoices error:", error);
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  const saveInvoice = useCallback(async (invoice: Invoice, companySettings: CompanySettings) => {
    setSavingInvoice(true);
    try {
      const { id: savedId } = await saveInvoiceService(invoice, companySettings);
      const isNew = invoice.id.startsWith("invoice-temp-");
      showAdminToast(
        isNew ? "Invoice/Bill created successfully!" : "Invoice/Bill updated successfully!",
        "success"
      );
      await fetchInvoices();
      return { success: true, savedId };
    } catch (error: any) {
      console.error("Save invoice error:", error);
      showAdminToast(`Failed to save invoice: ${error.message || error}`, "error");
      return { success: false, savedId: null };
    } finally {
      setSavingInvoice(false);
    }
  }, [fetchInvoices, showAdminToast]);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      const invoice = invoices.find((inv) => inv.id === id);
      if (!invoice) return false;
      await deleteInvoiceService(id, invoice);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      showAdminToast("Invoice/Bill moved to Trash Bin", "success");
      return true;
    } catch (error: any) {
      console.error("Delete invoice error:", error);
      showAdminToast(`Failed to delete invoice: ${error.message || error}`, "error");
      return false;
    }
  }, [invoices, showAdminToast]);

  return {
    invoices,
    setInvoices,
    loadingInvoices,
    savingInvoice,
    fetchInvoices,
    saveInvoice,
    deleteInvoice,
  };
}
