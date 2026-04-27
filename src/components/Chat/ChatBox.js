import React, { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, markMessagesAsRead } from "service/restApiChat";

export default function ChatBox({ conversationId, currentUser, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const loadMessages = React.useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Utiliser l'API
      try {
        const res = await getMessages(conversationId);
        // Only update state if messages actually changed or it's the first load
        setMessages(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
            return res.data || [];
          }
          return prev;
        });
        if (!silent) console.log("Messages chargés depuis l'API");
      } catch (apiError) {
        if (!silent) console.error("Erreur lors du chargement des messages via API:", apiError.message);
      }
    } catch (error) {
      if (!silent) console.error("Error loading messages:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval;
    if (conversationId) {
      loadMessages();
      // Mark messages as read when opening conversation
      markMessagesAsRead(conversationId).catch(console.error);

      // Polling pour le temps réel (toutes les 3 secondes)
      interval = setInterval(() => {
        loadMessages(true);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [conversationId, loadMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageData = {
        content: newMessage.trim(),
        senderId: currentUser._id,
      };

      // Utiliser l'API
      try {
        const res = await sendMessage(conversationId, messageData);
        setMessages(prev => [...prev, res.data]);
        console.log("Message envoyé via l'API");
      } catch (apiError) {
        console.error("Erreur lors de l'envoi du message via API:", apiError.message);
        alert("Erreur lors de l'envoi du message via le serveur.");
      }
      
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", { 
        day: "numeric", 
        month: "short" 
      });
    }
  };

  const getAvatarUrl = (user) => {
    if (user?.user_image) {
      return `http://localhost:5000/images/${user.user_image}`;
    }
    return null;
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (loading) {
    return (
      <div style={chatContainerStyle}>
        <div style={headerStyle}>
          <div style={userInfoStyle}>
            <div style={avatarStyle}>
              {otherUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={userNameStyle}>
                {otherUser?.name || "Utilisateur"}
              </div>
              <div style={userStatusStyle}>En ligne</div>
            </div>
          </div>
        </div>
        <div style={messagesContainerStyle}>
          <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
            Chargement des messages...
          </div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div style={chatContainerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={userInfoStyle}>
          <div style={avatarStyle}>
            {getAvatarUrl(otherUser) ? (
              <img 
                src={getAvatarUrl(otherUser)} 
                alt={otherUser?.name} 
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
              />
            ) : (
              otherUser?.name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>
          <div>
            <div style={userNameStyle}>
              {otherUser?.name || "Utilisateur"}
            </div>
            <div style={userStatusStyle}>En ligne</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={messagesContainerStyle}>
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div style={dateSeparatorStyle}>
              <span style={dateTextStyle}>
                {formatDate(dateMessages[0].createdAt)}
              </span>
            </div>
            
            {/* Messages for this date */}
            {dateMessages.map((message) => {
              const isOwn = message.senderId?._id === currentUser._id || message.senderId === currentUser._id;
              const senderInfo = typeof message.senderId === 'object' ? message.senderId : { _id: message.senderId };
              const senderImage = getAvatarUrl(senderInfo);
              
              return (
                <div
                  key={message._id}
                  style={{
                    ...messageWrapperStyle,
                    justifyContent: isOwn ? "flex-end" : "flex-start",
                    alignItems: "flex-end",
                    gap: "8px",
                  }}
                >
                  {!isOwn && (
                    <div style={{...avatarStyle, width: "32px", height: "32px", fontSize: "14px"}}>
                      {senderImage ? (
                        <img 
                          src={senderImage} 
                          alt={senderInfo?.name} 
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
                        />
                      ) : (
                        senderInfo?.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                  )}
                  
                  <div
                    style={{
                      ...messageBubbleStyle,
                      backgroundColor: isOwn ? "#3b82f6" : "#f1f5f9",
                      color: isOwn ? "#ffffff" : "#0f172a",
                      borderBottomRightRadius: isOwn ? "4px" : "18px",
                      borderBottomLeftRadius: isOwn ? "18px" : "4px",
                    }}
                  >
                    <div style={messageContentStyle}>
                      {message.content}
                    </div>
                    <div
                      style={{
                        ...messageTimeStyle,
                        color: isOwn ? "#dbeafe" : "#64748b",
                      }}
                    >
                      {formatTime(message.createdAt)}
                    </div>
                  </div>

                  {isOwn && (
                    <div style={{...avatarStyle, width: "32px", height: "32px", fontSize: "14px"}}>
                      {getAvatarUrl(currentUser) ? (
                        <img 
                          src={getAvatarUrl(currentUser)} 
                          alt={currentUser?.name} 
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
                        />
                      ) : (
                        currentUser?.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} style={inputContainerStyle}>
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez votre message..."
          style={inputStyle}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          style={{
            ...sendButtonStyle,
            backgroundColor: newMessage.trim() && !sending ? "#3b82f6" : "#94a3b8",
            cursor: newMessage.trim() && !sending ? "pointer" : "not-allowed",
          }}
        >
          {sending ? (
            <div style={spinnerStyle} />
          ) : (
            <svg
              viewBox="0 0 24 24"
              style={{ width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 2 }}
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

/* Styles */
const chatContainerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "500px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const headerStyle = {
  padding: "16px 20px",
  backgroundColor: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const userInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  fontWeight: "600",
};

const userNameStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a",
  marginBottom: "2px",
};

const userStatusStyle = {
  fontSize: "12px",
  color: "#10b981",
};

const messagesContainerStyle = {
  flex: 1,
  padding: "16px 20px",
  overflowY: "auto",
  backgroundColor: "#fafbfc",
};

const dateSeparatorStyle = {
  display: "flex",
  justifyContent: "center",
  margin: "16px 0",
};

const dateTextStyle = {
  backgroundColor: "#e2e8f0",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "500",
  padding: "4px 12px",
  borderRadius: "12px",
  textTransform: "uppercase",
};

const messageWrapperStyle = {
  display: "flex",
  marginBottom: "12px",
};

const messageBubbleStyle = {
  maxWidth: "70%",
  padding: "10px 14px",
  borderRadius: "18px",
  wordWrap: "break-word",
};

const messageContentStyle = {
  fontSize: "14px",
  lineHeight: "1.4",
  marginBottom: "4px",
};

const messageTimeStyle = {
  fontSize: "11px",
  textAlign: "right",
};

const inputContainerStyle = {
  display: "flex",
  gap: "8px",
  padding: "16px 20px",
  backgroundColor: "#ffffff",
  borderTop: "1px solid #e2e8f0",
};

const inputStyle = {
  flex: 1,
  padding: "12px 16px",
  border: "1px solid #e2e8f0",
  borderRadius: "24px",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "#f8fafc",
  color: "#0f172a",
};

const sendButtonStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  transition: "background-color 0.2s",
};

const spinnerStyle = {
  width: "18px",
  height: "18px",
  border: "2px solid #ffffff",
  borderTop: "2px solid transparent",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
