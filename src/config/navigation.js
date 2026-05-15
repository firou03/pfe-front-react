import { ICONS } from "components/dashboard/icons";

export const CLIENT_NAV = [
  { label: "Dashboard", to: "/dashboard/client", icon: ICONS.dash },
  { label: "Nouvelle demande", to: "/client", icon: ICONS.plus },
  { label: "Mes demandes", to: "/client-requests", icon: ICONS.list },
  { label: "Tracking", to: "/tracking", icon: ICONS.map },
  { label: "Messagerie", to: "/chat", icon: ICONS.chat },
  { label: "Profil", to: "/profile/client", icon: ICONS.user },
];

export const TRANSPORTEUR_NAV = [
  { label: "Dashboard", to: "/dashboard/transporteur", icon: ICONS.dash },
  { label: "Demandes", to: "/requests", icon: ICONS.list },
  { label: "Mes trajets", to: "/mes-requests", icon: ICONS.check },
  { label: "Historique", to: "/historique", icon: ICONS.clock },
  { label: "Tracking", to: "/tracking", icon: ICONS.map },
  { label: "Messagerie", to: "/chat", icon: ICONS.chat },
  { label: "Profil", to: "/profile/transporteur", icon: ICONS.user },
];

export const ADMIN_NAV = [
  { label: "Dashboard", to: "/admin/dashboard", icon: ICONS.dash },
  { label: "Utilisateurs", to: "/admin/users", icon: ICONS.user },
  { label: "Expéditions", to: "/admin/requests", icon: ICONS.package },
  { label: "Avis", to: "/admin/reviews", icon: ICONS.star },
  { label: "Statistiques", to: "/admin/stats", icon: ICONS.chart },
];

export function getNavConfig(user) {
  const role = String(user?.role || "").trim().toLowerCase();
  if (role === "transporteur") {
    return {
      navItems: TRANSPORTEUR_NAV,
      portalLabel: "Espace Transporteur",
      roleLabel: "Transporteur",
    };
  }
  if (role === "admin") {
    return {
      navItems: ADMIN_NAV,
      portalLabel: "Administration",
      roleLabel: "Administrateur",
    };
  }
  return {
    navItems: CLIENT_NAV,
    portalLabel: "Espace Client",
    roleLabel: "Client",
  };
}
