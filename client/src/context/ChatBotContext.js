import React, { createContext, useState, useCallback, useContext } from 'react';

const ChatBotContext = createContext();

export const ChatBotProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! 👋 I\'m your CampusSkillSwap Assistant. I can help you with questions about skill exchanges, finding friends, feedback, and more. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showCircle, setShowCircle] = useState(true);
  const [openChatBot, setOpenChatBot] = useState(false);

  const addMessage = useCallback((message, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      sender,
      text: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: 'Hello! 👋 I\'m your CampusSkillSwap Assistant. I can help you with questions about skill exchanges, finding friends, feedback, and more. What would you like to know?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return (
    <ChatBotContext.Provider
      value={{
        messages,
        setMessages,
        loading,
        setLoading,
        addMessage,
        showCircle,
        setShowCircle,
        openChatBot,
        setOpenChatBot,
        resetChat,
      }}
    >
      {children}
    </ChatBotContext.Provider>
  );
};

export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within ChatBotProvider');
  }
  return context;
};
