import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DashIcon, ICONS } from "./icons";
import { getInitials, getUserProfileImageUrl } from "utils/dashboardHelpers";

export default function DashboardSidebar({ portalLabel, navItems, user, roleLabel }) {
  const location = useLocation();
  const [imgFailed, setImgFailed] = useState(false);
  const photoUrl = getUserProfileImageUrl(user);
  const showPhoto = photoUrl && !imgFailed;

  return (
    <aside className="dash-sidebar">
      <div className="dash-logo">
        <div className="dash-logo-icon">
          <DashIcon d={ICONS.truck} size={18} color="#fff" />
        </div>
        <div>
          <div className="dash-logo-title">TransportTN</div>
          <div className="dash-logo-sub">{portalLabel}</div>
        </div>
      </div>

      <nav className="dash-nav">
        {navItems.map((item) => {
          const active =
            item.active ??
            (location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to)));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`dash-nav-link${active ? " active" : ""}`}
              title={item.label}
            >
              <DashIcon
                d={item.icon}
                size={18}
                color={active ? "var(--dash-sidebar-active-text)" : "var(--dash-sidebar-text)"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="dash-user-card">
        <div className="dash-user-avatar">
          {showPhoto ? (
            <img src={photoUrl} alt="" onError={() => setImgFailed(true)} />
          ) : (
            getInitials(user?.name || user?.email)
          )}
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="dash-user-name">{user?.name || "Utilisateur"}</div>
          <div className="dash-user-role">{roleLabel}</div>
        </div>
      </div>
    </aside>
  );
}
