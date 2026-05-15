import React from "react";
import { getCurrentUser, logout } from "utils/auth";
import { ADMIN_NAV } from "config/navigation";
import DashboardLayout from "./DashboardLayout";

export default function AdminPageLayout({ children }) {
  const user = getCurrentUser();

  return (
    <DashboardLayout
      portalLabel="Administration"
      navItems={ADMIN_NAV}
      user={user}
      roleLabel="Administrateur"
      onLogout={logout}
    >
      {children}
    </DashboardLayout>
  );
}
