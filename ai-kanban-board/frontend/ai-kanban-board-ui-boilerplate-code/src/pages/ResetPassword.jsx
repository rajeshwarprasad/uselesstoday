import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Zap, CheckCircle, ArrowLeft } from "lucide-react";
import { authApi } from "../lib/api";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";
import AuthAside from "../components/auth/AuthAside";
import SEO from "../components/seo/SEO";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SEO title="Reset Password" path="/reset-password" noindex />
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm animate-in">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" className="flex items-center justify-center gap-2.5 font-semibold">
              <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-2xl shadow-[var(--shadow-brand)]">
                <Zap className="h-5 w-5 fill-white text-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">FlowUpBoard</span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="card rounded-3xl p-8 shadow-[var(--shadow-soft)]">
            {done ? (
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-green-50 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">Password reset!</h1>
                <p className="mt-2 text-sm text-muted">Your password has been updated.</p>
                <Button size="lg" className="mt-6 w-full" onClick={() => navigate("/login")}>
                  Log in with new password
                </Button>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-semibold tracking-tight">Set new password</h1>
                <p className="mt-1.5 text-sm text-muted">Choose a strong password for your account.</p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <Input
                    id="password"
                    label="New password"
                    type="password"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    id="confirm"
                    label="Confirm password"
                    type="password"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <Button type="submit" size="lg" className="w-full" loading={loading}>
                    Reset password
                  </Button>
                </form>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-sm text-muted">
            <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-500">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to login
            </Link>
          </p>
        </div>
      </div>

      <AuthAside
        title="Reset your password"
        subtitle="Almost there — just pick a new password."
      />
    </div>
  );
};

export default ResetPassword;
