import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { companyApi, clearToken } from "../lib/api";
import { useAuth } from "./AuthContext";

const CompanyContext = createContext(null);

export const CompanyProvider = ({ children }) => {
  const { user, refreshUser, logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCompanyId, setCurrentCompanyId] = useState(
    () => localStorage.getItem("current-company-id") || null
  );
  const currentCompanyIdRef = useRef(currentCompanyId);
  currentCompanyIdRef.current = currentCompanyId;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await companyApi.list();
      setCompanies(list);
      if (list.length > 0 && !list.find((c) => c.id === currentCompanyIdRef.current)) {
        const next = list[0].id;
        setCurrentCompanyId(next);
        currentCompanyIdRef.current = next;
        localStorage.setItem("current-company-id", next);
      }
    } catch {
      clearToken();
      setCompanies([]);
      setCurrentCompanyId(null);
      localStorage.removeItem("current-company-id");
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setCompanies([]);
      setLoading(false);
    }
  }, [user, refresh]);

  const switchCompany = useCallback((id) => {
    setCurrentCompanyId(id);
    localStorage.setItem("current-company-id", id);
  }, []);

  const create = useCallback(async (data) => {
    const result = await companyApi.create(data);
    const company = result.company;
    setCompanies((prev) => [...prev, company]);
    setCurrentCompanyId(company.id);
    localStorage.setItem("current-company-id", company.id);
    await refreshUser();
    return result;
  }, [refreshUser]);

  const remove = useCallback(async (id) => {
    await companyApi.remove(id);
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    if (currentCompanyId === id) {
      const remaining = companies.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setCurrentCompanyId(remaining[0].id);
        localStorage.setItem("current-company-id", remaining[0].id);
      } else {
        setCurrentCompanyId(null);
        localStorage.removeItem("current-company-id");
      }
    }
  }, [currentCompanyId, companies]);

  const update = useCallback(async (id, data) => {
    const updated = await companyApi.update(id, data);
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    return updated;
  }, []);

  const currentCompany = companies.find((c) => c.id === currentCompanyId) || null;

  return (
    <CompanyContext.Provider
      value={{
        companies,
        loading,
        currentCompany,
        currentCompanyId,
        switchCompany,
        create,
        remove,
        update,
        refresh,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
};
