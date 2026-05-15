import React, { useMemo } from "react";
import AppPageLayout from "components/dashboard/AppPageLayout";
import ChatComponent from "components/Chat/ChatComponent.js";
import { getCurrentUser, isTransporteur } from "utils/auth";

export default function ChatPage() {
  const currentUser = useMemo(() => getCurrentUser(), []);

  return (
    <AppPageLayout
      sectionLabel="Communication"
      title="Messagerie"
      subtitle={
        isTransporteur()
          ? "Échangez avec vos clients"
          : "Discutez avec vos transporteurs"
      }
    >
      <div className="dash-panel dash-chat-panel">
        <ChatComponent currentUser={currentUser} />
      </div>
    </AppPageLayout>
  );
}
