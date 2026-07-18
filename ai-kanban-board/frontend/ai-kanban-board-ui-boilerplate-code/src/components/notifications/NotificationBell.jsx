import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Clock, AlertTriangle, Edit3 } from "lucide-react";
import { notificationApi } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import { cn } from "../../lib/utils";

const typeIcon = {
  due_soon: Clock,
  stale_task: AlertTriangle,
  task_edited: Edit3,
};

const typeColor = {
  due_soon: "text-priority-medium",
  stale_task: "text-priority-urgent",
  task_edited: "text-brand-500",
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    notificationApi.list().then(setNotifications).catch(() => {});
    notificationApi.check().catch(() => {});
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const onNew = (notif) => setNotifications((prev) => [notif, ...prev]);
    socket.on("notification:new", onNew);
    return () => socket.off("notification:new", onNew);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Refresh relative timestamps every 60s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markOneRead = async (id) => {
    await notificationApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  void tick; // re-render on tick

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-px hover:text-ink hover:shadow-[var(--shadow-soft)]"
        title="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-priority-urgent px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="card animate-in absolute right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-display text-sm font-semibold">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted">No notifications yet</p>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcon[n.type] || Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => markOneRead(n.id)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2",
                      !n.is_read && "bg-brand-50/40"
                    )}
                  >
                    <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", typeColor[n.type] || "text-muted")} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-xs font-medium", n.is_read ? "text-muted" : "text-ink")}>{n.title}</p>
                      {n.message && <p className="mt-0.5 truncate text-[11px] text-faint">{n.message}</p>}
                      <p className="mt-0.5 text-[10px] text-faint">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
