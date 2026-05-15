import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";

export default function DashboardLayout({
  portalLabel,
  navItems,
  user,
  roleLabel,
  primaryAction,
  onLogout,
  children,
}) {
  return (
    <div className="dash-shell">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <DashboardSidebar
        portalLabel={portalLabel}
        navItems={navItems}
        user={user}
        roleLabel={roleLabel}
      />

      <div className="dash-main">
        <DashboardTopbar
          userName={user?.name}
          primaryAction={primaryAction}
          onLogout={onLogout}
        />
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
