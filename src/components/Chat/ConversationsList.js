import React, { useState, useEffect } from "react";
import { getConversations, createConversation, getConversationByRequest } from "service/restApiChat";
import { chatLocalStorage } from "service/chatLocalStorage";

export default function ConversationsList({ currentUser, onSelectConversation, selectedConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord avec l'API
      try {
        const res = await getConversations();
        setConversations(res.data || []);
        console.log("Conversations chargées depuis l'API");
      } catch (apiError) {
        console.warn("API non disponible, utilisation du localStorage:", apiError.message);
        
        // Fallback vers localStorage
        const res = await chatLocalStorage.getConversations();
        setConversations(res.data || []);
        console.log("Conversations chargées depuis localStorage");
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (participantId, requestId) => {
    try {
      const res = await createConversation(participantId, requestId);
      setConversations(prev => [res.data, ...prev]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleGetConversationByRequest = async (requestId) => {
    try {
      const res = await getConversationByRequest(requestId);
      if (res.data) {
        setConversations(prev => {
          const exists = prev.find(c => c._id === res.data._id);
          if (!exists) {
            return [res.data, ...prev];
          }
          return prev;
        });
        onSelectConversation(res.data);
      } else {
        // Create new conversation if it doesn't exist
        console.log("Conversation not found, needs to be created");
      }
    } catch (error) {
      console.error("Error getting conversation by request:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString("fr-FR", { 
      day: "numeric", 
      month: "short" 
    });
  };

  const getOtherUser = (conversation) => {
    if (!conversation.participants) return null;
    return conversation.participants.find(p => p._id !== currentUser._id);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    if (!otherUser) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      otherUser.name?.toLowerCase().includes(searchLower) ||
      otherUser.email?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Messages</h3>
        </div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div style={{ color: "#64748b", fontSize: "14px" }}>
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>Messages</h3>
      </div>

      {/* Search */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Rechercher une conversation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* Conversations List */}
      <div style={listContainerStyle}>
        {filteredConversations.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>
              <svg
                viewBox="0 0 24 24"
                style={{ width: 48, height: 48, fill: "none", stroke: "#cbd5e1", strokeWidth: 1.5 }}
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div style={emptyTextStyle}>
              {searchTerm ? "Aucune conversation trouvée" : "Aucune conversation"}
            </div>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const isSelected = conversation._id === selectedConversationId;
            
            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation)}
                style={{
                  ...conversationItemStyle,
                  backgroundColor: isSelected ? "#eff6ff" : "transparent",
                  borderLeft: isSelected ? "3px solid #3b82f6" : "3px solid transparent",
                }}
              >
                <div style={avatarStyle}>
                  {otherUser?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                
                <div style={contentStyle}>
                  <div style={headerRowStyle}>
                    <div style={nameStyle}>
                      {otherUser?.name || "Utilisateur"}
                    </div>
                    <div style={timeStyle}>
                      {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                    </div>
                  </div>
                  
                  <div style={messageRowStyle}>
                    <div style={lastMessageStyle}>
                      {conversation.lastMessage?.content || "Nouvelle conversation"}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div style={unreadBadgeStyle}>
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* Styles */
const containerStyle = {
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
};

const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#0f172a",
  margin: 0,
};

const searchContainerStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #e2e8f0",
};

const searchInputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "#f8fafc",
};

const listContainerStyle = {
  flex: 1,
  overflowY: "auto",
  backgroundColor: "#ffffff",
};

const emptyStateStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
  textAlign: "center",
};

const emptyIconStyle = {
  marginBottom: "16px",
};

const emptyTextStyle = {
  color: "#64748b",
  fontSize: "14px",
};

const conversationItemStyle = {
  display: "flex",
  gap: "12px",
  padding: "16px 20px",
  cursor: "pointer",
  transition: "background-color 0.2s",
  borderBottom: "1px solid #f1f5f9",
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
  flexShrink: 0,
};

const contentStyle = {
  flex: 1,
  minWidth: 0,
};

const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "4px",
};

const nameStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a",
};

const timeStyle = {
  fontSize: "12px",
  color: "#64748b",
};

const messageRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const lastMessageStyle = {
  fontSize: "13px",
  color: "#64748b",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1,
};

const unreadBadgeStyle = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "600",
  padding: "2px 6px",
  borderRadius: "10px",
  minWidth: "18px",
  textAlign: "center",
};
