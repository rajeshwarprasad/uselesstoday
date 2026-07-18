import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Loader2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { boardApi, taskApi } from "../../lib/api";
import { useCompany } from "../../context/CompanyContext";

const MoveToBoardModal = ({ open, onClose, task, currentBoardId, companyId, onMoved }) => {
  const { currentCompany } = useCompany();
  const effectiveCompanyId = companyId || currentCompany?.id;
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [targetColumns, setTargetColumns] = useState([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !effectiveCompanyId) return;
    setLoading(true);
    setSelectedBoard(null);
    setTargetColumns([]);
    setSelectedColumn("");
    boardApi
      .list(effectiveCompanyId)
      .then((list) => {
        setBoards(list.filter((b) => b.id !== currentBoardId));
      })
      .catch(() => toast.error("Failed to load boards"))
      .finally(() => setLoading(false));
  }, [open, currentBoardId, effectiveCompanyId]);

  useEffect(() => {
    if (!selectedBoard) { setTargetColumns([]); return; }
    setLoadingColumns(true);
    boardApi
      .get(selectedBoard.id)
      .then((data) => setTargetColumns(data.columns || []))
      .catch(() => toast.error("Failed to load columns"))
      .finally(() => setLoadingColumns(false));
  }, [selectedBoard]);

  const handleMove = async () => {
    if (!selectedBoard || !selectedColumn) return toast.error("Select a board and column");
    setSaving(true);
    try {
      await taskApi.moveToBoard(currentBoardId, task.id, {
        target_board_id: selectedBoard.id,
        target_column_id: selectedColumn,
        position: Date.now(),
      });
      toast.success(`Moved to "${selectedBoard.title}"`);
      onMoved?.();
      onClose();
    } catch (e) {
      toast.error(e.message || "Failed to move task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Move to board" description="Transfer this task to another board" size="sm">
      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted text-sm">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading boards…
        </div>
      ) : boards.length === 0 ? (
        <p className="py-4 text-sm text-muted text-center">No other boards available.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Target board</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBoard(b); setSelectedColumn(""); }}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedBoard?.id === b.id
                      ? "border-brand-500 bg-brand-50 text-ink"
                      : "border-line bg-surface hover:border-brand-300"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color || "#6366f1" }} />
                  <span className="font-medium truncate">{b.title}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedBoard && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Target column</label>
              {loadingColumns ? (
                <p className="text-xs text-muted py-2">Loading columns…</p>
              ) : (
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="input-base rounded-xl py-2 text-sm"
                >
                  <option value="">Select column</option>
                  {targetColumns.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleMove} disabled={!selectedBoard || !selectedColumn || saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Move task
        </Button>
      </div>
    </Modal>
  );
};

export default MoveToBoardModal;
