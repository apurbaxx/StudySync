import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRoom } from '@/context/RoomContext';
import { useUser } from '@/context/UserContext';
import { getInitials, formatTimeString } from '@/lib/utils';

export function Chat() {
  const { messages, sendChatMessage } = useRoom();
  const { user } = useUser();
  const [messageText, setMessageText] = useState('');
  const [chatVisible, setChatVisible] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && chatVisible) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatVisible]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendChatMessage(messageText);
      setMessageText('');
    }
  };
  
  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 dark:text-white">Chat</h3>
        <div className="flex space-x-2">
          <button 
            onClick={toggleChat}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={chatVisible ? "Hide chat" : "Show chat"}
          >
            <i className={`bx ${chatVisible ? 'bx-hide' : 'bx-show'} text-xl`}></i>
          </button>
          <button 
            onClick={toggleSound}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            <i className={`bx ${soundEnabled ? 'bx-volume-full' : 'bx-volume-mute'} text-xl`}></i>
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div 
        className={`flex-1 p-4 overflow-y-auto no-scrollbar space-y-4 ${chatVisible ? '' : 'hidden'}`}
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            message.type === 'system' ? (
              // System Message
              <div key={message.id} className="flex justify-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1 text-xs text-gray-600 dark:text-gray-400">
                  {message.text}
                </div>
              </div>
            ) : message.userId === user?.id ? (
              // Current User's Message
              <div key={message.id} className="flex items-start flex-row-reverse space-x-reverse space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(message.username || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline justify-end mb-1">
                    <span className="mr-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeString(message.timestamp)}
                    </span>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">You</p>
                  </div>
                  <div className="bg-primary text-white rounded-lg p-3 text-sm">
                    {message.text}
                  </div>
                </div>
              </div>
            ) : (
              // Other User's Message
              <div key={message.id} className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(message.username || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline mb-1">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{message.username}</p>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeString(message.timestamp)}
                    </span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-800 dark:text-gray-200 text-sm">
                    {message.text}
                  </div>
                </div>
              </div>
            )
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input 
            type="text" 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <Button type="submit" className="px-4 py-2 flex items-center justify-center">
            <i className="bx bx-send"></i>
          </Button>
        </form>
      </div>
    </div>
  );
}
