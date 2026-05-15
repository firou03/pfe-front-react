import React from "react";
import { DashIcon } from "./icons";

export default function StatCard({ label, value, icon, iconColor, iconBg, trend, loading }) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-icon" style={{ background: iconBg }}>
        <DashIcon d={icon} size={20} color={iconColor} />
      </div>
      <div className="dash-stat-value">{loading ? "—" : value}</div>
      <div className="dash-stat-label">{label}</div>
      {trend ? (
        <div className={`dash-stat-trend ${trend.direction}`}>
          {trend.direction === "up" ? "↑ " : trend.direction === "down" ? "↓ " : ""}
          {trend.label}
        </div>
      ) : null}
    </div>
  );
}
