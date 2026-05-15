import React from "react";
import { Link } from "react-router-dom";
import { DashIcon, ICONS } from "./icons";

export default function QuickActionsPanel({ actions }) {
  return (
    <div>
      <p className="dash-panel-title">Raccourcis</p>
      <h3 className="dash-panel-heading" style={{ marginBottom: 8 }}>
        Actions rapides
      </h3>
      {actions.map((action) => (
        <Link key={action.to} to={action.to} className="dash-action-item">
          <div className="dash-action-icon" style={{ background: action.iconBg }}>
            <DashIcon d={action.icon} size={18} color={action.iconColor} />
          </div>
          <div className="dash-action-text">
            <div className="dash-action-title">{action.title}</div>
            {action.subtitle ? <div className="dash-action-sub">{action.subtitle}</div> : null}
          </div>
          <DashIcon d={ICONS.chevron} size={16} color="var(--dash-text-muted)" />
        </Link>
      ))}
    </div>
  );
}
