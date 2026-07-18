import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { Input } from "./Input";

const DeleteColumnConfirm = ({ open, onClose, onConfirm, columnTitle }) => {
  const [value, setValue] = useState("");
  const submitted = useRef(false);

  useEffect(() => {
    if (open) {
      setValue("");
      submitted.current = false;
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value !== "DELETE" || submitted.current) return;
    submitted.current = true;
    onConfirm();
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete column?" size="sm">
      <p className="text-sm text-muted">
        This will permanently delete <span className="font-semibold text-ink">"{columnTitle}"</span> and all its tasks. This can't be undone.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          id="delete-confirm"
          label='Type DELETE to confirm'
          placeholder="DELETE"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="danger" disabled={value !== "DELETE"}>
            Delete column
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DeleteColumnConfirm;
