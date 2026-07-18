import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import { FullScreenSpinner } from "../components/ui/Spinner";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { companies, loading: companyLoading } = useCompany();
  const location = useLocation();

  if (loading || companyLoading) return <FullScreenSpinner label="Restoring your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  const hasCompanies = companies.length > 0;
  const isCreatePage = location.pathname === "/create-company";
  if (!hasCompanies && !isCreatePage) {
    return <Navigate to="/create-company" replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};
