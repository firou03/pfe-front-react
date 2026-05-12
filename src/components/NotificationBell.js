import React, { useState, useEffect, useRef } from "react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "service/restApiTransport";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Function to get time ago text
  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const date = new Date(createdAt);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    return `il y a ${diffDays}j`;
  };

  // Function to get dot color based on notification type
  const getDotColor = (type) => {
    const colors = {
      request_accepted: "#97c459",
      new_request: "#60a5fa",
      request_cancelled: "#f09595",
      new_review: "#EF9F27",
      new_message: "#8b5cf6",
      delivery_confirmed: "#22c55e",
    };
    return colors[type] || "#475569";
  };

  // Fetch unread count (on mount and every 30 seconds)
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadCount();
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle bell click
  const handleBellClick = async () => {
    if (!isOpen) {
      // Opening dropdown - fetch notifications
      setLoading(true);
      try {
        const response = await getNotifications();
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  // Handle mark notification as read
  const handleMarkRead = async (id, isRead) => {
    if (!isRead) {
      try {
        await markNotificationRead(id);
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      // Refetch unread count
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        style={{
          background: "rgba(59,130,246,0.2)",
          border: "1.5px solid #60a5fa",
          cursor: "pointer",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 9999,
          transition: "all 0.2s ease",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(96,165,250,0.3)",
        }}
        title="Notifications"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(59,130,246,0.3)";
          e.currentTarget.style.borderColor = "#3b82f6";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(96,165,250,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(59,130,246,0.2)";
          e.currentTarget.style.borderColor = "#60a5fa";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(96,165,250,0.3)";
        }}
      >
        {/* Bell SVG */}
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#60a5fa"
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-6px",
              right: "-8px",
              background: "#ef4444",
              color: "white",
              fontSize: "10px",
              fontWeight: "700",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(239,68,68,0.5)",
              border: "2px solid rgba(16,18,27,1)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "44px",
            right: "0px",
            width: "340px",
            background: "#161b27",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            zIndex: 10000,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "0.5px solid rgba(255,255,255,0.07)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: "#f1f5f9",
                fontWeight: "600",
              }}
            >
              Notifications
            </span>
            <button
              onClick={handleMarkAllRead}
              style={{
                background: "none",
                border: "none",
                fontSize: "12px",
                color: "#3b82f6",
                cursor: "pointer",
                padding: "0",
                fontWeight: "500",
              }}
            >
              Tout marquer lu
            </button>
          </div>

          {/* Notifications List */}
          <div
            style={{
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: "20px 16px",
                  textAlign: "center",
                  color: "#334155",
                  fontSize: "14px",
                }}
              >
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: "20px 16px",
                  textAlign: "center",
                  color: "#334155",
                  fontSize: "14px",
                }}
              >
                Aucune notification
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={notif._id}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      idx !== notifications.length - 1
                        ? "0.5px solid rgba(255,255,255,0.04)"
                        : "none",
                    background: notif.isRead
                      ? "transparent"
                      : "rgba(59,130,246,0.06)",
                    borderLeft: notif.isRead ? "none" : "2px solid #3b82f6",
                    paddingLeft: notif.isRead ? "16px" : "14px",
                    display: "flex",
                    gap: "10px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!notif.isRead) {
                      e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                    } else {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notif.isRead
                      ? "transparent"
                      : "rgba(59,130,246,0.06)";
                  }}
                  onClick={() => handleMarkRead(notif._id, notif.isRead)}
                >
                  {/* Left dot */}
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: getDotColor(notif.type),
                      flexShrink: 0,
                      marginTop: "4px",
                    }}
                  />

                  {/* Content */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: notif.isRead ? "#475569" : "#e2e8f0",
                        fontWeight: notif.isRead ? "400" : "500",
                        marginBottom: "2px",
                      }}
                    >
                      {notif.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#475569",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {notif.message}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#334155",
                        marginTop: "4px",
                      }}
                    >
                      {getTimeAgo(notif.createdAt)}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notif._id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "0.5px solid rgba(255,255,255,0.07)",
              textAlign: "center",
            }}
          >
            <a
              href="/notifications"
              style={{
                fontSize: "12px",
                color: "#3b82f6",
                textDecoration: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Voir toutes les notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
