import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogOut, Command, Zap, FolderKanban, CheckSquare, Users, Building2, Pencil, Check, X, Lock, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import { useLayout } from "../components/layout/AppLayout";
import { useWorkspace } from "../hooks/useWorkspace";
import Topbar from "../components/layout/Topbar";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import Avatar from "../components/ui/Avatar";
import CompanyRenameModal from "../components/company/CompanyRenameModal";
import { authApi } from "../lib/api";
import { cn } from "../lib/utils";

const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
      checked ? "bg-brand-500" : "bg-elevated"
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[var(--shadow-card)] transition-transform duration-200",
        checked ? "translate-x-[22px]" : "translate-x-0.5"
      )}
    />
  </button>
);

const Card = ({ title, description, children }) => (
  <section className="rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
    <h3 className="font-display text-sm font-semibold tracking-tight">{title}</h3>
    {description && <p className="mt-1 text-xs text-muted">{description}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const { currentCompany, update: updateCompany } = useCompany();
  const { openCreateBoard } = useLayout();
  const { boards, tasks, members } = useWorkspace();
  const navigate = useNavigate();

  const [reduceMotion, setReduceMotion] = useState(
    () => localStorage.getItem("pref-reduced-motion") === "true"
  );
  const [renameOpen, setRenameOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion ? "true" : "false";
    localStorage.setItem("pref-reduced-motion", String(reduceMotion));
  }, [reduceMotion]);

  const saveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) return toast.error("Name cannot be empty");
    if (trimmed === user?.name) { setEditingName(false); return; }
    setSaving(true);
    try {
      await updateUser({ name: trimmed });
      toast.success("Name updated");
      setEditingName(false);
    } catch (e) {
      toast.error(e.message || "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords do not match");
    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast.error("Enter your password to confirm");
    setDeleteLoading(true);
    try {
      await authApi.deleteAccount({ password: deletePassword });
      toast.success("Account deleted");
      logout();
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Profile and preferences" onCreateBoard={openCreateBoard} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 px-6 py-8 md:px-8">
          {/* Profile */}
          <Card title="Profile" description="How you appear across your workspace.">
            <div className="flex items-center gap-4">
              <Avatar name={user?.name} id={user?.id} src={user?.avatar_url} size="lg" className="h-16 w-16 text-lg" />
              <div className="min-w-0 flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setEditingName(false); setNameValue(user?.name || ""); } }}
                      className="input-base rounded-xl py-1.5 text-lg font-semibold"
                    />
                    <Button size="sm" onClick={saveName} disabled={saving}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameValue(user?.name || ""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-semibold tracking-tight">{user?.name}</p>
                    <button
                      onClick={() => { setNameValue(user?.name || ""); setEditingName(true); }}
                      className="rounded-lg p-1 text-faint transition-colors hover:bg-surface-2 hover:text-ink"
                      title="Edit name"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <p className="truncate text-sm text-muted">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Company */}
        {currentCompany && (
          <Card title="Company" description="Your current workspace.">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{currentCompany.name}</p>
                {currentCompany.description && (
                  <p className="text-xs text-muted truncate">{currentCompany.description}</p>
                )}
                <p className="text-xs text-muted">{currentCompany.member_count || 0} members</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setRenameOpen(true)} title="Edit company">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        )}

        <CompanyRenameModal
          open={renameOpen}
          onClose={() => setRenameOpen(false)}
          company={currentCompany}
          onSave={updateCompany}
        />

        {/* Security */}
          <Card title="Security" description="Manage your password.">
            <form onSubmit={changePassword} className="space-y-3">
              <Input
                id="currentPassword"
                label="Current password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              />
              <Input
                id="newPassword"
                label="New password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
              <Input
                id="confirmPassword"
                label="Confirm new password"
                type="password"
                placeholder="Repeat password"
                autoComplete="new-password"
                required
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              />
              <Button type="submit" size="sm" loading={pwLoading}>
                <Lock className="h-4 w-4" /> Change password
              </Button>
            </form>
          </Card>

        {/* Workspace */}
          <Card title="Workspace" description="Your activity at a glance.">
            <div className="grid grid-cols-3 gap-3">
              <Metric icon={FolderKanban} label="Boards" value={boards.length} tint="#2f8159" />
              <Metric icon={CheckSquare} label="Tasks" value={tasks.length} tint="#0ea5e9" />
              <Metric icon={Users} label="People" value={members.length} tint="#10b981" />
            </div>
          </Card>

          {/* Preferences */}
          <Card title="Preferences" description="Saved to this browser.">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">Reduce motion</p>
                <p className="mt-0.5 text-xs text-muted">Minimize animations and transitions across the app.</p>
              </div>
              <Switch checked={reduceMotion} onChange={setReduceMotion} />
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t pt-5">
              <div>
                <p className="text-sm font-medium text-ink">Command menu</p>
                <p className="mt-0.5 text-xs text-muted">Jump anywhere, search boards, create tasks.</p>
              </div>
              <kbd className="flex items-center gap-0.5 rounded-md bg-surface-2 px-2 py-1 text-[11px] font-semibold text-muted">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </Card>

          {/* About */}
          <Card title="About">
            <div className="flex items-center gap-3">
              <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-2xl shadow-[var(--shadow-brand)]">
                <Zap className="h-5 w-5 fill-white text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">FlowUpBoard</p>
                <p className="text-xs text-muted">AI-powered Kanban · Light theme</p>
              </div>
            </div>
          </Card>

          {/* Account */}
          <Card title="Account" description="Manage your session.">
            <div className="space-y-4">
              <Button variant="danger" onClick={() => { logout(); navigate("/login"); }}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-priority-urgent">Delete account</p>
                    <p className="mt-0.5 text-xs text-muted">Permanently delete your account and all associated data.</p>
                  </div>
                  <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Delete Account Modal */}
          {deleteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="mx-4 w-full max-w-sm rounded-3xl border border-line bg-surface p-6 shadow-xl">
                <h3 className="font-display text-lg font-semibold text-priority-urgent">Delete Account</h3>
                <p className="mt-2 text-sm text-muted">
                  This action is irreversible. All your data will be permanently deleted.
                </p>
                <Input
                  id="delete-password"
                  label="Enter password to confirm"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-4"
                />
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setDeleteOpen(false); setDeletePassword(""); }}>
                    Cancel
                  </Button>
                  <Button variant="danger" className="flex-1" loading={deleteLoading} onClick={handleDeleteAccount}>
                    Delete forever
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const Metric = ({ icon: Icon, label, value, tint }) => (
  <div className="rounded-2xl bg-surface-2/60 p-4">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${tint}1a`, color: tint }}>
      <Icon className="h-4 w-4" />
    </div>
    <p className="font-display text-2xl font-semibold tracking-tight tabular text-ink">{value}</p>
    <p className="mt-0.5 text-xs text-muted">{label}</p>
  </div>
);

export default Settings;
