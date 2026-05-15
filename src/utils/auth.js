export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export function getUserRole() {
  return String(getCurrentUser()?.role || "").trim().toLowerCase();
}

export function isClient() {
  return getUserRole() === "client";
}

export function isTransporteur() {
  return getUserRole() === "transporteur";
}

export function isAdmin() {
  return getUserRole() === "admin";
}

export function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "/auth/login";
}
