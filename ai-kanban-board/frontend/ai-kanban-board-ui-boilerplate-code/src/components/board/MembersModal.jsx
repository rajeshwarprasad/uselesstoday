import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { UserPlus, X, Link2, Copy, Check, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import Avatar from "../ui/Avatar";
import { boardApi } from "../../lib/api";

const MembersModal = ({ open, onClose, boardId, members, setMembers, canManage, ownerId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (open && boardId) {
      boardApi.listInvites(boardId).then(setInvites).catch(() => {});
    }
  }, [open, boardId]);

  const invite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const invite = await boardApi.generateInvite(boardId, { email: email.trim() });
      setInvites((prev) => [invite, ...prev]);
      toast.success("Invite sent via email");
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async () => {
    try {
      const invite = await boardApi.generateInvite(boardId, { email: email.trim() || undefined });
      setInvites((prev) => [invite, ...prev]);
      toast.success(email.trim() ? "Invite sent via email" : "Invite link created");
      if (email.trim()) setEmail("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const copyLink = async (link, id) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      toast.success("Link copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const revokeInvite = async (inviteId) => {
    try {
      await boardApi.deleteInvite(boardId, inviteId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success("Invite link revoked");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (userId) => {
    try {
      await boardApi.removeMember(boardId, userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Members" description="Invite teammates to collaborate in real time.">
      {canManage && (
        <form onSubmit={invite} className="mb-5 flex gap-2">
          <Input placeholder="teammate@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" loading={loading} className="shrink-0">
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
        </form>
      )}

      {canManage && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">Shareable Link</p>
            <Button size="sm" variant="ghost" onClick={generateLink}>
              <Link2 className="h-3.5 w-3.5" /> Generate link
            </Button>
          </div>
          {invites.length > 0 && (
            <ul className="space-y-1.5">
              {invites.map((inv) => (
                <li key={inv.id} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs">
                  <span className="flex-1 truncate font-mono text-muted">{inv.link}</span>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize text-muted">{inv.role}</span>
                  {inv.expired ? (
                    <span className="shrink-0 text-[10px] text-priority-urgent">Expired</span>
                  ) : (
                    <button onClick={() => copyLink(inv.link, inv.id)} className="shrink-0 rounded p-1 text-faint hover:text-ink">
                      {copiedId === inv.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  <button onClick={() => revokeInvite(inv.id)} className="shrink-0 rounded p-1 text-faint hover:text-priority-urgent">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ul className="space-y-1">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2">
            <Avatar name={m.name} id={m.id} src={m.avatar_url} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <p className="truncate text-xs text-faint">{m.email}</p>
            </div>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium capitalize text-muted">{m.role}</span>
            {canManage && m.id !== ownerId && (
              <button onClick={() => remove(m.id)} className="rounded-full p-1.5 text-faint transition-colors hover:bg-elevated hover:text-priority-urgent">
                <X className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default MembersModal;
