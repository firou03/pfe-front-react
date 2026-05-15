import React from "react";
import { useTheme } from "context/ThemeContext";
import { DashIcon, ICONS } from "./icons";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="dash-theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      <DashIcon d={isDark ? ICONS.sun : ICONS.moon} size={16} />
      {isDark ? "Mode clair" : "Mode sombre"}
    </button>
  );
}
