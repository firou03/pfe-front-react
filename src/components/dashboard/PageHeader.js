import React from "react";

export default function PageHeader({ sectionLabel, title, subtitle, actions }) {
  return (
    <div className="dash-page-header">
      {sectionLabel ? <p className="dash-panel-title">{sectionLabel}</p> : null}
      <div className="dash-page-header-row">
        <div>
          {title ? <h2 className="dash-page-title">{title}</h2> : null}
          {subtitle ? <p className="dash-page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="dash-page-actions">{actions}</div> : null}
      </div>
    </div>
  );
}
