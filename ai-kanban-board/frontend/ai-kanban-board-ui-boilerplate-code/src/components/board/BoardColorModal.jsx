import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { cn } from "../../lib/utils";

const COLORS = [
  "#2f8159", "#2c9c8f", "#6f9b54", "#d4a23c", "#c26a45", "#5f7da6",
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#0ea5e9",
];

const BoardColorModal = ({ open, onClose, currentColor, onSave }) => {
  const [selected, setSelected] = useState(currentColor);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({ color: selected });
      toast.success("Board color updated");
      onClose();
    } catch {
      toast.error("Failed to update color");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Board color" description="Choose an accent color for this board." size="sm">
      <div className="flex flex-wrap gap-3 py-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={cn(
              "h-9 w-9 rounded-full transition-transform",
              selected === c ? "ring-2 ring-ink/70 ring-offset-2 ring-offset-surface scale-110" : "hover:scale-110"
            )}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} loading={loading}>Save</Button>
      </div>
    </Modal>
  );
};

export default BoardColorModal;
