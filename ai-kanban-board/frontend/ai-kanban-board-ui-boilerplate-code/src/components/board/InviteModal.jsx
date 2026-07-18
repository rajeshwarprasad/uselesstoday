import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { UserPlus, Link2, Copy, Check, Trash2, ChevronDown } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import { boardApi } from "../../lib/api";
import { useBoards } from "../../context/BoardsContext";

const InviteModal = ({ open, onClose }) => {
  const { boards } = useBoards();
  const [selectedBoard, setSelectedBoard] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const ownedBoards = useMemo(() => boards.filter((b) => b.is_owner), [boards]);

  useEffect(() => {
    if (open && ownedBoards.length && !selectedBoard) {
      setSelectedBoard(ownedBoards[0].id);
    }
  }, [open, ownedBoards, selectedBoard]);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setInvites([]);
      setCopiedId(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && selectedBoard) {
      boardApi.listInvites(selectedBoard).then(setInvites).catch(() => {});
    }
  }, [open, selectedBoard]);

  const invite = async (e) => {
    e.preventDefault();
    if (!email.trim() || !selectedBoard) return;
    setLoading(true);
    try {
      const inv = await boardApi.generateInvite(selectedBoard, { email: email.trim() });
      setInvites((prev) => [inv, ...prev]);
      toast.success("Invite sent via email");
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async () => {
    if (!selectedBoard) return;
    try {
      const inv = await boardApi.generateInvite(selectedBoard, { email: email.trim() || undefined });
      setInvites((prev) => [inv, ...prev]);
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
    if (!selectedBoard) return;
    try {
      await boardApi.deleteInvite(selectedBoard, inviteId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success("Invite link revoked");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!ownedBoards.length) {
    return (
      <Modal open={open} onClose={onClose} title="Invite teammate" description="You need to create a board first.">
        <p className="text-sm text-muted">Create a board, then invite teammates to collaborate.</p>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite teammate" description="Add a teammate to one of your boards." size="md">
      {/* Board selector */}
      <div className="mb-5">
        <label className="block text-xs font-medium tracking-tight text-muted mb-1.5">Select board</label>
        <div className="relative">
          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="input-base w-full cursor-pointer appearance-none rounded-full pr-10"
          >
            {ownedBoards.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        </div>
      </div>

      {/* Email invite */}
      <form onSubmit={invite} className="mb-5 flex gap-2">
        <Input
          placeholder="teammate@company.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" loading={loading} className="shrink-0">
          <UserPlus className="h-4 w-4" /> Invite
        </Button>
      </form>

      {/* Shareable link */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-muted">Shareable Link</p>
        <Button size="sm" variant="ghost" onClick={generateLink}>
          <Link2 className="h-3.5 w-3.5" /> Generate link
        </Button>
      </div>
      {invites.length > 0 ? (
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
      ) : (
        <p className="text-center text-xs text-faint py-4">No invite links yet. Generate one to share.</p>
      )}
    </Modal>
  );
};

export default InviteModal;
