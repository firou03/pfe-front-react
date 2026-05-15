import React from "react";

export default function WeeklyActivityChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 280;
  const H = 100;
  const barW = 28;
  const gap = (W - data.length * barW) / (data.length + 1);

  return (
    <div className="dash-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: "100%", maxWidth: W }}>
        <defs>
          <linearGradient id="dashBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dash-chart-bar-fill-start)" />
            <stop offset="100%" stopColor="var(--dash-chart-bar-fill-end)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const barH = Math.max((d.value / max) * H, 4);
          const x = gap + i * (barW + gap);
          const y = H - barH;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={5}
                fill={d.value > 0 ? "url(#dashBarGrad)" : "var(--dash-chart-bar-empty)"}
              />
              <text x={x + barW / 2} y={H + 16} textAnchor="middle" className="dash-chart-label" fontSize={10}>
                {d.label}
              </text>
              {d.value > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--dash-text-secondary)"
                  fontWeight="600"
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
