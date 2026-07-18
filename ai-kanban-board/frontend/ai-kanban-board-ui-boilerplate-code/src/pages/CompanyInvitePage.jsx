import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, LogIn } from "lucide-react";
import { companyInviteApi, authApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import Button from "../components/ui/Button";

const CompanyInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshCompanies } = useCompany();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    companyInviteApi
      .get(token)
      .then(setInvite)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleJoin = async () => {
    if (!user) {
      navigate(`/login?redirect=/company-invite/${token}`);
      return;
    }
    setJoining(true);
    try {
      const result = await companyInviteApi.accept(token);
      await refreshCompanies();
      setJoined(true);
      toast.success(`Joined ${result.company.name}!`);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold">Invalid Invite</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <Link to="/dashboard" className="mt-6 inline-block">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="font-display text-xl font-semibold tracking-tight">Join Company</h1>
        <p className="mt-2 text-sm text-muted">You've been invited to join</p>
        <p className="mt-1 font-display text-lg font-semibold text-brand-600">
          {invite.company_name}
        </p>
        <p className="mt-1 text-xs text-faint">as {invite.role}</p>

        {joined ? (
          <div className="mt-6 flex flex-col items-center gap-2 text-green-500">
            <CheckCircle className="h-6 w-6" />
            <p className="text-sm font-medium">Joined! Redirecting...</p>
          </div>
        ) : (
          <Button className="mt-6 w-full" onClick={handleJoin} loading={joining}>
            {user ? "Join Company" : "Login to Join"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CompanyInvitePage;
