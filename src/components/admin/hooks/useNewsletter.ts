import { useState, useCallback } from "react";
import { Subscriber } from "../types/client";
import { fetchActiveSubscribers } from "../services/clientService";

export function useNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSubscribers = useCallback(async (lang: "en" | "pt" = "en") => {
    setLoading(true);
    try {
      const data = await fetchActiveSubscribers(lang);
      setSubscribers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subscribers,
    setSubscribers,
    loading,
    loadSubscribers,
  };
}
