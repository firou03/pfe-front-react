/** Compte les éléments créés dans une plage de dates. */
function countInRange(items, start, end, dateKey = "createdAt") {
  return items.filter((item) => {
    const raw = item?.[dateKey] || item?.date;
    if (!raw) return false;
    const d = new Date(raw);
    return d >= start && d < end;
  }).length;
}

/**
 * Tendance mensuelle : compare ce mois vs mois précédent.
 * @returns {{ label: string, direction: 'up'|'down'|'neutral' }}
 */
export function computeMonthlyTrend(items, filterFn = () => true) {
  const filtered = items.filter(filterFn);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonth = countInRange(filtered, thisMonthStart, now);
  const lastMonth = countInRange(filtered, lastMonthStart, thisMonthStart);
  const diff = thisMonth - lastMonth;

  if (diff > 0) {
    return { label: `+${diff} ce mois`, direction: "up" };
  }
  if (diff < 0) {
    return { label: `${diff} ce mois`, direction: "down" };
  }
  return { label: "Stable ce mois", direction: "neutral" };
}

/** Données pour le graphique hebdomadaire (7 derniers jours). */
export function buildWeeklyChartData(requests, dateKey = "createdAt") {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      label: d.toLocaleDateString("fr-FR", { weekday: "short" }),
      date: dateStr,
      value: requests.filter((r) => {
        const raw = r?.[dateKey] || r?.date;
        return raw && String(raw).split("T")[0] === dateStr;
      }).length,
    });
  }
  return days;
}

export function getInitials(name) {
  const parts = String(name || "U").trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] || "U").toUpperCase();
}

export function getUserProfileImageUrl(user) {
  const raw = user?.user_image ?? user?.profilePicture ?? user?.avatar;
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `http://localhost:5000/images/${value.replace(/^\//, "")}`;
}
