import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Zap, Mail, ArrowLeft } from "lucide-react";
import { authApi } from "../lib/api";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";
import AuthAside from "../components/auth/AuthAside";
import Turnstile from "../components/ui/Turnstile";
import SEO from "../components/seo/SEO";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);

  const onVerify = useCallback((token) => setTurnstileToken(token), []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!turnstileToken) return toast.error("Please complete the verification");
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim(), "cf-turnstile-response": turnstileToken });
      setSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SEO title="Forgot Password" path="/forgot-password" noindex />
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
            {sent ? (
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-green-50 text-green-600">
                  <Mail className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">Check your email</h1>
                <p className="mt-2 text-sm text-muted">
                  If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                </p>
                <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-500">
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </Link>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-semibold tracking-tight">Forgot password?</h1>
                <p className="mt-1.5 text-sm text-muted">
                  Enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Turnstile onVerify={onVerify} />
                  <Button type="submit" size="lg" className="w-full" loading={loading}>
                    Send reset link
                  </Button>
                </form>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-sm text-muted">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <AuthAside
        title="Reset your password"
        subtitle="We'll help you get back into your account in no time."
      />
    </div>
  );
};

export default ForgotPassword;
