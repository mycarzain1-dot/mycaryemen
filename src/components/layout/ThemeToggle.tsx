import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "mycar_theme";

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as "light" | "dark" | null;
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      className="p-2 rounded-full hover:bg-[var(--color-surface)] transition-colors"
    >
      {theme === "dark"
        ? <Sun className="w-5 h-5 text-[var(--color-gold)]" />
        : <Moon className="w-5 h-5 text-[var(--color-gold)]" />}
    </button>
  );
}
