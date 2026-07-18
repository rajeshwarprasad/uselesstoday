import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, GripVertical, Check, Loader2 } from "lucide-react";
import { useCompany } from "../../context/CompanyContext";
import Modal from "../ui/Modal";
import { Input } from "../ui/Input";
import Button from "../ui/Button";
import { cn } from "../../lib/utils";

const SortableCompany = ({ company, isActive, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: company.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-xl px-2 py-2 transition-colors",
        isActive
          ? "bg-brand-50 ring-1 ring-brand-200"
          : "hover:bg-surface-2",
        isDragging && "shadow-[var(--shadow-lift)]"
      )}
    >
      <button
        className="cursor-grab touch-none text-faint transition-colors hover:text-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        onClick={() => onSelect(company.id)}
        className="flex flex-1 items-center gap-2.5 text-left"
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold"
          style={{
            backgroundColor: `${company.id === isActive ? "#6366f1" : "#6366f1"}18`,
            color: "#6366f1",
          }}
        >
          {company.name?.[0]?.toUpperCase() || "C"}
        </span>
        <span className="flex-1 truncate text-sm font-medium text-ink">
          {company.name}
        </span>
        {isActive && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
      </button>
    </div>
  );
};

const CompanySwitcher = ({ open, onClose }) => {
  const {
    companies,
    currentCompanyId,
    switchCompany,
    create,
    refresh,
  } = useCompany();
  const navigate = useNavigate();

  const [ordered, setOrdered] = useState([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (open) {
      setOrdered([...companies]);
      setCreating(false);
      setName("");
      setDesc("");
    }
  }, [open, companies]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrdered((items) => {
      const oldIndex = items.findIndex((c) => c.id === active.id);
      const newIndex = items.findIndex((c) => c.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleSelect = (id) => {
    switchCompany(id);
    onClose();
    navigate("/dashboard");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await create({ name: name.trim(), description: desc.trim() || undefined });
      await refresh();
      onClose();
      navigate("/dashboard");
    } catch {
      // toast handled by CompanyContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Switch workspace"
      description="Select a company or create a new one"
      size="sm"
    >
      <div className="space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={ordered.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {ordered.map((c) => (
              <SortableCompany
                key={c.id}
                company={c}
                isActive={c.id === currentCompanyId}
                onSelect={handleSelect}
              />
            ))}
          </SortableContext>
        </DndContext>

        {ordered.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">
            No companies yet
          </p>
        )}
      </div>

      <div className="my-4 border-t" />

      {creating ? (
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            label="Company name"
            placeholder="Acme Inc."
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Description (optional)"
            placeholder="We build amazing things"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreating(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              Create
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>New company</span>
        </button>
      )}
    </Modal>
  );
};

export default CompanySwitcher;
