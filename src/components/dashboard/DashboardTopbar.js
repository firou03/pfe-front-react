import React from "react";
import { Link } from "react-router-dom";
import NotificationBell from "components/NotificationBell";
import ThemeToggle from "./ThemeToggle";
import { DashIcon, ICONS } from "./icons";

export default function DashboardTopbar({
  userName,
  primaryAction,
  onLogout,
}) {
  const firstName = userName?.split(" ")[0] || "Utilisateur";
  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="dash-topbar">
      <div>
        <div className="dash-topbar-date">{dateLabel}</div>
        <h1 className="dash-topbar-title">Bonjour, {firstName}</h1>
      </div>

      <div className="dash-topbar-actions">
        {primaryAction ? (
          <Link to={primaryAction.to} className="dash-btn-primary">
            <DashIcon d={primaryAction.icon || ICONS.plus} size={15} color="#fff" />
            {primaryAction.label}
          </Link>
        ) : null}

        <ThemeToggle />

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <NotificationBell />
        </div>

        <button type="button" className="dash-btn-ghost dash-btn-logout" onClick={onLogout}>
          <DashIcon d={ICONS.logout} size={15} color="currentColor" />
          Déconnexion
        </button>
      </div>
    </header>
  );
}
