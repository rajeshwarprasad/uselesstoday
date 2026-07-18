import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { boardApi } from "../lib/api";
import { useCompany } from "./CompanyContext";

const BoardsContext = createContext(null);

export const BoardsProvider = ({ children }) => {
  const { currentCompanyId } = useCompany();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!currentCompanyId) {
      setBoards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setBoards([]);
    try {
      setBoards(await boardApi.list(currentCompanyId));
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (data) => {
    const board = await boardApi.create({ ...data, company_id: currentCompanyId });
    setBoards((prev) => [board, ...prev]);
    return board;
  }, [currentCompanyId]);

  const remove = useCallback(async (id) => {
    await boardApi.remove(id);
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <BoardsContext.Provider value={{ boards, loading, refresh, create, remove }}>
      {children}
    </BoardsContext.Provider>
  );
};

export const useBoards = () => {
  const ctx = useContext(BoardsContext);
  if (!ctx) throw new Error("useBoards must be used within BoardsProvider");
  return ctx;
};
