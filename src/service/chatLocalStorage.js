// Solution de fallback pour le chat utilisant localStorage
// Permet de tester le fonctionnement sans backend

const STORAGE_KEYS = {
  CONVERSATIONS: 'chat_conversations',
  MESSAGES: 'chat_messages',
};

// Générer un ID unique
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Récupérer l'utilisateur courant
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// Sauvegarder dans localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to ${key}:`, error);
  }
};

// Récupérer depuis localStorage
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting from ${key}:`, error);
    return [];
  }
};

// Fonctions du chat avec localStorage
export const chatLocalStorage = {
  // GET all conversations for current user
  getConversations: () => {
    return new Promise((resolve) => {
      const currentUser = getCurrentUser();
      const conversations = getFromStorage(STORAGE_KEYS.CONVERSATIONS);
      
      const userConversations = conversations.filter(conv => 
        conv.participants.includes(currentUser._id)
      );
      
      setTimeout(() => {
        resolve({ data: userConversations });
      }, 500); // Simuler délai réseau
    });
  },

  // GET messages for a specific conversation
  getMessages: (conversationId) => {
    return new Promise((resolve) => {
      const messages = getFromStorage(STORAGE_KEYS.MESSAGES);
      const conversationMessages = messages.filter(msg => 
        msg.conversationId === conversationId
      ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setTimeout(() => {
        resolve({ data: conversationMessages });
      }, 300);
    });
  },

  // POST send a new message
  sendMessage: (conversationId, messageData) => {
    return new Promise((resolve) => {
      const messages = getFromStorage(STORAGE_KEYS.MESSAGES);
      const conversations = getFromStorage(STORAGE_KEYS.CONVERSATIONS);
      
      const newMessage = {
        _id: generateId(),
        conversationId,
        senderId: messageData.senderId,
        content: messageData.content,
        readBy: [messageData.senderId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      messages.push(newMessage);
      saveToStorage(STORAGE_KEYS.MESSAGES, messages);
      
      // Mettre à jour lastMessage de la conversation
      const convIndex = conversations.findIndex(c => c._id === conversationId);
      if (convIndex !== -1) {
        conversations[convIndex].lastMessage = {
          content: newMessage.content,
          senderId: newMessage.senderId,
          createdAt: newMessage.createdAt,
        };
        conversations[convIndex].updatedAt = newMessage.createdAt;
        saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
      }
      
      setTimeout(() => {
        resolve({ data: newMessage });
      }, 400);
    });
  },

  // POST create a new conversation
  createConversation: (participantId, requestId) => {
    return new Promise((resolve) => {
      const conversations = getFromStorage(STORAGE_KEYS.CONVERSATIONS);
      const currentUser = getCurrentUser();
      
      // Vérifier si la conversation existe déjà
      const existingConv = conversations.find(conv => 
        conv.requestId === requestId &&
        conv.participants.includes(currentUser._id) &&
        conv.participants.includes(participantId)
      );
      
      if (existingConv) {
        setTimeout(() => {
          resolve({ data: existingConv });
        }, 300);
        return;
      }
      
      const newConversation = {
        _id: generateId(),
        participants: [currentUser._id, participantId],
        requestId,
        lastMessage: null,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      conversations.push(newConversation);
      saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
      
      setTimeout(() => {
        resolve({ data: newConversation });
      }, 400);
    });
  },

  // GET conversation by request ID
  getConversationByRequest: (requestId) => {
    return new Promise((resolve) => {
      const conversations = getFromStorage(STORAGE_KEYS.CONVERSATIONS);
      const currentUser = getCurrentUser();
      
      const conversation = conversations.find(conv => 
        conv.requestId === requestId &&
        conv.participants.includes(currentUser._id)
      );
      
      setTimeout(() => {
        resolve({ data: conversation || null });
      }, 300);
    });
  },

  // PUT mark messages as read
  markMessagesAsRead: (conversationId) => {
    return new Promise((resolve) => {
      const messages = getFromStorage(STORAGE_KEYS.MESSAGES);
      const currentUser = getCurrentUser();
      
      messages.forEach(msg => {
        if (msg.conversationId === conversationId && 
            !msg.readBy.includes(currentUser._id)) {
          msg.readBy.push(currentUser._id);
        }
      });
      
      saveToStorage(STORAGE_KEYS.MESSAGES, messages);
      
      setTimeout(() => {
        resolve({ data: { success: true } });
      }, 200);
    });
  },

  // Utilitaire pour créer des données de test
  createTestData: () => {
    const currentUser = getCurrentUser();
    const conversations = getFromStorage(STORAGE_KEYS.CONVERSATIONS);
    const messages = getFromStorage(STORAGE_KEYS.MESSAGES);
    
    // Créer une conversation de test si aucune n'existe
    if (conversations.length === 0) {
      const testConversation = {
        _id: generateId(),
        participants: [currentUser._id, 'test_client_id'],
        requestId: 'test_request_id',
        lastMessage: {
          content: 'Message de test',
          senderId: 'test_client_id',
          createdAt: new Date().toISOString(),
        },
        unreadCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      conversations.push(testConversation);
      
      const testMessage = {
        _id: generateId(),
        conversationId: testConversation._id,
        senderId: 'test_client_id',
        content: 'Bonjour ! Je suis un client de test. Vous pouvez me répondre pour tester le chat.',
        readBy: ['test_client_id'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      messages.push(testMessage);
      
      saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
      saveToStorage(STORAGE_KEYS.MESSAGES, messages);
      
      console.log('Données de test créées pour le chat');
    }
  },

  // Vider toutes les données de chat
  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    console.log('Données de chat supprimées');
  },
};
