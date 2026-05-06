// Simple Notification System - No external dependencies needed
let notificationContainer = null;

const createNotificationContainer = () => {
  if (notificationContainer) return notificationContainer;

  const container = document.createElement("div");
  container.id = "notification-container";
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: 'Inter', sans-serif;
  `;
  document.body.appendChild(container);
  notificationContainer = container;
  return container;
};

const showNotification = (message, type = "info", duration = 3000) => {
  const container = createNotificationContainer();

  const notification = document.createElement("div");
  notification.style.cssText = `
    padding: 16px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 300px;
  `;

  const colors = {
    success: { bg: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", text: "#22c55e", icon: "✅" },
    error: { bg: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", text: "#ef4444", icon: "❌" },
    warning: { bg: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", text: "#f59e0b", icon: "⚠️" },
    info: { bg: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", text: "#3b82f6", icon: "ℹ️" },
  };

  const style = colors[type] || colors.info;
  notification.style.background = style.bg;
  notification.style.border = style.border;
  notification.style.color = style.text;

  notification.innerHTML = `
    <span style="font-size: 18px;">${style.icon}</span>
    <span>${message}</span>
  `;

  const style2 = document.createElement("style");
  if (!document.getElementById("notification-styles")) {
    style2.id = "notification-styles";
    style2.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style2);
  }

  container.appendChild(notification);

  if (duration > 0) {
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  return notification;
};

// Export for use
export default showNotification;

// Also provide named exports for specific types
export const notify = {
  success: (msg, duration = 3000) => showNotification(msg, "success", duration),
  error: (msg, duration = 3000) => showNotification(msg, "error", duration),
  warning: (msg, duration = 3000) => showNotification(msg, "warning", duration),
  info: (msg, duration = 3000) => showNotification(msg, "info", duration),
};
