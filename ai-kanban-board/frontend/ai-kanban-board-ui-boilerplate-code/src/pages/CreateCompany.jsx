import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";
import { useCompany } from "../context/CompanyContext";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";

const CreateCompany = () => {
  const { create } = useCompany();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await create(form);
      toast.success("Company created!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm animate-in">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 font-semibold">
          <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-2xl shadow-[var(--shadow-brand)]">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight blink-text">FlowUpBoard</span>
        </Link>

        <div className="card rounded-3xl p-8 shadow-[var(--shadow-soft)]">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Create your company</h1>
          <p className="mt-1.5 text-sm text-muted">
            Set up your workspace. You can invite teammates later.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input
              label="Company name"
              placeholder="Acme Inc."
              autoFocus
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Description (optional)"
              placeholder="We build amazing things"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Create company
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCompany;
