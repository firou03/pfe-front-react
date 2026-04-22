import React, { useState, useMemo } from "react";
import ConversationsList from "./ConversationsList";
import ChatBox from "./ChatBox";

export default function ChatComponent({ currentUser, requestId = null, initialParticipant = null }) {
  const [selectedConversation, setSelectedConversation] = useState(null);

  const currentUserMemo = useMemo(() => {
    if (currentUser) return currentUser;
    
    // Fallback to localStorage if not provided
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, [currentUser]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  // If there's an initial participant (e.g., from a request), we could auto-select conversation
  React.useEffect(() => {
    if (initialParticipant && !selectedConversation) {
      // This would need to be implemented to auto-create conversation
      console.log("Initial participant provided:", initialParticipant);
    }
  }, [initialParticipant, selectedConversation]);

  return (
    <div style={chatLayoutStyle}>
      <div style={conversationsPanelStyle}>
        <ConversationsList
          currentUser={currentUserMemo}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?._id}
        />
      </div>
      
      <div style={chatPanelStyle}>
        {selectedConversation ? (
          <ChatBox
            conversationId={selectedConversation._id}
            currentUser={currentUserMemo}
            otherUser={selectedConversation.participants?.find(p => p._id !== currentUserMemo._id)}
          />
        ) : (
          <div style={emptyChatStyle}>
            <div style={emptyChatIconStyle}>
              <svg
                viewBox="0 0 24 24"
                style={{ width: 64, height: 64, fill: "none", stroke: "#cbd5e1", strokeWidth: 1.5 }}
              >
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div style={emptyChatTitleStyle}>
              Sélectionnez une conversation
            </div>
            <div style={emptyChatTextStyle}>
              Choisissez une conversation dans la liste pour commencer à discuter
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Styles */
const chatLayoutStyle = {
  display: "flex",
  gap: "16px",
  height: "500px",
  maxWidth: "900px",
  margin: "0 auto",
};

const conversationsPanelStyle = {
  width: "320px",
  flexShrink: 0,
};

const chatPanelStyle = {
  flex: 1,
  minWidth: 0,
};

const emptyChatStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  textAlign: "center",
  padding: "40px 20px",
};

const emptyChatIconStyle = {
  marginBottom: "16px",
};

const emptyChatTitleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#0f172a",
  marginBottom: "8px",
};

const emptyChatTextStyle = {
  fontSize: "14px",
  color: "#64748b",
  lineHeight: "1.5",
};
