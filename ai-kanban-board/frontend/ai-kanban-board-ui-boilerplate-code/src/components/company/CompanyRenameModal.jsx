import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Input";

const CompanyRenameModal = ({ open, onClose, company, onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && company) {
      setName(company.name || "");
      setDescription(company.description || "");
    }
  }, [open, company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSave(company.id, { name: name.trim(), description: description.trim() || null });
      toast.success("Company updated");
      onClose();
    } catch {
      toast.error("Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit company" description="Rename your company or update its description." size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="company-name"
          label="Company name"
          placeholder="Acme Inc."
          autoFocus
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          id="company-desc"
          label="Description (optional)"
          rows={3}
          placeholder="What does this company do?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading} disabled={!name.trim()}>Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompanyRenameModal;
