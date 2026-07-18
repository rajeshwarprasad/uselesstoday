import { Toaster as HotToaster } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

const Toaster = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: isDark ? "#1a1a27" : "#ffffff",
          color: isDark ? "#eeeef5" : "#16161d",
          border: `1px solid ${isDark ? "#2e2e4a" : "#e9e8f3"}`,
          borderRadius: "999px",
          padding: "0.6rem 1rem",
          boxShadow: isDark
            ? "0 8px 24px rgba(0,0,0,0.4)"
            : "0 8px 24px rgba(28,27,64,0.1)",
          fontSize: "0.875rem",
          fontWeight: 500,
        },
      }}
    />
  );
};

export default Toaster;
