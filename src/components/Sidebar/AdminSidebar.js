import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "context/ThemeContext";

const Icon = ({ d, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard: "M3 12a9 9 0 110 18 9 9 0 010-18z",
  users: "M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 13H4.458c-1.119 0-2.02.905-1.98 2.024.087 2.755 1.899 5.228 4.514 5.858m0-13.986h7.541c1.12 0 2.021.905 1.981 2.024-.087 2.755-1.899 5.228-4.513 5.858m6.5-13.986c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm-3 8.99c.93 0 1.78.384 2.38 1",
  inbox: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  moon:  "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  sun:   "M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M17.66 6.34l1.42-1.42",
};

export default function AdminSidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: ICONS.dashboard },
    { path: "/admin/users", label: "Utilisateurs", icon: ICONS.users },
    { path: "/admin/requests", label: "Expéditions", icon: ICONS.inbox },
    { path: "/admin/reviews", label: "Avis Clients", icon: ICONS.star },
    { path: "/admin/stats", label: "Statistiques", icon: ICONS.chart },
  ];

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col z-50 transition-colors duration-300">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-dhl-red flex items-center justify-center rounded-lg shadow-lg shadow-dhl-red/20">
          <span className="text-dhl-yellow font-black italic text-xs">DHL</span>
        </div>
        <div>
          <div className="text-lg font-bold dark:text-white leading-tight">Admin</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Global Control</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(item.path)
                ? 'bg-dhl-yellow text-black shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-dhl-red'
            }`}
          >
            <Icon d={item.icon} size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-dhl-yellow hover:text-black transition-all"
        >
          <Icon d={theme === 'light' ? ICONS.moon : ICONS.sun} size={18} />
          {theme === 'light' ? "Mode Sombre" : "Mode Clair"}
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-red-50 dark:bg-red-900/10 text-dhl-red border border-red-100 dark:border-red-900/20 hover:bg-dhl-red hover:text-white transition-all shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Déconnexion
        </button>

        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-dhl-red transition-all"
        >
          ← Retour au site
        </Link>
      </div>
    </aside>
  );
}
