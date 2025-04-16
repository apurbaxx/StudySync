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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendChatMessage(messageText);
      setMessageText('');
    }
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-sm text-indigo-300">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            message.type === 'system' ? (
              // System Message
              <div key={message.id} className="flex justify-center">
                <div className="bg-indigo-800/50 rounded-full px-4 py-1 text-xs text-indigo-300">
                  {message.text}
                </div>
              </div>
            ) : message.userId === user?.id ? (
              // Current User's Message
              <div key={message.id} className="flex flex-col">
                <div className="bg-indigo-700/50 text-sm p-2 rounded-lg max-w-[80%] self-end">
                  <div className="text-xs text-indigo-300 mb-1">You</div>
                  {message.text}
                </div>
              </div>
            ) : (
              // Other User's Message
              <div key={message.id} className="flex flex-col">
                <div className="bg-indigo-900/50 text-sm p-2 rounded-lg max-w-[80%] self-start">
                  <div className="text-xs text-indigo-400 mb-1">{message.username}</div>
                  {message.text}
                </div>
              </div>
            )
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-3 border-t border-indigo-800">
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Send a message..." 
            className="w-full bg-indigo-900/50 rounded-lg border border-indigo-700 px-3 py-2 text-sm placeholder-indigo-400 text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
