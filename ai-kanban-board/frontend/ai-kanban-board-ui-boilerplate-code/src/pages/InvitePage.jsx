import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, LogIn } from "lucide-react";
import { inviteApi, authApi, setToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Turnstile from "../components/ui/Turnstile";

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { refresh: refreshCompanies } = useCompany();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState(user ? "join" : "signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [signingUp, setSigningUp] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);

  const onVerify = useCallback((token) => setTurnstileToken(token), []);

  useEffect(() => {
    inviteApi
      .get(token)
      .then(setInvite)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (user && view === "signup") setView("join");
  }, [user]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!turnstileToken) return toast.error("Please complete the verification");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters with uppercase, lowercase, and a number");
    setSigningUp(true);
    try {
      const result = await authApi.register({ ...form, "cf-turnstile-response": turnstileToken });
      setToken(result.token);
      await refreshUser();
      toast.success("Account created!");
      setView("join");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSigningUp(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const result = await inviteApi.accept(token);
      await refreshCompanies();
      setJoined(true);
      toast.success("You joined the board!");
      setTimeout(() => navigate(`/board/${result.board.id}`), 1500);
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
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${invite.board_color || "#6366f1"}1f`, color: invite.board_color || "#6366f1" }}
        >
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl font-semibold tracking-tight">Join Board</h1>
        <p className="mt-2 text-sm text-muted">
          You've been invited to join
        </p>
        <p className="mt-1 font-display text-lg font-semibold" style={{ color: invite.board_color || "#6366f1" }}>
          {invite.board_title}
        </p>
        <p className="mt-1 text-xs text-faint">as {invite.role}</p>

        {joined ? (
          <div className="mt-6 flex flex-col items-center gap-2 text-green-500">
            <CheckCircle className="h-6 w-6" />
            <p className="text-sm font-medium">Joined! Redirecting...</p>
          </div>
        ) : view === "signup" ? (
          <>
            <form onSubmit={handleSignup} className="mt-6 space-y-3 text-left">
              <Input
                id="invite-name"
                label="Full name"
                placeholder="Jane Doe"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                id="invite-email"
                label="Email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                id="invite-password"
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Turnstile onVerify={onVerify} />
              <Button type="submit" className="w-full" loading={signingUp}>
                Create account &amp; join
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted">
              Already have an account?{" "}
              <button onClick={() => setView("login")} className="font-semibold text-brand-600 hover:text-brand-500">
                Log in
              </button>
            </p>
          </>
        ) : view === "login" ? (
          <>
            <p className="mt-4 text-xs text-muted">Log in with your existing account, then come back to join.</p>
            <Button className="mt-4 w-full" onClick={() => navigate(`/login?redirect=/invite/${token}`)}>
              Log in to join
            </Button>
            <p className="mt-4 text-center text-xs text-muted">
              Don't have an account?{" "}
              <button onClick={() => setView("signup")} className="font-semibold text-brand-600 hover:text-brand-500">
                Sign up
              </button>
            </p>
          </>
        ) : (
          <Button className="mt-6 w-full" onClick={handleJoin} loading={joining}>
            Join Board
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
