import React from "react";
import { getCurrentUser, logout } from "utils/auth";
import { getNavConfig } from "config/navigation";
import DashboardLayout from "./DashboardLayout";
import PageHeader from "./PageHeader";

/**
 * Layout applicatif client / transporteur — sidebar, topbar, thème.
 */
export default function AppPageLayout({
  children,
  title,
  subtitle,
  sectionLabel,
  primaryAction,
  headerActions,
  user: userProp,
}) {
  const user = userProp || getCurrentUser();
  const { navItems, portalLabel, roleLabel } = getNavConfig(user);

  return (
    <DashboardLayout
      portalLabel={portalLabel}
      navItems={navItems}
      user={user}
      roleLabel={roleLabel}
      primaryAction={primaryAction}
      onLogout={logout}
    >
      {(title || subtitle || sectionLabel || headerActions) && (
        <PageHeader
          sectionLabel={sectionLabel}
          title={title}
          subtitle={subtitle}
          actions={headerActions}
        />
      )}
      {children}
    </DashboardLayout>
  );
}
