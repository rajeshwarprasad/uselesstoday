import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { BoardsProvider } from "../../context/BoardsContext";
import { useCompany } from "../../context/CompanyContext";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import Sidebar from "./Sidebar";
import CreateBoardModal from "../board/CreateBoardModal";
import CommandMenu from "../CommandMenu";

const LayoutContext = createContext(null);
export const useLayout = () => useContext(LayoutContext);

const LayoutInner = () => {
  const { currentCompany, loading } = useCompany();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const openCreateBoard = useCallback(() => setCreateOpen(true), []);
  const openCommand = useCallback(() => setCommandOpen(true), []);
  const toggleSidebar = useCallback(
    () =>
      setCollapsed((c) => {
        const next = !c;
        localStorage.setItem("sidebar-collapsed", String(next));
        return next;
      }),
    []
  );

  // Redirect to create-company if logged-in user has no companies
  useEffect(() => {
    if (!loading && user && !currentCompany) {
      navigate("/create-company", { replace: true });
    }
  }, [loading, user, currentCompany, navigate]);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <LayoutContext.Provider value={{ openCreateBoard, openCommand }}>
      <div className="h-screen overflow-hidden" data-print="layout">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleSidebar}
          onCreateBoard={openCreateBoard}
          onCommand={openCommand}
        />
        <main
          className={cn(
            "flex h-screen min-w-0 flex-col overflow-hidden transition-[padding] duration-300 ease-[var(--ease-spring)]",
            collapsed ? "md:pl-[92px]" : "md:pl-[280px]"
          )}
        >
          <Outlet />
        </main>
      </div>

      <CreateBoardModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CommandMenu
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onCreateBoard={() => {
          setCommandOpen(false);
          setCreateOpen(true);
        }}
      />
    </LayoutContext.Provider>
  );
};

const AppLayout = () => (
  <BoardsProvider>
    <LayoutInner />
  </BoardsProvider>
);

export default AppLayout;
