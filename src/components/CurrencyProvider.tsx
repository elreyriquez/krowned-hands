"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { QuoteCurrency } from "@/lib/pricing";

const STORAGE_KEY = "krowned-hands-quote-currency";

type CurrencyContextValue = {
  currency: QuoteCurrency;
  setCurrency: (c: QuoteCurrency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<QuoteCurrency>("usd");

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "usd" || v === "jmd") setCurrencyState(v);
    } catch {
      /* ignore */
    }
  }, []);

  const setCurrency = useCallback((c: QuoteCurrency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useQuoteCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useQuoteCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
